export interface IGoogleDirveInputForGettingList {
  accessToken: string;
  savePath: string;
}

export interface IGoogleDriveInput {
  accessToken: string;
  fileBuffer: Buffer;
  fileName: string;
  mimeType: string;
}

export interface IGoogleDriveOutput {
  id: string;
  name: string;
  webViewLink: string;
}
