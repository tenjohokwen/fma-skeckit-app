/**
 * ClientHandler.gs
 *
 * Handles client-related operations including search, create, and retrieval.
 * Interacts with SheetsService for client data and DriveService for folder management.
 *
 * Per constitution: Handler layer for client business logic.
 */

const ClientHandler = {
  /**
   * Search for clients by name and/or national ID
   * @param {Object} context - Request context from Router
   * @param {Object} context.data - Request data
   * @param {string} context.data.firstName - First name (optional)
   * @param {string} context.data.lastName - Last name (optional)
   * @param {string} context.data.nationalId - National ID (optional)
   * @param {Object} context.user - Current user
   * @returns {Object} Response with matching clients
   */
  search: function(context) {
    try {
      const { firstName, lastName, nationalId } = context.data;

      // Validate at least one search criterion exists
      if (!firstName && !lastName && !nationalId) {
        throw ResponseHandler.validationError(
          'At least one search criterion is required',
          'client.search.error.missingCriteria'
        );
      }

      // Get all clients from Sheets
      const allClients = SheetsService.getAllClients();

      // Filter clients based on search criteria
      const matchedClients = allClients.filter(client => {
        let matches = true;

        if (firstName) {
          const clientFirstName = (client.firstName || '').toLowerCase();
          const searchFirst = firstName.toLowerCase().trim();
          matches = matches && clientFirstName.includes(searchFirst);
        }

        if (lastName) {
          const clientLastName = (client.lastName || '').toLowerCase();
          const searchLast = lastName.toLowerCase().trim();
          matches = matches && clientLastName.includes(searchLast);
        }

        if (nationalId) {
          const clientNationalId = (client.nationalId || '').toLowerCase();
          const searchId = nationalId.toLowerCase().trim();
          matches = matches && clientNationalId.includes(searchId);
        }

        return matches;
      });

      return {
        status: 200,
        msgKey: 'client.search.success',
        message: `Found ${matchedClients.length} client(s)`,
        data: {
          clients: matchedClients,
          count: matchedClients.length,
          searchCriteria: {
            firstName: firstName || '',
            lastName: lastName || '',
            nationalId: nationalId || ''
          }
        }
      };

    } catch (error) {
      if (error.status) {
        throw error;
      }
      throw ResponseHandler.serverError(
        'Failed to search clients: ' + error.toString(),
        'client.search.error.server'
      );
    }
  },

  /**
   * Create a new client with automatic folder creation
   * @param {Object} context - Request context from Router
   * @param {Object} context.data - Request data
   * @param {string} context.data.firstName - First name (required)
   * @param {string} context.data.lastName - Last name (required)
   * @param {string} context.data.nationalId - National ID (required)
   * @param {string} context.data.telephone - Telephone (optional)
   * @param {string} context.data.email - Email (optional)
   * @param {Object} context.user - Current user
   * @returns {Object} Response with created client
   */
  create: function(context) {
    try {
      // Admin-only authorization check
      if (!context.user || context.user.role !== 'ROLE_ADMIN') {
        throw ResponseHandler.forbiddenError(
          'Admin access required to create clients',
          'error.forbidden'
        );
      }

      const { firstName, lastName, nationalId, telephone, email } = context.data;

      // Validate required fields
      if (!firstName || !lastName || !nationalId) {
        throw ResponseHandler.validationError(
          'First name, last name, and national ID are required',
          'client.create.error.missingFields'
        );
      }

      // Generate UUID for client ID
      const clientId = Utilities.getUuid();

      // Sanitize names for folder creation (remove special characters)
      const sanitizedFirst = firstName.replace(/[<>:"/\\|?*]/g, '');
      const sanitizedLast = lastName.replace(/[<>:"/\\|?*]/g, '');
      const sanitizedId = nationalId.replace(/[<>:"/\\|?*]/g, '');

      // Create client folder: "cases/FirstName_LastName_NationalID"
      const folderName = `${sanitizedFirst}_${sanitizedLast}_${sanitizedId}`;
      const rootFolder = DriveService.getCasesRootFolder();

      // Check if folder already exists
      const existingFolders = rootFolder.getFoldersByName(folderName);
      let clientFolder;
      let folderId;

      if (existingFolders.hasNext()) {
        // Folder exists, use it
        clientFolder = existingFolders.next();
        folderId = clientFolder.getId();
      } else {
        // Create new folder
        clientFolder = rootFolder.createFolder(folderName);
        folderId = clientFolder.getId();

        // Set folder description with client info
        const description = `Client: ${firstName} ${lastName}\nNational ID: ${nationalId}`;
        clientFolder.setDescription(description);
      }

      // Create client record in Sheets
      const clientData = {
        clientId: clientId,
        firstName: firstName,
        lastName: lastName,
        nationalId: nationalId,
        telephone: telephone || '',
        email: email || '',
        folderId: folderId
      };

      const createdClient = SheetsService.createClient(clientData);

      return {
        status: 200,
        msgKey: 'client.create.success',
        message: 'Client created successfully',
        data: {
          client: createdClient,
          folderPath: `cases/${folderName}`,
          folderUrl: clientFolder.getUrl()
        }
      };

    } catch (error) {
      if (error.status) {
        throw error;
      }
      throw ResponseHandler.serverError(
        'Failed to create client: ' + error.toString(),
        'client.create.error.server'
      );
    }
  },

  /**
   * Get client details by ID with associated cases
   * @param {Object} context - Request context from Router
   * @param {Object} context.data - Request data
   * @param {string} context.data.clientId - Client ID
   * @param {Object} context.user - Current user
   * @returns {Object} Response with client details and cases
   */
  get: function(context) {
    try {
      const { clientId } = context.data;

      if (!clientId) {
        throw ResponseHandler.validationError(
          'Client ID is required',
          'client.get.error.missingId'
        );
      }

      // Get client from Sheets
      const client = SheetsService.getClientById(clientId);

      if (!client) {
        throw ResponseHandler.notFoundError(
          'Client not found',
          'client.get.error.notFound'
        );
      }

      // Get client's folder and list cases (subfolders)
      let cases = [];
      let caseCount = 0;

      if (client.folderId) {
        try {
          const clientFolder = DriveApp.getFolderById(client.folderId);
          const subfolders = clientFolder.getFolders();

          while (subfolders.hasNext()) {
            const caseFolder = subfolders.next();
            const fileCount = DriveService.countFolderItems(caseFolder);

            cases.push({
              caseId: caseFolder.getName(),
              folderId: caseFolder.getId(),
              fileCount: fileCount,
              createdAt: DateUtil.formatDate(caseFolder.getDateCreated()),
              lastModified: DateUtil.formatDate(caseFolder.getLastUpdated())
            });
          }

          caseCount = cases.length;
        } catch (e) {
          Logger.log('Error accessing client folder: ' + e.toString());
          // Continue without cases if folder access fails
        }
      }

      return {
        status: 200,
        msgKey: 'client.get.success',
        message: 'Client retrieved successfully',
        data: {
          client: client,
          cases: cases,
          caseCount: caseCount
        }
      };

    } catch (error) {
      if (error.status) {
        throw error;
      }
      throw ResponseHandler.serverError(
        'Failed to get client: ' + error.toString(),
        'client.get.error.server'
      );
    }
  },

  /**
   * Update client information
   * @param {Object} context - Request context from Router
   * @param {Object} context.data - Request data
   * @param {string} context.data.clientId - Client ID
   * @param {Object} context.data.updates - Fields to update
   * @param {Object} context.user - Current user
   * @returns {Object} Response with updated client
   */
  update: function(context) {
    try {
      const { clientId, updates } = context.data;

      if (!clientId) {
        throw ResponseHandler.validationError(
          'Client ID is required',
          'client.update.error.missingId'
        );
      }

      if (!updates || Object.keys(updates).length === 0) {
        throw ResponseHandler.validationError(
          'No updates provided',
          'client.update.error.noUpdates'
        );
      }

      // Validate firstName and lastName are not empty if provided
      if (updates.firstName !== undefined && !updates.firstName.trim()) {
        throw ResponseHandler.validationError(
          'First name cannot be empty',
          'client.update.error.emptyFirstName'
        );
      }

      if (updates.lastName !== undefined && !updates.lastName.trim()) {
        throw ResponseHandler.validationError(
          'Last name cannot be empty',
          'client.update.error.emptyLastName'
        );
      }

      // Update client in Sheets
      const updatedClient = SheetsService.updateClient(clientId, updates);

      if (!updatedClient) {
        throw ResponseHandler.notFoundError(
          'Client not found',
          'client.update.error.notFound'
        );
      }

      return {
        status: 200,
        msgKey: 'client.update.success',
        message: 'Client updated successfully',
        data: {
          client: updatedClient
        }
      };

    } catch (error) {
      if (error.status) {
        throw error;
      }
      throw ResponseHandler.serverError(
        'Failed to update client: ' + error.toString(),
        'client.update.error.server'
      );
    }
  }
};
