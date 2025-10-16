/**
 * FileHandler.gs
 *
 * Handles file and folder operations for client and case management.
 * Provides endpoints for creating, searching, and managing client folders.
 *
 * Per constitution: Admin-only endpoints with proper authorization checks.
 */

const FileHandler = {
  /**
   * Searches for a client folder by name (firstName, lastName, idCardNo)
   * Admin only endpoint
   *
   * @param {Object} context - Request context from Router
   * @param {Object} context.data - Request parameters
   * @param {string} context.data.firstName - Client's first name
   * @param {string} context.data.lastName - Client's last name
   * @param {string} context.data.idCardNo - Client's ID card number
   * @param {Object} context.user - Current user
   * @returns {Object} Response with folder info or null if not found
   */
  searchClientFolder: function(context) {
    try {
      // Admin-only authorization check
      if (!context.user || context.user.role !== 'ROLE_ADMIN') {
        throw ResponseHandler.forbiddenError(
          'Admin access required',
          'error.forbidden'
        );
      }

      // Validate required fields
      const { firstName, lastName, idCardNo } = context.data;

      if (!firstName || !lastName || !idCardNo) {
        throw ResponseHandler.validationError(
          'First name, last name, and ID card number are required',
          'file.folder.search.error.missingFields'
        );
      }

      // Search for client folder
      const folderInfo = DriveService.searchClientFolder(firstName, lastName, idCardNo);

      if (folderInfo) {
        return {
          status: 200,
          msgKey: 'file.folder.search.success',
          message: 'Client folder found',
          data: folderInfo
        };
      } else {
        return {
          status: 200,
          msgKey: 'file.folder.search.notFound',
          message: 'Client folder not found',
          data: null
        };
      }

    } catch (error) {
      Logger.log('Error in FileHandler.searchClientFolder: ' + error.toString());

      if (error.status) {
        throw error;
      }

      throw ResponseHandler.serverError(
        'Failed to search for client folder: ' + error.toString(),
        'error.server'
      );
    }
  },

  /**
   * Creates a new client folder in Google Drive
   * Admin only endpoint
   *
   * @param {Object} context - Request context from Router
   * @param {Object} context.data - Request parameters
   * @param {string} context.data.firstName - Client's first name
   * @param {string} context.data.lastName - Client's last name
   * @param {string} context.data.idCardNo - Client's ID card number
   * @param {string} [context.data.telephone] - Client's telephone number (optional)
   * @param {string} [context.data.email] - Client's email address (optional)
   * @param {Object} context.user - Current user
   * @returns {Object} Response with created folder information
   */
  createClientFolder: function(context) {
    try {
      // Admin-only authorization check
      if (!context.user || context.user.role !== 'ROLE_ADMIN') {
        throw ResponseHandler.forbiddenError(
          'Admin access required',
          'error.forbidden'
        );
      }

      // Validate required fields
      const { firstName, lastName, idCardNo, telephone, email } = context.data;

      if (!firstName || !lastName || !idCardNo) {
        throw ResponseHandler.validationError(
          'First name, last name, and ID card number are required',
          'file.folder.create.error.missingFields'
        );
      }

      // Prepare client data
      const clientData = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        idCardNo: idCardNo.trim(),
        telephone: telephone ? telephone.trim() : '',
        email: email ? email.trim() : ''
      };

      // Get current user email
      const currentUser = context.user.email;

      // Create client folder (DriveService handles duplicate check)
      const folderInfo = DriveService.createClientFolder(clientData, currentUser);

      return {
        status: 200,
        msgKey: 'file.folder.create.success',
        message: 'Client folder created successfully',
        data: folderInfo
      };

    } catch (error) {
      Logger.log('Error in FileHandler.createClientFolder: ' + error.toString());

      if (error.status) {
        throw error;
      }

      throw ResponseHandler.serverError(
        'Failed to create client folder: ' + error.toString(),
        'error.server'
      );
    }
  },

  /**
   * Creates a case folder within a client folder
   * Admin only endpoint
   *
   * @param {Object} context - Request context from Router
   * @param {Object} context.data - Request parameters
   * @param {string} context.data.clientFolderId - Parent client folder ID
   * @param {string} context.data.caseId - Case identifier (becomes folder name)
   * @param {Object} context.user - Current user
   * @returns {Object} Response with created folder information
   */
  createCaseFolder: function(context) {
    try {
      // Admin-only authorization check
      if (!context.user || context.user.role !== 'ROLE_ADMIN') {
        throw ResponseHandler.forbiddenError(
          'Admin access required',
          'error.forbidden'
        );
      }

      // Validate required fields
      const { clientFolderId, caseId } = context.data;

      if (!clientFolderId || !caseId) {
        throw ResponseHandler.validationError(
          'Client folder ID and case ID are required',
          'file.casefolder.create.error.missingFields'
        );
      }

      // Get current user email
      const currentUser = context.user.email;

      // Create case folder (DriveService handles duplicate check and parent validation)
      const folderInfo = DriveService.createCaseFolder(
        clientFolderId.trim(),
        caseId.trim(),
        currentUser
      );

      return {
        status: 200,
        msgKey: 'file.casefolder.create.success',
        message: 'Case folder created successfully',
        data: folderInfo
      };

    } catch (error) {
      Logger.log('Error in FileHandler.createCaseFolder: ' + error.toString());

      if (error.status) {
        throw error;
      }

      throw ResponseHandler.serverError(
        'Failed to create case folder: ' + error.toString(),
        'error.server'
      );
    }
  },

  /**
   * Lists all folders within a given folder
   * Admin only endpoint
   *
   * @param {Object} context - Request context from Router
   * @param {Object} context.data - Request parameters
   * @param {string} context.data.folderId - Folder ID to list contents
   * @param {Object} context.user - Current user
   * @returns {Object} Response with array of folder objects
   */
  listFolders: function(context) {
    try {
      // Admin-only authorization check
      if (!context.user || context.user.role !== 'ROLE_ADMIN') {
        throw ResponseHandler.forbiddenError(
          'Admin access required',
          'error.forbidden'
        );
      }

      // Validate required fields
      const { folderId } = context.data;

      if (!folderId) {
        throw ResponseHandler.validationError(
          'Folder ID is required',
          'file.folder.list.error.missingFields'
        );
      }

      // List folders (DriveService handles folder not found)
      const folders = DriveService.listFolders(folderId.trim());

      return {
        status: 200,
        msgKey: 'file.folder.list.success',
        message: 'Folders listed successfully',
        data: {
          folders: folders,
          count: folders.length
        }
      };

    } catch (error) {
      Logger.log('Error in FileHandler.listFolders: ' + error.toString());

      if (error.status) {
        throw error;
      }

      throw ResponseHandler.serverError(
        'Failed to list folders: ' + error.toString(),
        'error.server'
      );
    }
  },

  /**
   * Uploads a file to a folder with conflict detection
   * Admin only endpoint
   *
   * @param {Object} context - Request context from Router
   * @param {Object} context.data - Request parameters
   * @param {string} context.data.folderId - Target folder ID
   * @param {string} context.data.fileName - File name
   * @param {Blob} context.data.fileBlob - File blob data
   * @param {Object} context.user - Current user
   * @returns {Object} Response with file info or conflict indicator
   */
  uploadFile: function(context) {
    try {
      // Admin-only authorization check
      if (!context.user || context.user.role !== 'ROLE_ADMIN') {
        throw ResponseHandler.forbiddenError(
          'Admin access required',
          'error.forbidden'
        );
      }

      // Validate required fields
      const { folderId, fileName, fileBlob } = context.data;

      if (!folderId || !fileName || !fileBlob) {
        throw ResponseHandler.validationError(
          'Folder ID, file name, and file data are required',
          'file.upload.error.missingFields'
        );
      }

      // Get current user
      const currentUser = context.user.email;

      // Upload file (DriveService handles validation and conflict detection)
      const result = DriveService.uploadFile(
        folderId.trim(),
        fileName.trim(),
        fileBlob,
        currentUser
      );

      // Check if conflict detected
      if (result.conflict) {
        return {
          status: 200,
          msgKey: 'file.upload.conflict',
          message: 'File with this name already exists',
          data: {
            conflict: true,
            existingFileId: result.existingFileId,
            fileName: result.fileName
          }
        };
      }

      // No conflict - file uploaded successfully
      return {
        status: 200,
        msgKey: 'file.upload.success',
        message: 'File uploaded successfully',
        data: {
          file: result.file,
          conflict: false
        }
      };

    } catch (error) {
      Logger.log('Error in FileHandler.uploadFile: ' + error.toString());

      if (error.status) {
        throw error;
      }

      throw ResponseHandler.serverError(
        'Failed to upload file: ' + error.toString(),
        'error.server'
      );
    }
  },

  /**
   * Resolves a file upload conflict
   * Admin only endpoint
   *
   * @param {Object} context - Request context from Router
   * @param {Object} context.data - Request parameters
   * @param {string} context.data.folderId - Target folder ID
   * @param {string} context.data.fileName - Original file name
   * @param {string} context.data.resolution - Resolution type: "overwrite", "rename", or "cancel"
   * @param {Blob} context.data.fileBlob - File blob data
   * @param {Object} context.user - Current user
   * @returns {Object} Response with resolution result
   */
  resolveFileConflict: function(context) {
    try {
      // Admin-only authorization check
      if (!context.user || context.user.role !== 'ROLE_ADMIN') {
        throw ResponseHandler.forbiddenError(
          'Admin access required',
          'error.forbidden'
        );
      }

      // Validate required fields
      const { folderId, fileName, resolution, fileBlob } = context.data;

      if (!folderId || !fileName || !resolution || !fileBlob) {
        throw ResponseHandler.validationError(
          'Folder ID, file name, resolution, and file data are required',
          'file.conflict.error.missingFields'
        );
      }

      // Validate resolution type
      const validResolutions = ['overwrite', 'rename', 'cancel'];
      if (!validResolutions.includes(resolution)) {
        throw ResponseHandler.validationError(
          'Resolution must be overwrite, rename, or cancel',
          'file.conflict.error.invalidResolution'
        );
      }

      // Get current user
      const currentUser = context.user.email;

      // Resolve conflict
      const result = DriveService.resolveFileConflict(
        folderId.trim(),
        fileName.trim(),
        fileBlob,
        resolution,
        currentUser
      );

      // Handle cancel action
      if (result.action === 'cancel') {
        return {
          status: 200,
          msgKey: 'file.conflict.cancel.success',
          message: 'Upload cancelled by user',
          data: {
            action: 'cancel',
            message: result.message
          }
        };
      }

      // Handle overwrite action
      if (result.action === 'overwrite') {
        return {
          status: 200,
          msgKey: 'file.conflict.overwrite.success',
          message: 'File overwritten successfully',
          data: {
            file: result.file,
            action: 'overwrite',
            previousFileDeleted: result.previousFileDeleted
          }
        };
      }

      // Handle rename action
      if (result.action === 'rename') {
        return {
          status: 200,
          msgKey: 'file.conflict.rename.success',
          message: 'File uploaded with new name',
          data: {
            file: result.file,
            action: 'rename',
            originalFileName: result.originalFileName
          }
        };
      }

    } catch (error) {
      Logger.log('Error in FileHandler.resolveFileConflict: ' + error.toString());

      if (error.status) {
        throw error;
      }

      throw ResponseHandler.serverError(
        'Failed to resolve file conflict: ' + error.toString(),
        'error.server'
      );
    }
  },

  /**
   * Lists all files in a folder
   * Admin only endpoint
   *
   * @param {Object} context - Request context from Router
   * @param {Object} context.data - Request parameters
   * @param {string} context.data.folderId - Folder ID
   * @param {Object} context.user - Current user
   * @returns {Object} Response with array of file objects
   */
  listFiles: function(context) {
    try {
      // Admin-only authorization check
      if (!context.user || context.user.role !== 'ROLE_ADMIN') {
        throw ResponseHandler.forbiddenError(
          'Admin access required',
          'error.forbidden'
        );
      }

      // Validate required fields
      const { folderId } = context.data;

      if (!folderId) {
        throw ResponseHandler.validationError(
          'Folder ID is required',
          'file.list.error.missingFields'
        );
      }

      // List files
      const files = DriveService.listFiles(folderId.trim());

      return {
        status: 200,
        msgKey: 'file.list.success',
        message: 'Files listed successfully',
        data: {
          files: files,
          count: files.length
        }
      };

    } catch (error) {
      Logger.log('Error in FileHandler.listFiles: ' + error.toString());

      if (error.status) {
        throw error;
      }

      throw ResponseHandler.serverError(
        'Failed to list files: ' + error.toString(),
        'error.server'
      );
    }
  },

  /**
   * Deletes a file from Drive
   * Admin only endpoint
   *
   * @param {Object} context - Request context from Router
   * @param {Object} context.data - Request parameters
   * @param {string} context.data.fileId - File ID to delete
   * @param {Object} context.user - Current user
   * @returns {Object} Response with deletion result
   */
  deleteFile: function(context) {
    try {
      // Admin-only authorization check
      if (!context.user || context.user.role !== 'ROLE_ADMIN') {
        throw ResponseHandler.forbiddenError(
          'Admin access required',
          'error.forbidden'
        );
      }

      // Validate required fields
      const { fileId } = context.data;

      if (!fileId) {
        throw ResponseHandler.validationError(
          'File ID is required',
          'file.delete.error.missingFields'
        );
      }

      // Delete file
      const result = DriveService.deleteFile(fileId.trim());

      return {
        status: 200,
        msgKey: 'file.delete.success',
        message: 'File deleted successfully',
        data: result
      };

    } catch (error) {
      Logger.log('Error in FileHandler.deleteFile: ' + error.toString());

      if (error.status) {
        throw error;
      }

      throw ResponseHandler.serverError(
        'Failed to delete file: ' + error.toString(),
        'error.server'
      );
    }
  },

  /**
   * Lists both folders and files in a folder (for navigation)
   * Authenticated users can list folder contents
   *
   * @param {Object} context - Request context from Router
   * @param {Object} context.data - Request parameters
   * @param {string} context.data.folderId - Folder ID to list contents
   * @param {Object} context.user - Current user
   * @returns {Object} Response with folders and files arrays
   */
  listFolderContents: function(context) {
    try {
      // Validate required fields
      const { folderId } = context.data;

      if (!folderId) {
        throw ResponseHandler.validationError(
          'Folder ID is required',
          'file.folderContents.error.missingFields'
        );
      }

      // List folders and files using unified method
      const contents = DriveService.listFolderContents(folderId.trim());

      return {
        status: 200,
        msgKey: 'file.folderContents.success',
        message: 'Folder contents listed successfully',
        data: contents
      };

    } catch (error) {
      Logger.log('Error in FileHandler.listFolderContents: ' + error.toString());

      if (error.status) {
        throw error;
      }

      throw ResponseHandler.serverError(
        'Failed to list folder contents: ' + error.toString(),
        'error.server'
      );
    }
  },

  /**
   * Uploads multiple files to a case folder (batch upload)
   * Handles base64-encoded files with optional display names
   *
   * @param {Object} context - Request context from Router
   * @param {Object} context.data - Request parameters
   * @param {string} context.data.caseFolderId - Target case folder ID
   * @param {Array} context.data.files - Array of file objects with fileName, content (base64), mimeType, displayName (optional)
   * @param {Object} context.user - Current user
   * @returns {Object} Response with per-file results, successCount, failureCount
   */
  uploadBatch: function(context) {
    try {
      // Admin-only authorization check
      if (!context.user || context.user.role !== 'ROLE_ADMIN') {
        throw ResponseHandler.forbiddenError(
          'Admin access required',
          'error.forbidden'
        );
      }

      // Validate required fields
      const { caseFolderId, files } = context.data;

      if (!caseFolderId) {
        throw ResponseHandler.validationError(
          'Case folder ID is required',
          'file.upload.error.missingFolderId'
        );
      }

      if (!files || !Array.isArray(files) || files.length === 0) {
        throw ResponseHandler.validationError(
          'Files array is required and must not be empty',
          'file.upload.error.missingFiles'
        );
      }

      // Verify folder exists
      let folder;
      try {
        folder = DriveApp.getFolderById(caseFolderId.trim());
      } catch (e) {
        throw ResponseHandler.notFoundError(
          'Case folder not found',
          'file.upload.error.folderNotFound'
        );
      }

      const results = [];
      let successCount = 0;
      let failureCount = 0;
      const maxFileSize = 50 * 1024 * 1024; // 50MB in bytes

      // Process each file
      for (let i = 0; i < files.length; i++) {
        const fileData = files[i];

        try {
          // Validate file data
          if (!fileData.fileName || !fileData.content) {
            results.push({
              fileName: fileData.fileName || 'unknown',
              success: false,
              error: 'Missing file name or content',
              msgKey: 'file.upload.error.invalidFileData'
            });
            failureCount++;
            continue;
          }

          // Decode base64 content
          let blobData;
          try {
            blobData = Utilities.base64Decode(fileData.content);
          } catch (e) {
            results.push({
              fileName: fileData.fileName,
              success: false,
              error: 'Invalid base64 encoding',
              msgKey: 'file.upload.error.invalidEncoding'
            });
            failureCount++;
            continue;
          }

          // Check file size (50MB limit)
          if (blobData.length > maxFileSize) {
            results.push({
              fileName: fileData.fileName,
              success: false,
              error: 'File exceeds 50MB size limit',
              msgKey: 'file.upload.error.fileTooLarge',
              size: blobData.length
            });
            failureCount++;
            continue;
          }

          // Create blob with MIME type
          const mimeType = fileData.mimeType || 'application/octet-stream';
          const blob = Utilities.newBlob(blobData, mimeType);

          // Use displayName if provided, otherwise use fileName
          const finalFileName = fileData.displayName ? fileData.displayName.trim() : fileData.fileName.trim();
          blob.setName(finalFileName);

          // Upload file to Drive
          const uploadedFile = folder.createFile(blob);

          results.push({
            fileName: fileData.fileName,
            displayName: finalFileName,
            success: true,
            fileId: uploadedFile.getId(),
            size: uploadedFile.getSize(),
            url: uploadedFile.getUrl(),
            createdAt: DateUtil.formatDate(uploadedFile.getDateCreated())
          });
          successCount++;

        } catch (error) {
          results.push({
            fileName: fileData.fileName || 'unknown',
            success: false,
            error: error.toString(),
            msgKey: 'file.upload.error.uploadFailed'
          });
          failureCount++;
        }
      }

      return {
        status: 200,
        msgKey: 'file.upload.batch.complete',
        message: `Uploaded ${successCount} of ${files.length} files successfully`,
        data: {
          results: results,
          successCount: successCount,
          failureCount: failureCount,
          totalCount: files.length
        }
      };

    } catch (error) {
      Logger.log('Error in FileHandler.uploadBatch: ' + error.toString());

      if (error.status) {
        throw error;
      }

      throw ResponseHandler.serverError(
        'Failed to upload files: ' + error.toString(),
        'error.server'
      );
    }
  },

  /**
   * Gets download URL for a file
   * Authenticated users can download files
   *
   * @param {Object} context - Request context from Router
   * @param {Object} context.data - Request parameters
   * @param {string} context.data.fileId - File ID to download
   * @param {Object} context.user - Current user
   * @returns {Object} Response with download URL
   */
  downloadFile: function(context) {
    try {
      // Validate required fields
      const { fileId } = context.data;

      if (!fileId) {
        throw ResponseHandler.validationError(
          'File ID is required',
          'file.download.error.missingFields'
        );
      }

      // Get file and its content
      let file;
      try {
        file = DriveApp.getFileById(fileId.trim());
      } catch (e) {
        throw ResponseHandler.notFoundError(
          'File not found',
          'file.download.error.notFound'
        );
      }

      // Get file content as base64
      const blob = file.getBlob();
      const base64Content = Utilities.base64Encode(blob.getBytes());

      return {
        status: 200,
        msgKey: 'file.download.success',
        message: 'File content retrieved successfully',
        data: {
          fileId: file.getId(),
          fileName: file.getName(),
          content: base64Content,
          mimeType: file.getMimeType(),
          size: file.getSize()
        }
      };

    } catch (error) {
      Logger.log('Error in FileHandler.downloadFile: ' + error.toString());

      if (error.status) {
        throw error;
      }

      throw ResponseHandler.serverError(
        'Failed to generate download URL: ' + error.toString(),
        'error.server'
      );
    }
  },

  /**
   * Renames a file in Google Drive
   * Admin only endpoint
   *
   * @param {Object} context - Request context from Router
   * @param {Object} context.data - Request parameters
   * @param {string} context.data.fileId - File ID to rename
   * @param {string} context.data.newName - New file name
   * @param {Object} context.user - Current user
   * @returns {Object} Response with renamed file info
   */
  renameFile: function(context) {
    try {
      // Admin-only authorization check
      if (!context.user || context.user.role !== 'ROLE_ADMIN') {
        throw ResponseHandler.forbiddenError(
          'Admin access required',
          'error.forbidden'
        );
      }

      // Validate required fields
      const { fileId, newName } = context.data;

      if (!fileId) {
        throw ResponseHandler.validationError(
          'File ID is required',
          'file.rename.error.missingFields'
        );
      }

      if (!newName || newName.trim() === '') {
        throw ResponseHandler.validationError(
          'New file name is required',
          'file.rename.error.missingName'
        );
      }

      // Rename file using DriveService
      const result = DriveService.renameFile(fileId.trim(), newName.trim());

      return {
        status: 200,
        msgKey: 'file.rename.success',
        message: `File renamed from "${result.oldName}" to "${result.newName}"`,
        data: {
          fileId: result.fileId,
          oldName: result.oldName,
          newName: result.newName,
          renamedAt: DateUtil.getCurrentTimestamp(),
          renamedBy: context.user.email
        }
      };

    } catch (error) {
      Logger.log('Error in FileHandler.renameFile: ' + error.toString());

      if (error.status) {
        throw error;
      }

      throw ResponseHandler.serverError(
        'Failed to rename file: ' + error.toString(),
        'error.server'
      );
    }
  }
};
