export enum ModalKeysEnum {
  LOGIN = "LOGIN",
  CREATE_CUSTOM_TYPE = "CREATE_CUSTOM_TYPE",
  RENAME_CUSTOM_TYPE = "RENAME_CUSTOM_TYPE",
  CREATE_SLICE = "CREATE_SLICE",
  RENAME_SLICE = "RENAME_SLICE",
  SCREENSHOT_PREVIEW = "SCREENSHOT_PREVIEW",
  SCREENSHOTS = "SCREENSHOTS",
  DELETE_CUSTOM_TYPE = "DELETE_CUSTOM_TYPE",
  DELETE_SLICE = "DELETE_SLICE",
  DELETE_DOCUMENTS_DRAWER = "DELETE_DOCUMENTS_DRAWER",
  DELETE_DOCUMENTS_DRAWER_OVER_LIMIT = "DELETE_DOCUMENTS_DRAWER_OVER_LIMIT",
}

export type ModalStoreType = Record<ModalKeysEnum, boolean>;
