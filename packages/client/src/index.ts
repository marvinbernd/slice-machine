import axios, { AxiosError, AxiosPromise, AxiosRequestConfig } from "axios";
import * as t from "io-ts";

import { UserProfile } from "@slicemachine/core/build/models";
import { SharedSlice } from "@prismicio/types-internal/lib/customtypes/widgets/slices";
import { CustomType } from "@prismicio/types-internal/lib/customtypes/CustomType";

import type { Acl, ClientError, UploadParameters } from "./models";
import {
  ApplicationMode,
  getStatus,
  getMessage,
  ApisEndpoints,
  ProductionApisEndpoints,
  StageApisEndpoints,
  AclCreateResult,
} from "./models";

import { getAndValidateResponse } from "./utils";
import { uploadScreenshot } from "./utils/uploadScreenshot";

// exporting models to be used with the Client.
export * from "./models";

// exporting utils so the client calls can be replicated for speficic calls to a consumer.
export * from "./utils";

// exporting the client itself.
export class Client {
  apisEndpoints: ApisEndpoints;
  repository: string | null;
  authenticationToken: string;

  constructor(
    applicationMode: ApplicationMode,
    repository: string | null,
    authenticationToken: string
  ) {
    this.repository = repository;
    this.authenticationToken = authenticationToken;

    if (applicationMode === ApplicationMode.PROD)
      this.apisEndpoints = ProductionApisEndpoints;
    else if (applicationMode === ApplicationMode.STAGE)
      this.apisEndpoints = StageApisEndpoints;
    else {
      // Dev
      this.apisEndpoints = ProductionApisEndpoints;
    }
  }

  // setters to provide flexibility
  updateAuthenticationToken(newToken: string): Client {
    this.authenticationToken = newToken;
    return this;
  }

  updateRepository(repository: string | null): Client {
    this.repository = repository;
    return this;
  }

  // private methods
  _fetch({
    method,
    url,
    data,
    headers,
  }: AxiosRequestConfig<Record<string, unknown>>): AxiosPromise {
    return axios({
      method,
      url,
      data,
      headers: {
        Authorization: `Bearer ${this.authenticationToken}`,
        "User-Agent": "slice-machine",
        ...(this.repository ? { repository: this.repository } : {}),
        ...headers,
      },
    });
  }

  _get(url: string): AxiosPromise {
    return this._fetch({ method: "get", url });
  }

  _post(url: string, data: Record<string, unknown>): AxiosPromise {
    return this._fetch({ method: "post", url, data }).catch(
      (error: Error | AxiosError) => {
        const status: number = getStatus(error);
        const message: string = getMessage(error);

        // Making sure the error is typed
        const clientError: ClientError = { status, message };
        return Promise.reject(clientError);
      }
    );
  }

  async validateAuthenticationToken(): Promise<boolean> {
    return this._get(
      `${this.apisEndpoints.Authentication}validate?token=${this.authenticationToken}`
    )
      .then(() => true)
      .catch((error: Error | AxiosError) => {
        const status: number = getStatus(error);
        if (status == 401) return false;

        const message: string = getMessage(error);

        // Making sure the error is typed
        const clientError: ClientError = { status, message };
        return Promise.reject(clientError);
      });
  }

  async refreshAuthenticationToken(): Promise<string> {
    return getAndValidateResponse<string>(
      this._get(
        `${this.apisEndpoints.Authentication}refreshtoken?token=${this.authenticationToken}`
      ),
      "refreshed authentication token",
      t.string
    ).then((newToken) => {
      this.updateAuthenticationToken(newToken);
      return newToken;
    });
  }

  async profile(): Promise<UserProfile> {
    return getAndValidateResponse<UserProfile>(
      this._get(`${this.apisEndpoints.Users}profile`),
      "user profile",
      UserProfile
    );
  }

  async getSlices(): Promise<SharedSlice[]> {
    return getAndValidateResponse<SharedSlice[]>(
      this._get(`${this.apisEndpoints.Models}slices`),
      "shared slices",
      t.array(SharedSlice)
    );
  }

  async getCustomTypes(): Promise<CustomType[]> {
    return getAndValidateResponse<CustomType[]>(
      this._get(`${this.apisEndpoints.Models}customtypes`),
      "custom types",
      t.array(CustomType)
    );
  }

  async insertCustomType(customType: CustomType): Promise<AxiosPromise> {
    return this._post(
      `${this.apisEndpoints.Models}customtypes/insert`,
      customType
    );
  }

  async updateCustomType(customType: CustomType): Promise<AxiosPromise> {
    return this._post(
      `${this.apisEndpoints.Models}customtypes/update`,
      customType
    );
  }

  async insertSlice(sharedSlice: SharedSlice): Promise<AxiosPromise> {
    return this._post(`${this.apisEndpoints.Models}slices/insert`, sharedSlice);
  }

  async updateSlice(sharedSlice: SharedSlice): Promise<AxiosPromise> {
    return this._post(`${this.apisEndpoints.Models}slices/update`, sharedSlice);
  }

  async createAcl(): Promise<Acl> {
    return getAndValidateResponse<AclCreateResult>(
      this._get(`${this.apisEndpoints.AclProvider}create`),
      "acl",
      AclCreateResult
    ).then((result: AclCreateResult) => {
      const errorMessage: string | undefined =
        result.error || result.Message || result.message;

      if (errorMessage) {
        const error: ClientError = { status: 500, message: errorMessage };
        return Promise.reject(error);
      }

      const {
        values: { url, fields },
        imgixEndpoint,
      } = result;

      return {
        url,
        fields,
        imgixEndpoint,
      };
    });
  }

  async deleteScreenshotFolder(sliceName: string): Promise<AxiosPromise> {
    return this._post(`${this.apisEndpoints.AclProvider}delete-folder`, {
      sliceName,
    });
  }

  // return the url of the new asset;
  async uploadScreenshot(params: UploadParameters): Promise<string> {
    if (!this.repository)
      return Promise.reject({
        status: 500,
        message: "Repository missing to send screenshots",
      });
    return uploadScreenshot({ ...params, repository: this.repository }).catch(
      (error: Error) => {
        const clientError: ClientError = {
          status: 500,
          message: error.message,
        };
        return Promise.reject(clientError);
      }
    );
  }
}