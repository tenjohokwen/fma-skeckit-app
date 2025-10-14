/**
 * DriveService.gs
 *
 * Provides Google Drive operations for folder and file management.
 * Handles client folders, case folders, and file operations.
 *
 * Per constitution: Service layer for Drive interactions.
 */

const DriveService = {
  /**
   * Gets or creates the root "cases" folder
   * @returns {GoogleAppsScript.Drive.Folder} Cases root folder
   */
  getCasesRootFolder: function() {
    const folderName = 'cases';
    const folders = DriveApp.getFoldersByName(folderName);

    if (folders.hasNext()) {
      return folders.next();
    }

    // Create if doesn't exist
    return DriveApp.createFolder(folderName);
  },

  /**
   * Searches for a client folder by name pattern
   * @param {string} firstName - Client's first name
   * @param {string} lastName - Client's last name
   * @param {string} idCardNo - Client's ID card number
   * @returns {Object|null} Folder info or null if not found
   */
  searchClientFolder: function(firstName, lastName, idCardNo) {
    const folderName = `${firstName}_${lastName}_${idCardNo}`;
    const rootFolder = this.getCasesRootFolder();

    // Search for folder in cases root
    const folders = rootFolder.getFoldersByName(folderName);

    if (folders.hasNext()) {
      const folder = folders.next();
      return {
        folderId: folder.getId(),
        folderName: folder.getName(),
        folderPath: `cases/${folder.getName()}`,
        createdAt: DateUtil.formatTimestamp(folder.getDateCreated())
      };
    }

    return null;
  },

  /**
   * Creates a new client folder in the cases root folder
   * @param {Object} clientData - Client information
   * @param {string} currentUser - Email of user creating the folder
   * @returns {Object} Created folder information
   */
  createClientFolder: function(clientData, currentUser) {
    const { firstName, lastName, idCardNo, telephone, email } = clientData;

    // Validate required fields
    if (!firstName || !lastName || !idCardNo) {
      throw ResponseHandler.validationError(
        'First name, last name, and ID card number are required',
        'file.folder.create.error.missingFields'
      );
    }

    // Generate folder name
    const folderName = `${firstName}_${lastName}_${idCardNo}`;

    // Check if folder already exists
    const existing = this.searchClientFolder(firstName, lastName, idCardNo);
    if (existing) {
      throw ResponseHandler.error({
        status: 400,
        msgKey: 'file.folder.create.error.exists',
        message: 'Client folder already exists',
        data: {
          existingFolderId: existing.folderId
        }
      });
    }

    // Get root folder
    const rootFolder = this.getCasesRootFolder();

    // Create client folder
    const clientFolder = rootFolder.createFolder(folderName);

    // Set folder description with client info
    const description = `Client: ${firstName} ${lastName}\nID: ${idCardNo}`;
    if (telephone) {
      clientFolder.setDescription(description + `\nPhone: ${telephone}`);
    }
    if (email) {
      clientFolder.setDescription(clientFolder.getDescription() + `\nEmail: ${email}`);
    }

    const now = DateUtil.getCurrentTimestamp();

    return {
      folderId: clientFolder.getId(),
      folderName: clientFolder.getName(),
      folderPath: `cases/${clientFolder.getName()}`,
      firstName: firstName,
      lastName: lastName,
      idCardNo: idCardNo,
      telephone: telephone || '',
      email: email || '',
      createdBy: currentUser,
      createdAt: now
    };
  },

  /**
   * Creates a case folder within a client folder
   * @param {string} clientFolderId - Parent client folder ID
   * @param {string} caseId - Case identifier (becomes folder name)
   * @param {string} currentUser - Email of user creating the folder
   * @returns {Object} Created folder information
   */
  createCaseFolder: function(clientFolderId, caseId, currentUser) {
    if (!clientFolderId || !caseId) {
      throw ResponseHandler.validationError(
        'Client folder ID and case ID are required',
        'file.casefolder.create.error.missingFields'
      );
    }

    // Get client folder
    let clientFolder;
    try {
      clientFolder = DriveApp.getFolderById(clientFolderId);
    } catch (e) {
      throw ResponseHandler.notFoundError(
        'Client folder not found',
        'file.casefolder.create.error.clientNotFound'
      );
    }

    // Check if case folder already exists
    const existingFolders = clientFolder.getFoldersByName(caseId);
    if (existingFolders.hasNext()) {
      const existing = existingFolders.next();
      throw ResponseHandler.error({
        status: 400,
        msgKey: 'file.casefolder.create.error.exists',
        message: 'Case folder already exists',
        data: {
          existingFolderId: existing.getId()
        }
      });
    }

    // Create case folder
    const caseFolder = clientFolder.createFolder(caseId);

    const now = DateUtil.getCurrentTimestamp();
    const clientFolderName = clientFolder.getName();

    return {
      folderId: caseFolder.getId(),
      folderName: caseFolder.getName(),
      caseId: caseId,
      parentFolderId: clientFolderId,
      folderPath: `cases/${clientFolderName}/${caseId}`,
      createdBy: currentUser,
      createdAt: now
    };
  },

  /**
   * Lists all folders in a given folder
   * @param {string} folderId - Folder ID to list contents
   * @returns {Array} Array of folder objects
   */
  listFolders: function(folderId) {
    let folder;
    try {
      folder = DriveApp.getFolderById(folderId);
    } catch (e) {
      throw ResponseHandler.notFoundError(
        'Folder not found',
        'file.folder.error.notFound'
      );
    }

    const folders = [];
    const subfolders = folder.getFolders();

    while (subfolders.hasNext()) {
      const subfolder = subfolders.next();
      folders.push({
        folderId: subfolder.getId(),
        folderName: subfolder.getName(),
        createdAt: DateUtil.formatTimestamp(subfolder.getDateCreated())
      });
    }

    return folders;
  },

  /**
   * Checks if a file with the given name exists in a folder
   * @param {string} folderId - Folder ID to search in
   * @param {string} fileName - File name to check
   * @returns {Object|null} File info if exists, null otherwise
   */
  checkFileExists: function(folderId, fileName) {
    let folder;
    try {
      folder = DriveApp.getFolderById(folderId);
    } catch (e) {
      throw ResponseHandler.notFoundError(
        'Folder not found',
        'file.folder.error.notFound'
      );
    }

    const files = folder.getFilesByName(fileName);

    if (files.hasNext()) {
      const file = files.next();
      return {
        fileId: file.getId(),
        fileName: file.getName(),
        mimeType: file.getMimeType(),
        size: file.getSize()
      };
    }

    return null;
  },

  /**
   * Uploads a file to a folder
   * @param {string} folderId - Target folder ID
   * @param {string} fileName - File name
   * @param {Blob} fileBlob - File blob data
   * @param {string} currentUser - User uploading the file
   * @returns {Object} Uploaded file information
   */
  uploadFile: function(folderId, fileName, fileBlob, currentUser) {
    let folder;
    try {
      folder = DriveApp.getFolderById(folderId);
    } catch (e) {
      throw ResponseHandler.notFoundError(
        'Folder not found',
        'file.upload.error.folderNotFound'
      );
    }

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024; // 10MB in bytes
    const fileSize = fileBlob.getBytes().length;

    if (fileSize > maxSize) {
      throw ResponseHandler.error({
        status: 400,
        msgKey: 'file.upload.error.size',
        message: 'File exceeds maximum size of 10MB',
        data: {
          maxSize: maxSize,
          actualSize: fileSize
        }
      });
    }

    // Validate file name (no invalid characters)
    const invalidChars = /[<>:"/\\|?*]/g;
    if (invalidChars.test(fileName)) {
      throw ResponseHandler.error({
        status: 400,
        msgKey: 'file.upload.error.filename',
        message: 'File name contains invalid characters',
        data: null
      });
    }

    // Check for existing file (conflict detection)
    const existingFile = this.checkFileExists(folderId, fileName);
    if (existingFile) {
      // Return conflict indicator
      return {
        conflict: true,
        existingFileId: existingFile.fileId,
        fileName: fileName
      };
    }

    // Upload the file
    const file = folder.createFile(fileBlob.setName(fileName));
    const now = DateUtil.getCurrentTimestamp();

    // Get folder path for display
    const folderPath = this.getFolderPath(folder);

    return {
      conflict: false,
      file: {
        fileId: file.getId(),
        fileName: file.getName(),
        mimeType: file.getMimeType(),
        size: file.getSize(),
        parentFolderId: folderId,
        filePath: `${folderPath}/${fileName}`,
        uploadedBy: currentUser,
        uploadedAt: now,
        downloadUrl: `https://drive.google.com/uc?export=download&id=${file.getId()}`
      }
    };
  },

  /**
   * Resolves a file upload conflict
   * @param {string} folderId - Target folder ID
   * @param {string} fileName - File name
   * @param {Blob} fileBlob - File blob data
   * @param {string} resolution - Resolution type: "overwrite", "rename", or "cancel"
   * @param {string} currentUser - User uploading the file
   * @returns {Object} Resolution result
   */
  resolveFileConflict: function(folderId, fileName, fileBlob, resolution, currentUser) {
    let folder;
    try {
      folder = DriveApp.getFolderById(folderId);
    } catch (e) {
      throw ResponseHandler.notFoundError(
        'Folder not found',
        'file.upload.error.folderNotFound'
      );
    }

    if (resolution === 'cancel') {
      // User cancelled upload
      return {
        action: 'cancel',
        message: 'Upload cancelled by user'
      };
    }

    if (resolution === 'overwrite') {
      // Delete existing file and upload new one
      const existingFile = this.checkFileExists(folderId, fileName);
      if (existingFile) {
        try {
          const fileToDelete = DriveApp.getFileById(existingFile.fileId);
          fileToDelete.setTrashed(true);
        } catch (e) {
          Logger.log('Error deleting existing file: ' + e.toString());
        }
      }

      // Upload the new file
      const file = folder.createFile(fileBlob.setName(fileName));
      const now = DateUtil.getCurrentTimestamp();
      const folderPath = this.getFolderPath(folder);

      return {
        action: 'overwrite',
        previousFileDeleted: true,
        file: {
          fileId: file.getId(),
          fileName: file.getName(),
          mimeType: file.getMimeType(),
          size: file.getSize(),
          parentFolderId: folderId,
          filePath: `${folderPath}/${fileName}`,
          uploadedBy: currentUser,
          uploadedAt: now,
          downloadUrl: `https://drive.google.com/uc?export=download&id=${file.getId()}`
        }
      };
    }

    if (resolution === 'rename') {
      // Generate new file name with timestamp
      const timestamp = DateUtil.getCurrentTimestamp().replace(/[-:\s]/g, '').substring(0, 14);
      const nameParts = fileName.split('.');
      const extension = nameParts.length > 1 ? '.' + nameParts.pop() : '';
      const baseName = nameParts.join('.');
      const newFileName = `${baseName}_${timestamp}${extension}`;

      // Upload with new name
      const file = folder.createFile(fileBlob.setName(newFileName));
      const now = DateUtil.getCurrentTimestamp();
      const folderPath = this.getFolderPath(folder);

      return {
        action: 'rename',
        originalFileName: fileName,
        file: {
          fileId: file.getId(),
          fileName: file.getName(),
          mimeType: file.getMimeType(),
          size: file.getSize(),
          parentFolderId: folderId,
          filePath: `${folderPath}/${newFileName}`,
          uploadedBy: currentUser,
          uploadedAt: now,
          downloadUrl: `https://drive.google.com/uc?export=download&id=${file.getId()}`
        }
      };
    }

    throw ResponseHandler.validationError(
      'Invalid resolution type. Must be overwrite, rename, or cancel',
      'file.conflict.error.invalidResolution'
    );
  },

  /**
   * Gets the full path of a folder
   * @param {GoogleAppsScript.Drive.Folder} folder - Folder object
   * @returns {string} Full folder path
   */
  getFolderPath: function(folder) {
    const path = [];
    let currentFolder = folder;

    // Build path by traversing parents
    while (currentFolder.getName() !== 'cases') {
      path.unshift(currentFolder.getName());
      const parents = currentFolder.getParents();
      if (parents.hasNext()) {
        currentFolder = parents.next();
      } else {
        break;
      }
    }

    return 'cases/' + path.join('/');
  },

  /**
   * Lists all files in a folder
   * @param {string} folderId - Folder ID
   * @returns {Array} Array of file objects
   */
  listFiles: function(folderId) {
    let folder;
    try {
      folder = DriveApp.getFolderById(folderId);
    } catch (e) {
      throw ResponseHandler.notFoundError(
        'Folder not found',
        'file.folder.error.notFound'
      );
    }

    const files = [];
    const fileIterator = folder.getFiles();

    while (fileIterator.hasNext()) {
      const file = fileIterator.next();
      files.push({
        fileId: file.getId(),
        fileName: file.getName(),
        mimeType: file.getMimeType(),
        size: file.getSize(),
        createdAt: DateUtil.formatTimestamp(file.getDateCreated()),
        downloadUrl: `https://drive.google.com/uc?export=download&id=${file.getId()}`
      });
    }

    return files;
  },

  /**
   * Deletes a file from Drive
   * @param {string} fileId - File ID to delete
   * @returns {Object} Deletion result
   */
  deleteFile: function(fileId) {
    let file;
    try {
      file = DriveApp.getFileById(fileId);
    } catch (e) {
      throw ResponseHandler.notFoundError(
        'File not found',
        'file.delete.error.notFound'
      );
    }

    const fileName = file.getName();
    file.setTrashed(true);

    return {
      fileId: fileId,
      fileName: fileName,
      deleted: true
    };
  }
};
