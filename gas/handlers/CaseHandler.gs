/**
 * CaseHandler.gs
 *
 * Handles case-related operations including case folder creation.
 * Interacts with SheetsService for client data and DriveService for folder management.
 *
 * Per constitution: Handler layer for case business logic.
 */

const CaseHandler = {
  /**
   * Create a new case folder for a client
   * @param {Object} context - Request context from Router
   * @param {Object} context.data - Request data
   * @param {string} context.data.clientId - Client ID (required)
   * @param {string} context.data.caseId - Case ID/folder name (required)
   * @param {Object} context.user - Current user
   * @returns {Object} Response with created case
   */
  create: function(context) {
    try {
      // Admin-only authorization check
      if (!context.user || context.user.role !== 'ROLE_ADMIN') {
        throw ResponseHandler.forbiddenError(
          'Admin access required to create cases',
          'error.forbidden'
        );
      }

      const { clientId, caseId } = context.data;

      // Validate required fields
      if (!clientId) {
        throw ResponseHandler.validationError(
          'Client ID is required',
          'case.create.error.missingClientId'
        );
      }

      if (!caseId) {
        throw ResponseHandler.validationError(
          'Case ID is required',
          'case.create.error.missingCaseId'
        );
      }

      // Validate case ID format: alphanumeric + underscore/hyphen, 1-100 chars
      const caseIdRegex = /^[a-zA-Z0-9_-]{1,100}$/;
      if (!caseIdRegex.test(caseId)) {
        throw ResponseHandler.validationError(
          'Case ID must be 1-100 characters and contain only letters, numbers, hyphens, and underscores',
          'case.create.error.invalidFormat'
        );
      }

      // Verify client exists in Sheets
      const client = SheetsService.getClientById(clientId);
      if (!client) {
        throw ResponseHandler.notFoundError(
          'Client not found',
          'case.create.error.clientNotFound'
        );
      }

      // Verify client has a folder
      if (!client.folderId) {
        throw ResponseHandler.validationError(
          'Client folder not found',
          'case.create.error.clientFolderMissing'
        );
      }

      // Get client folder
      let clientFolder;
      try {
        clientFolder = DriveApp.getFolderById(client.folderId);
      } catch (e) {
        throw ResponseHandler.notFoundError(
          'Client folder not accessible: ' + e.toString(),
          'case.create.error.clientFolderNotAccessible'
        );
      }

      // Check if case ID already exists (case-sensitive)
      const existingFolders = clientFolder.getFolders();
      while (existingFolders.hasNext()) {
        const folder = existingFolders.next();
        if (folder.getName() === caseId) {
          throw ResponseHandler.conflictError(
            'Case ID already exists for this client',
            'case.create.error.duplicate'
          );
        }
      }

      // Create case subfolder
      const caseFolder = clientFolder.createFolder(caseId);
      const caseFolderId = caseFolder.getId();

      // Set folder description
      const description = `Case: ${caseId}\nClient: ${client.firstName} ${client.lastName}\nNational ID: ${client.nationalId}`;
      caseFolder.setDescription(description);

      // Build folder path
      const folderPath = `cases/${clientFolder.getName()}/${caseId}`;

      // Get current user's full name for metadata
      const currentUser = context.user || {};
      const createdBy = currentUser.fullName || currentUser.email || 'Unknown';

      // Create metadata entry in the metadata sheet
      const now = DateUtil.getCurrentTimestamp();
      const clientName = `${client.firstName} ${client.lastName}`;
      const caseMetadata = {
        caseId: caseId,
        caseName: caseId,  // Using caseId as caseName initially
        clientName: clientName,
        assignedTo: '',
        caseType: '',
        status: '',
        notes: '',
        createdBy: createdBy,
        createdAt: now
      };

      // Save case metadata to the metadata sheet
      SheetsService.createCase(caseMetadata, createdBy);

      // Generate new token to extend session
      const newToken = TokenManager.generateToken(context.user.email);

      return ResponseHandler.successWithToken(
        'case.create.success',
        'Case folder created successfully',
        {
          caseId: caseId,
          clientId: clientId,
          folderId: caseFolderId,
          folderPath: folderPath,
          folderUrl: caseFolder.getUrl(),
          fileCount: 0,
          createdAt: DateUtil.formatDate(caseFolder.getDateCreated()),
          lastModified: DateUtil.formatDate(caseFolder.getLastUpdated())
        },
        context.user,
        newToken.value
      );

    } catch (error) {
      if (error.status) {
        throw error;
      }
      throw ResponseHandler.serverError(
        'Failed to create case: ' + error.toString(),
        'case.create.error.server'
      );
    }
  }
};
