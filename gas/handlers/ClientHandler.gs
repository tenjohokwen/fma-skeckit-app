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
   * @param {Object} requestData - Request data
   * @param {string} requestData.firstName - First name (optional)
   * @param {string} requestData.lastName - Last name (optional)
   * @param {string} requestData.nationalId - National ID (optional)
   * @param {string} currentUser - Email of current user
   * @returns {Object} Response with matching clients
   */
  search: function(requestData, currentUser) {
    try {
      const { firstName, lastName, nationalId } = requestData;

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

      return ResponseHandler.success({
        clients: matchedClients,
        count: matchedClients.length,
        searchCriteria: {
          firstName: firstName || '',
          lastName: lastName || '',
          nationalId: nationalId || ''
        }
      }, 'client.search.success');

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
   * @param {Object} requestData - Request data
   * @param {string} requestData.firstName - First name (required)
   * @param {string} requestData.lastName - Last name (required)
   * @param {string} requestData.nationalId - National ID (required)
   * @param {string} requestData.telephone - Telephone (optional)
   * @param {string} requestData.email - Email (optional)
   * @param {string} currentUser - Email of current user
   * @returns {Object} Response with created client
   */
  create: function(requestData, currentUser) {
    try {
      const { firstName, lastName, nationalId, telephone, email } = requestData;

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

      return ResponseHandler.success({
        client: createdClient,
        folderPath: `cases/${folderName}`,
        folderUrl: clientFolder.getUrl()
      }, 'client.create.success');

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
   * @param {Object} requestData - Request data
   * @param {string} requestData.clientId - Client ID
   * @param {string} currentUser - Email of current user
   * @returns {Object} Response with client details and cases
   */
  get: function(requestData, currentUser) {
    try {
      const { clientId } = requestData;

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
              createdAt: DateUtil.formatTimestamp(caseFolder.getDateCreated()),
              lastModified: DateUtil.formatTimestamp(caseFolder.getLastUpdated())
            });
          }

          caseCount = cases.length;
        } catch (e) {
          Logger.log('Error accessing client folder: ' + e.toString());
          // Continue without cases if folder access fails
        }
      }

      return ResponseHandler.success({
        client: client,
        cases: cases,
        caseCount: caseCount
      }, 'client.get.success');

    } catch (error) {
      if (error.status) {
        throw error;
      }
      throw ResponseHandler.serverError(
        'Failed to get client: ' + error.toString(),
        'client.get.error.server'
      );
    }
  }
};
