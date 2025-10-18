/**
 * FolderHandler.gs
 *
 * Handles folder operations including deletion with safeguards.
 * Provides endpoints for managing folder lifecycle.
 *
 * Per constitution: Admin-only endpoints with proper authorization checks.
 */

const FolderHandler = {
  /**
   * Deletes a folder and all its contents
   * Admin only endpoint with typed confirmation required
   *
   * @param {Object} context - Request context from Router
   * @param {Object} context.data - Request parameters
   * @param {string} context.data.folderId - Folder ID to delete
   * @param {string} context.data.confirmation - Must be exactly "DELETE" to proceed
   * @param {Object} context.user - Current user
   * @returns {Object} Response with deletion result
   */
  deleteFolder: function(context) {
    try {
      // Admin-only authorization check
      if (!context.user || context.user.role !== 'ROLE_ADMIN') {
        throw ResponseHandler.error({
          status: 403,
          msgKey: 'error.forbidden',
          message: 'Admin access required'
        });
      }

      // Validate required fields
      const { folderId, confirmation } = context.data;

      if (!folderId) {
        throw ResponseHandler.validationError(
          'Folder ID is required',
          'folder.delete.error.missingFields'
        );
      }

      // Validate confirmation string
      if (confirmation !== 'DELETE') {
        throw ResponseHandler.validationError(
          'You must type DELETE exactly to confirm folder deletion',
          'folder.delete.error.invalidConfirmation'
        );
      }

      // Get folder info
      let folder;
      try {
        folder = DriveApp.getFolderById(folderId.trim());
      } catch (e) {
        throw ResponseHandler.notFoundError(
          'Folder not found',
          'folder.delete.error.notFound'
        );
      }

      const folderName = folder.getName();

      // Protect root "cases" folder from deletion
      if (folderName === 'cases') {
        throw ResponseHandler.error({
          status: 403,
          msgKey: 'folder.delete.error.protected',
          message: 'Cannot delete the root cases folder'
        });
      }

      // Get parent folder ID before deletion
      const parents = folder.getParents();
      const parentFolderId = parents.hasNext() ? parents.next().getId() : null;

      // Count items recursively
      const itemsCount = this._countItemsRecursively(folder);

      // Delete folder (move to trash)
      folder.setTrashed(true);

      const now = DateUtil.getCurrentTimestamp();

      // Generate new token to extend session
      const newToken = TokenManager.generateToken(context.user.email);

      return ResponseHandler.successWithToken(
        'folder.delete.success',
        `Folder "${folderName}" and ${itemsCount} item(s) deleted successfully`,
        {
          folderId: folderId,
          folderName: folderName,
          parentFolderId: parentFolderId,
          itemsDeleted: itemsCount,
          deletedAt: now,
          deletedBy: context.user.email
        },
        context.user,
        newToken.value
      );

    } catch (error) {
      Logger.log('Error in FolderHandler.deleteFolder: ' + error.toString());

      // If error is already a formatted response, throw it
      if (error.status && error.msgKey) {
        throw error;
      }

      // Otherwise, throw generic server error
      throw ResponseHandler.serverError(
        'Failed to delete folder: ' + error.toString(),
        'error.server'
      );
    }
  },

  /**
   * Recursively counts all items (files + subfolders) in a folder
   * @param {GoogleAppsScript.Drive.Folder} folder - Folder to count
   * @returns {number} Total count of all items
   * @private
   */
  _countItemsRecursively: function(folder) {
    let count = 0;

    // Count files
    const files = folder.getFiles();
    while (files.hasNext()) {
      files.next();
      count++;
    }

    // Count subfolders and their contents recursively
    const subfolders = folder.getFolders();
    while (subfolders.hasNext()) {
      const subfolder = subfolders.next();
      count++; // Count the folder itself
      count += this._countItemsRecursively(subfolder); // Count its contents
    }

    return count;
  }
};
