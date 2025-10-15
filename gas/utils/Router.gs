/**
 * Router.gs
 *
 * Routes incoming requests to appropriate handler methods.
 * Discovers and invokes handler methods dynamically based on action string.
 *
 * Per constitution: Route requests to appropriate methods, handle method discovery.
 *
 * Action Format: 'handler.method'
 * Example: 'auth.login' -> AuthHandler.login()
 */

const Router = {
  /**
   * Routes a validated request to the appropriate handler
   * @param {Object} context - Validated request context from SecurityInterceptor
   * @returns {Object} Handler response
   */
  route: function(context) {
    const action = context.action;
    const parts = action.split('.');

    if (parts.length !== 2) {
      throw ResponseHandler.validationError(
        'Invalid action format. Expected: handler.method',
        'error.router.invalidAction'
      );
    }

    const handlerName = parts[0];
    const methodName = parts[1];

    // Get the handler object
    const handler = this.getHandler(handlerName);

    if (!handler) {
      throw ResponseHandler.notFoundError(
        'Handler not found: ' + handlerName,
        'error.router.handlerNotFound'
      );
    }

    // Get the method from the handler
    const method = handler[methodName];

    if (!method || typeof method !== 'function') {
      throw ResponseHandler.notFoundError(
        'Method not found: ' + handlerName + '.' + methodName,
        'error.router.methodNotFound'
      );
    }

    // Log the route
    console.log('Routing to:', action, {
      user: context.user ? context.user.email : 'public',
      timestamp: DateUtil.getCurrentTimestamp()
    });

    // Invoke the method with context
    return method.call(handler, context);
  },

  /**
   * Gets a handler object by name
   * @param {string} handlerName - Name of the handler (e.g., 'auth', 'metadata')
   * @returns {Object} Handler object
   */
  getHandler: function(handlerName) {
    // Map handler names to handler objects
    const handlers = {
      'auth': AuthHandler,
      'metadata': MetadataHandler,
      'file': FileHandler,
      'client': ClientHandler,
      'case': CaseHandler
    };

    return handlers[handlerName] || null;
  },

  /**
   * Lists all available routes (for documentation/debugging)
   * @returns {Object} Map of handler.method -> description
   */
  listRoutes: function() {
    return {
      // Auth routes
      'auth.signup': 'Create a new user account',
      'auth.verifyEmail': 'Verify user email with token',
      'auth.resendVerification': 'Resend verification email',
      'auth.login': 'Authenticate user and get token',
      'auth.requestPasswordReset': 'Request password reset OTP',
      'auth.verifyOTP': 'Verify OTP for password reset',
      'auth.resetPassword': 'Reset password with verified OTP',

      // Metadata routes
      'metadata.searchCasesByName': 'Search cases by client name',
      'metadata.searchCaseByCaseId': 'Search case by case ID',
      'metadata.getCaseForEdit': 'Get case for editing (admin only)',
      'metadata.updateCaseMetadata': 'Update case metadata (admin only)',
      'metadata.createCaseMetadata': 'Create new case metadata (admin only)',

      // Client routes
      'client.search': 'Search clients by name and/or national ID',
      'client.create': 'Create a new client with folder (admin only)',
      'client.get': 'Get client details with cases',

      // Case routes
      'case.create': 'Create a new case folder for a client',

      // File routes
      'file.searchClientFolder': 'Search for a client folder by name (admin only)',
      'file.createClientFolder': 'Create a new client folder (admin only)',
      'file.createCaseFolder': 'Create a new case folder (admin only)',
      'file.listFolders': 'List folders within a folder (admin only)',
      'file.listFiles': 'List files in a folder (admin only)',
      'file.listFolderContents': 'List both folders and files for navigation (admin only)',
      'file.uploadFile': 'Upload a file to a folder with conflict detection (admin only)',
      'file.uploadBatch': 'Upload multiple files with base64 encoding and progress tracking (admin only)',
      'file.resolveFileConflict': 'Resolve file upload conflict - overwrite/rename/cancel (admin only)',
      'file.downloadFile': 'Get download URL for a file (admin only)',
      'file.deleteFile': 'Delete a file from Drive (admin only)',
      'file.getCaseFolderStructure': 'Get folder structure for a case',
      'file.searchFiles': 'Search files by name or metadata'
    };
  }
};
