import { google } from "googleapis";
import { Readable } from "stream";
import {
  IGoogleDriveInput,
  IGoogleDriveOutput,
  IGoogleDirveInputForGettingList,
} from "../../interface/documents";

export async function getOrCreateFolderIdFromGoogleDrive(
  params: IGoogleDirveInputForGettingList
): Promise<string> {
  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: params.accessToken });

  const drive = google.drive({ version: "v3", auth });
  const folders = params.savePath.split("/");
  let parentId: string | undefined = undefined;

  for (let folderName of folders) {
    const qParts = [
      `name='${folderName}'`,
      `mimeType='application/vnd.google-apps.folder'`,
      `trashed = false`,
    ];

    if (parentId) {
      qParts.push(`'${parentId}' in parents`);
    }

    const searchResponse = await drive.files.list({
      q: qParts.join(" and "),
      fields: "files(id, name)",
      spaces: "drive",
    });

    let folder = searchResponse.data.files?.[0];
    if (!folder) {
      const createRes: any = await drive.files.create({
        requestBody: {
          name: folderName,
          mimeType: "application/vnd.google-apps.folder",
          parents: parentId ? [parentId] : undefined,
        },
        fields: "id",
      });

      folder = { id: createRes.data.id! };
    }

    parentId = folder.id!;
  }

  return parentId!;
}

export async function uploadToGoogleDrive(
  params: IGoogleDriveInput
): Promise<IGoogleDriveOutput> {
  const saveDir = `TestDocumentManagementSystem/test`;
  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: params.accessToken });

  const folderId = await getOrCreateFolderIdFromGoogleDrive({
    accessToken: params.accessToken,
    savePath: saveDir,
  });
  const drive = google.drive({ version: "v3", auth });

  const fileMetadata = { name: params.fileName, parents: [folderId] };
  const media = {
    mimeType: params.mimeType,
    body: Readable.from(params.fileBuffer),
  };

  const response = await drive.files.create({
    requestBody: fileMetadata,
    media,
    fields: "id, name, webViewLink",
  });

  return {
    id: response.data.id as string,
    name: response.data.name as string,
    webViewLink: response.data.webViewLink as string,
  };
}
