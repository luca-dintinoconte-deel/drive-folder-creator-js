const { google } = require('googleapis');
const stream = require('stream');

const SCOPES = ['https://www.googleapis.com/auth/drive'];

/**
 * Authenticates and returns the Google Drive service.
 */
async function getDriveService() {
  try {
    const serviceAccountJsonB64 = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
    if (!serviceAccountJsonB64) {
      throw new Error('GOOGLE_SERVICE_ACCOUNT_JSON environment variable is not set');
    }

    const decodedJson = Buffer.from(serviceAccountJsonB64, 'base64').toString('utf-8');
    const serviceAccountInfo = JSON.parse(decodedJson);

    const auth = new google.auth.GoogleAuth({
      credentials: serviceAccountInfo,
      scopes: SCOPES,
    });

    return google.drive({ version: 'v3', auth });
  } catch (error) {
    console.error('Failed to authenticate:', error);
    throw error;
  }
}

/**
 * Sanitizes the folder name by removing characters invalid in Windows filenames
 * and stripping whitespace.
 */
function sanitizeName(name) {
  // Remove invalid characters: < > : " / \ | ? *
  // eslint-disable-next-line no-control-regex
  let sanitized = name.replace(/[<>:"/\\|?*]/g, '');
  // Remove control characters
  // eslint-disable-next-line no-control-regex
  sanitized = sanitized.replace(/[\x00-\x1f\x7f]/g, '');
  return sanitized.trim();
}

/**
 * Checks if a folder with the given name exists in the parent folder.
 */
async function folderExists(drive, name, parentId) {
  const query = `name = '${name}' and '${parentId}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false`;
  try {
    const res = await drive.files.list({
      q: query,
      spaces: 'drive',
      fields: 'files(id, name)',
      supportsAllDrives: true,
      includeItemsFromAllDrives: true,
    });
    return res.data.files.length > 0;
  } catch (error) {
    console.error(`Failed to check if folder '${name}' exists:`, error);
    throw error;
  }
}

/**
 * Creates a folder in Google Drive.
 */
async function createFolder(drive, name, parentId = null) {
  const fileMetadata = {
    name: name,
    mimeType: 'application/vnd.google-apps.folder',
  };
  if (parentId) {
    fileMetadata.parents = [parentId];
  }

  try {
    const file = await drive.files.create({
      resource: fileMetadata,
      fields: 'id, webViewLink',
      supportsAllDrives: true,
    });
    console.log(`Created folder '${name}' with ID: ${file.data.id}`);
    return file.data;
  } catch (error) {
    console.error(`Failed to create folder '${name}':`, error);
    throw error;
  }
}

/**
 * Creates the organization folder structure in the specified Shared Drive.
 */
async function createOrgStructure(orgName, parentDriveId) {
  const drive = await getDriveService();

  // 1. Create top-level Organization folder
  const cleanOrgName = sanitizeName(orgName);

  if (await folderExists(drive, cleanOrgName, parentDriveId)) {
    console.warn(`Organization folder '${cleanOrgName}' already exists.`);
    throw new Error(`Organization folder '${cleanOrgName}' already exists.`);
  }

  console.log(`Creating top-level folder for organization: ${cleanOrgName} (original: ${orgName})`);
  const orgFolder = await createFolder(drive, cleanOrgName, parentDriveId);
  const orgFolderId = orgFolder.id;
  const orgFolderUrl = orgFolder.webViewLink;

  // 2. Create nested folders
  const subfolders = [
    "Sales/Pre-sales",
    "Onboarding",
    "Post Onboarding",
    "Legal Notices"
  ];

  for (const folderName of subfolders) {
    // Handle nested paths like "Sales/Pre-sales" if necessary, 
    // but the original python code treated them as single folder names?
    // Checking original python code:
    // subfolders = ["Sales/Pre-sales", ...]
    // for folder_name in subfolders: create_folder(..., folder_name, ...)
    // It seems it created folders with slashes in the name? 
    // Google Drive allows slashes in folder names. 
    // So "Sales/Pre-sales" will be a single folder named "Sales/Pre-sales".
    // I will keep this behavior to match the original.
    await createFolder(drive, folderName, orgFolderId);
  }

  return {
    id: orgFolderId,
    url: orgFolderUrl,
  };
}

module.exports = {
  createOrgStructure,
};
