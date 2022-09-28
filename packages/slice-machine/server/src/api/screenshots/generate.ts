import Files from "../../../../lib/utils/files";
import { BackendEnvironment } from "../../../../lib/models/common/Environment";
import * as NodeUtils from "@slicemachine/core/build/node-utils";
import Puppeteer from "./puppeteer";
import { resolvePathsToScreenshot } from "@slicemachine/core/build/libraries/screenshot";
import {
  createScreenshotUI,
  ScreenshotUI,
} from "../../../../lib/models/common/ComponentUI";
import { Screenshots } from "../../../../lib/models/common/Screenshots";
import { SliceSM, VariationSM } from "@slicemachine/core/build/models";
import { hash } from "@slicemachine/core/build/utils/str";

import * as IO from "../../../../lib/io";

type FailedScreenshot = {
  variationId: VariationSM["id"];
  error: Error;
};

export interface ScreenshotResults {
  screenshots: Screenshots;
  failure: FailedScreenshot[];
}

export async function generateScreenshotAndRemoveCustom(
  env: BackendEnvironment,
  libraryName: string,
  sliceName: string,
  variationId: string,
  screenWidth: string
): Promise<ScreenshotResults> {
  const { screenshots, failure } = await generateScreenshot(
    env,
    libraryName,
    sliceName,
    variationId,
    screenWidth
  );

  removeCustomScreenshot(env, libraryName, sliceName, variationId);

  return {
    screenshots: screenshots,
    failure: failure,
  };
}

export async function generateScreenshot(
  env: BackendEnvironment,
  libraryName: string,
  sliceName: string,
  variationId: string,
  screenWidth: string
): Promise<ScreenshotResults> {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const slice = IO.Slice.readSlice(
    NodeUtils.CustomPaths(env.cwd).library(libraryName).slice(sliceName).model()
  );

  const promises: Promise<ScreenshotUI>[] = [variationId].map(
    (id: VariationSM["id"]) =>
      generateForVariation(env, libraryName, slice, id, screenWidth)
  );

  const results = await Promise.allSettled(promises);

  return results.reduce(
    (acc: ScreenshotResults, result: PromiseSettledResult<ScreenshotUI>) => {
      const key = variationId;

      const screenshots =
        result.status === "fulfilled"
          ? {
              ...acc.screenshots,
              [key]: result.value,
            }
          : acc.screenshots;

      const failure =
        result.status === "rejected"
          ? [
              ...acc.failure,
              { error: result.reason as Error, variationId: key },
            ]
          : acc.failure;

      return { screenshots, failure };
    },
    { screenshots: {}, failure: [] } as ScreenshotResults
  );
}

async function generateForVariation(
  env: BackendEnvironment,
  libraryName: string,
  slice: SliceSM,
  variationId: string,
  screenWidth: string
): Promise<ScreenshotUI> {
  const screenshotUrl = `${
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    env.manifest.localSliceSimulatorURL
  }?lid=${encodeURIComponent(libraryName)}&sid=${encodeURIComponent(
    slice.id
  )}&vid=${encodeURIComponent(variationId)}`;

  const pathToFile = NodeUtils.GeneratedPaths(env.cwd)
    .library(libraryName)
    .slice(slice.name)
    .variation(variationId)
    .preview();

  await Puppeteer.handleScreenshot({
    screenshotUrl,
    pathToFile,
    screenWidth,
  });
  return createScreenshotUI(env.baseUrl, {
    path: pathToFile,
    hash: hash(Files.readString(pathToFile)),
  });
}

export function removeCustomScreenshot(
  env: BackendEnvironment,
  libraryName: string,
  sliceName: string,
  variationId: string
): void {
  const maybeCustomScreenshot = resolvePathsToScreenshot({
    paths: [env.cwd],
    from: libraryName,
    sliceName,
    variationId,
  });
  if (maybeCustomScreenshot) Files.remove(maybeCustomScreenshot.path);
}
