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
   * @param {Object} params - Request parameters
   * @param {string} params.firstName - Client's first name
   * @param {string} params.lastName - Client's last name
   * @param {string} params.idCardNo - Client's ID card number
   * @param {Object} context - Request context (user, headers)
   * @returns {Object} Response with folder info or null if not found
   */
  searchClientFolder: function(params, context) {
    try {
      // Admin-only authorization check
      if (!context.user || context.user.role !== 'ROLE_ADMIN') {
        return ResponseHandler.error({
          status: 403,
          msgKey: 'error.forbidden',
          message: 'Admin access required'
        });
      }

      // Validate required fields
      const { firstName, lastName, idCardNo } = params;

      if (!firstName || !lastName || !idCardNo) {
        return ResponseHandler.validationError(
          'First name, last name, and ID card number are required',
          'file.folder.search.error.missingFields'
        );
      }

      // Search for client folder
      const folderInfo = DriveService.searchClientFolder(firstName, lastName, idCardNo);

      if (folderInfo) {
        return ResponseHandler.success({
          message: 'Client folder found',
          msgKey: 'file.folder.search.success',
          data: folderInfo
        });
      } else {
        return ResponseHandler.success({
          message: 'Client folder not found',
          msgKey: 'file.folder.search.notFound',
          data: null
        });
      }

    } catch (error) {
      Logger.log('Error in FileHandler.searchClientFolder: ' + error.toString());
      return ResponseHandler.error({
        status: 500,
        msgKey: 'error.server',
        message: 'Failed to search for client folder',
        error: error.toString()
      });
    }
  },

  /**
   * Creates a new client folder in Google Drive
   * Admin only endpoint
   *
   * @param {Object} params - Request parameters
   * @param {string} params.firstName - Client's first name
   * @param {string} params.lastName - Client's last name
   * @param {string} params.idCardNo - Client's ID card number
   * @param {string} [params.telephone] - Client's telephone number (optional)
   * @param {string} [params.email] - Client's email address (optional)
   * @param {Object} context - Request context (user, headers)
   * @returns {Object} Response with created folder information
   */
  createClientFolder: function(params, context) {
    try {
      // Admin-only authorization check
      if (!context.user || context.user.role !== 'ROLE_ADMIN') {
        return ResponseHandler.error({
          status: 403,
          msgKey: 'error.forbidden',
          message: 'Admin access required'
        });
      }

      // Validate required fields
      const { firstName, lastName, idCardNo, telephone, email } = params;

      if (!firstName || !lastName || !idCardNo) {
        return ResponseHandler.validationError(
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

      return ResponseHandler.success({
        message: 'Client folder created successfully',
        msgKey: 'file.folder.create.success',
        data: folderInfo
      });

    } catch (error) {
      Logger.log('Error in FileHandler.createClientFolder: ' + error.toString());

      // If error is already a formatted response (from DriveService), return it
      if (error.status && error.msgKey) {
        return error;
      }

      // Otherwise, return generic server error
      return ResponseHandler.error({
        status: 500,
        msgKey: 'error.server',
        message: 'Failed to create client folder',
        error: error.toString()
      });
    }
  },

  /**
   * Creates a case folder within a client folder
   * Admin only endpoint
   *
   * @param {Object} params - Request parameters
   * @param {string} params.clientFolderId - Parent client folder ID
   * @param {string} params.caseId - Case identifier (becomes folder name)
   * @param {Object} context - Request context (user, headers)
   * @returns {Object} Response with created folder information
   */
  createCaseFolder: function(params, context) {
    try {
      // Admin-only authorization check
      if (!context.user || context.user.role !== 'ROLE_ADMIN') {
        return ResponseHandler.error({
          status: 403,
          msgKey: 'error.forbidden',
          message: 'Admin access required'
        });
      }

      // Validate required fields
      const { clientFolderId, caseId } = params;

      if (!clientFolderId || !caseId) {
        return ResponseHandler.validationError(
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

      return ResponseHandler.success({
        message: 'Case folder created successfully',
        msgKey: 'file.casefolder.create.success',
        data: folderInfo
      });

    } catch (error) {
      Logger.log('Error in FileHandler.createCaseFolder: ' + error.toString());

      // If error is already a formatted response (from DriveService), return it
      if (error.status && error.msgKey) {
        return error;
      }

      // Otherwise, return generic server error
      return ResponseHandler.error({
        status: 500,
        msgKey: 'error.server',
        message: 'Failed to create case folder',
        error: error.toString()
      });
    }
  },

  /**
   * Lists all folders within a given folder
   * Admin only endpoint
   *
   * @param {Object} params - Request parameters
   * @param {string} params.folderId - Folder ID to list contents
   * @param {Object} context - Request context (user, headers)
   * @returns {Object} Response with array of folder objects
   */
  listFolders: function(params, context) {
    try {
      // Admin-only authorization check
      if (!context.user || context.user.role !== 'ROLE_ADMIN') {
        return ResponseHandler.error({
          status: 403,
          msgKey: 'error.forbidden',
          message: 'Admin access required'
        });
      }

      // Validate required fields
      const { folderId } = params;

      if (!folderId) {
        return ResponseHandler.validationError(
          'Folder ID is required',
          'file.folder.list.error.missingFields'
        );
      }

      // List folders (DriveService handles folder not found)
      const folders = DriveService.listFolders(folderId.trim());

      return ResponseHandler.success({
        message: 'Folders listed successfully',
        msgKey: 'file.folder.list.success',
        data: {
          folders: folders,
          count: folders.length
        }
      });

    } catch (error) {
      Logger.log('Error in FileHandler.listFolders: ' + error.toString());

      // If error is already a formatted response (from DriveService), return it
      if (error.status && error.msgKey) {
        return error;
      }

      // Otherwise, return generic server error
      return ResponseHandler.error({
        status: 500,
        msgKey: 'error.server',
        message: 'Failed to list folders',
        error: error.toString()
      });
    }
  },

  /**
   * Uploads a file to a folder with conflict detection
   * Admin only endpoint
   *
   * @param {Object} params - Request parameters
   * @param {string} params.folderId - Target folder ID
   * @param {string} params.fileName - File name
   * @param {Blob} params.fileBlob - File blob data
   * @param {Object} context - Request context (user, headers)
   * @returns {Object} Response with file info or conflict indicator
   */
  uploadFile: function(params, context) {
    try {
      // Admin-only authorization check
      if (!context.user || context.user.role !== 'ROLE_ADMIN') {
        return ResponseHandler.error({
          status: 403,
          msgKey: 'error.forbidden',
          message: 'Admin access required'
        });
      }

      // Validate required fields
      const { folderId, fileName, fileBlob } = params;

      if (!folderId || !fileName || !fileBlob) {
        return ResponseHandler.validationError(
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
        return ResponseHandler.success({
          message: 'File with this name already exists',
          msgKey: 'file.upload.conflict',
          data: {
            conflict: true,
            existingFileId: result.existingFileId,
            fileName: result.fileName
          }
        });
      }

      // No conflict - file uploaded successfully
      return ResponseHandler.success({
        message: 'File uploaded successfully',
        msgKey: 'file.upload.success',
        data: {
          file: result.file,
          conflict: false
        }
      });

    } catch (error) {
      Logger.log('Error in FileHandler.uploadFile: ' + error.toString());

      // If error is already a formatted response (from DriveService), return it
      if (error.status && error.msgKey) {
        return error;
      }

      // Otherwise, return generic server error
      return ResponseHandler.error({
        status: 500,
        msgKey: 'error.server',
        message: 'Failed to upload file',
        error: error.toString()
      });
    }
  },

  /**
   * Resolves a file upload conflict
   * Admin only endpoint
   *
   * @param {Object} params - Request parameters
   * @param {string} params.folderId - Target folder ID
   * @param {string} params.fileName - Original file name
   * @param {string} params.resolution - Resolution type: "overwrite", "rename", or "cancel"
   * @param {Blob} params.fileBlob - File blob data
   * @param {Object} context - Request context (user, headers)
   * @returns {Object} Response with resolution result
   */
  resolveFileConflict: function(params, context) {
    try {
      // Admin-only authorization check
      if (!context.user || context.user.role !== 'ROLE_ADMIN') {
        return ResponseHandler.error({
          status: 403,
          msgKey: 'error.forbidden',
          message: 'Admin access required'
        });
      }

      // Validate required fields
      const { folderId, fileName, resolution, fileBlob } = params;

      if (!folderId || !fileName || !resolution || !fileBlob) {
        return ResponseHandler.validationError(
          'Folder ID, file name, resolution, and file data are required',
          'file.conflict.error.missingFields'
        );
      }

      // Validate resolution type
      const validResolutions = ['overwrite', 'rename', 'cancel'];
      if (!validResolutions.includes(resolution)) {
        return ResponseHandler.validationError(
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
        return ResponseHandler.success({
          message: 'Upload cancelled by user',
          msgKey: 'file.conflict.cancel.success',
          data: {
            action: 'cancel',
            message: result.message
          }
        });
      }

      // Handle overwrite action
      if (result.action === 'overwrite') {
        return ResponseHandler.success({
          message: 'File overwritten successfully',
          msgKey: 'file.conflict.overwrite.success',
          data: {
            file: result.file,
            action: 'overwrite',
            previousFileDeleted: result.previousFileDeleted
          }
        });
      }

      // Handle rename action
      if (result.action === 'rename') {
        return ResponseHandler.success({
          message: 'File uploaded with new name',
          msgKey: 'file.conflict.rename.success',
          data: {
            file: result.file,
            action: 'rename',
            originalFileName: result.originalFileName
          }
        });
      }

    } catch (error) {
      Logger.log('Error in FileHandler.resolveFileConflict: ' + error.toString());

      // If error is already a formatted response (from DriveService), return it
      if (error.status && error.msgKey) {
        return error;
      }

      // Otherwise, return generic server error
      return ResponseHandler.error({
        status: 500,
        msgKey: 'error.server',
        message: 'Failed to resolve file conflict',
        error: error.toString()
      });
    }
  },

  /**
   * Lists all files in a folder
   * Admin only endpoint
   *
   * @param {Object} params - Request parameters
   * @param {string} params.folderId - Folder ID
   * @param {Object} context - Request context (user, headers)
   * @returns {Object} Response with array of file objects
   */
  listFiles: function(params, context) {
    try {
      // Admin-only authorization check
      if (!context.user || context.user.role !== 'ROLE_ADMIN') {
        return ResponseHandler.error({
          status: 403,
          msgKey: 'error.forbidden',
          message: 'Admin access required'
        });
      }

      // Validate required fields
      const { folderId } = params;

      if (!folderId) {
        return ResponseHandler.validationError(
          'Folder ID is required',
          'file.list.error.missingFields'
        );
      }

      // List files
      const files = DriveService.listFiles(folderId.trim());

      return ResponseHandler.success({
        message: 'Files listed successfully',
        msgKey: 'file.list.success',
        data: {
          files: files,
          count: files.length
        }
      });

    } catch (error) {
      Logger.log('Error in FileHandler.listFiles: ' + error.toString());

      // If error is already a formatted response (from DriveService), return it
      if (error.status && error.msgKey) {
        return error;
      }

      // Otherwise, return generic server error
      return ResponseHandler.error({
        status: 500,
        msgKey: 'error.server',
        message: 'Failed to list files',
        error: error.toString()
      });
    }
  },

  /**
   * Deletes a file from Drive
   * Admin only endpoint
   *
   * @param {Object} params - Request parameters
   * @param {string} params.fileId - File ID to delete
   * @param {Object} context - Request context (user, headers)
   * @returns {Object} Response with deletion result
   */
  deleteFile: function(params, context) {
    try {
      // Admin-only authorization check
      if (!context.user || context.user.role !== 'ROLE_ADMIN') {
        return ResponseHandler.error({
          status: 403,
          msgKey: 'error.forbidden',
          message: 'Admin access required'
        });
      }

      // Validate required fields
      const { fileId } = params;

      if (!fileId) {
        return ResponseHandler.validationError(
          'File ID is required',
          'file.delete.error.missingFields'
        );
      }

      // Delete file
      const result = DriveService.deleteFile(fileId.trim());

      return ResponseHandler.success({
        message: 'File deleted successfully',
        msgKey: 'file.delete.success',
        data: result
      });

    } catch (error) {
      Logger.log('Error in FileHandler.deleteFile: ' + error.toString());

      // If error is already a formatted response (from DriveService), return it
      if (error.status && error.msgKey) {
        return error;
      }

      // Otherwise, return generic server error
      return ResponseHandler.error({
        status: 500,
        msgKey: 'error.server',
        message: 'Failed to delete file',
        error: error.toString()
      });
    }
  },

  /**
   * Lists both folders and files in a folder (for navigation)
   * Admin only endpoint
   *
   * @param {Object} params - Request parameters
   * @param {string} params.folderId - Folder ID to list contents
   * @param {Object} context - Request context (user, headers)
   * @returns {Object} Response with folders and files arrays
   */
  listFolderContents: function(params, context) {
    try {
      // Admin-only authorization check
      if (!context.user || context.user.role !== 'ROLE_ADMIN') {
        return ResponseHandler.error({
          status: 403,
          msgKey: 'error.forbidden',
          message: 'Admin access required'
        });
      }

      // Validate required fields
      const { folderId } = params;

      if (!folderId) {
        return ResponseHandler.validationError(
          'Folder ID is required',
          'file.folderContents.error.missingFields'
        );
      }

      // List folders and files
      const folders = DriveService.listFolders(folderId.trim());
      const files = DriveService.listFiles(folderId.trim());

      return ResponseHandler.success({
        message: 'Folder contents listed successfully',
        msgKey: 'file.folderContents.success',
        data: {
          folders: folders,
          files: files,
          folderCount: folders.length,
          fileCount: files.length
        }
      });

    } catch (error) {
      Logger.log('Error in FileHandler.listFolderContents: ' + error.toString());

      // If error is already a formatted response (from DriveService), return it
      if (error.status && error.msgKey) {
        return error;
      }

      // Otherwise, return generic server error
      return ResponseHandler.error({
        status: 500,
        msgKey: 'error.server',
        message: 'Failed to list folder contents',
        error: error.toString()
      });
    }
  },

  /**
   * Uploads multiple files to a case folder (batch upload)
   * Handles base64-encoded files with optional display names
   *
   * @param {Object} params - Request parameters
   * @param {string} params.caseFolderId - Target case folder ID
   * @param {Array} params.files - Array of file objects with fileName, content (base64), mimeType, displayName (optional)
   * @param {Object} context - Request context (user, headers)
   * @returns {Object} Response with per-file results, successCount, failureCount
   */
  uploadBatch: function(params, context) {
    try {
      // Admin-only authorization check
      if (!context.user || context.user.role !== 'ROLE_ADMIN') {
        return ResponseHandler.error({
          status: 403,
          msgKey: 'error.forbidden',
          message: 'Admin access required'
        });
      }

      // Validate required fields
      const { caseFolderId, files } = params;

      if (!caseFolderId) {
        return ResponseHandler.validationError(
          'Case folder ID is required',
          'file.upload.error.missingFolderId'
        );
      }

      if (!files || !Array.isArray(files) || files.length === 0) {
        return ResponseHandler.validationError(
          'Files array is required and must not be empty',
          'file.upload.error.missingFiles'
        );
      }

      // Verify folder exists
      let folder;
      try {
        folder = DriveApp.getFolderById(caseFolderId.trim());
      } catch (e) {
        return ResponseHandler.notFoundError(
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
            createdAt: DateUtil.formatTimestamp(uploadedFile.getDateCreated())
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

      return ResponseHandler.success({
        message: `Uploaded ${successCount} of ${files.length} files successfully`,
        msgKey: 'file.upload.batch.complete',
        data: {
          results: results,
          successCount: successCount,
          failureCount: failureCount,
          totalCount: files.length
        }
      });

    } catch (error) {
      Logger.log('Error in FileHandler.uploadBatch: ' + error.toString());

      // If error is already a formatted response, return it
      if (error.status && error.msgKey) {
        return error;
      }

      // Otherwise, return generic server error
      return ResponseHandler.error({
        status: 500,
        msgKey: 'error.server',
        message: 'Failed to upload files',
        error: error.toString()
      });
    }
  },

  /**
   * Gets download URL for a file
   * Admin only endpoint
   *
   * @param {Object} params - Request parameters
   * @param {string} params.fileId - File ID to download
   * @param {Object} context - Request context (user, headers)
   * @returns {Object} Response with download URL
   */
  downloadFile: function(params, context) {
    try {
      // Admin-only authorization check
      if (!context.user || context.user.role !== 'ROLE_ADMIN') {
        return ResponseHandler.error({
          status: 403,
          msgKey: 'error.forbidden',
          message: 'Admin access required'
        });
      }

      // Validate required fields
      const { fileId } = params;

      if (!fileId) {
        return ResponseHandler.validationError(
          'File ID is required',
          'file.download.error.missingFields'
        );
      }

      // Get file and generate download URL
      let file;
      try {
        file = DriveApp.getFileById(fileId.trim());
      } catch (e) {
        return ResponseHandler.notFoundError(
          'File not found',
          'file.download.error.notFound'
        );
      }

      const downloadUrl = `https://drive.google.com/uc?export=download&id=${fileId.trim()}`;

      return ResponseHandler.success({
        message: 'Download URL generated successfully',
        msgKey: 'file.download.success',
        data: {
          fileId: file.getId(),
          fileName: file.getName(),
          downloadUrl: downloadUrl,
          mimeType: file.getMimeType(),
          size: file.getSize()
        }
      });

    } catch (error) {
      Logger.log('Error in FileHandler.downloadFile: ' + error.toString());

      // If error is already a formatted response, return it
      if (error.status && error.msgKey) {
        return error;
      }

      // Otherwise, return generic server error
      return ResponseHandler.error({
        status: 500,
        msgKey: 'error.server',
        message: 'Failed to generate download URL',
        error: error.toString()
      });
    }
  }
};
