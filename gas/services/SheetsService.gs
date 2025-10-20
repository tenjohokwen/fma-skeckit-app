/**
 * SheetsService.gs
 *
 * Provides database operations for case metadata and client management.
 * Interacts with 'metadata' and 'clients' sheets in Google Sheets.
 *
 * Metadata Schema (Updated for Feature 007 - clientName column removed):
 * A: caseId, B: caseName, C: clientId (UUID), D: assignedTo,
 * E: caseType, F: status, G: notes, H: createdBy, I: createdAt,
 * J: assignedAt, K: lastUpdatedBy, L: lastUpdatedAt, M: version
 *
 * Clients Schema:
 * A: clientId (UUID), B: firstName, C: lastName, D: nationalId (unique),
 * E: telephone, F: email, G: folderId, H: createdAt, I: updatedAt
 */

const SheetsService = {
  // ==================== VALIDATION HELPERS ====================

  /**
   * Validates if a string is a valid UUID format
   * @param {string} uuid - The UUID to validate
   * @returns {boolean} True if valid UUID format
   */
  isValidUUID: function(uuid) {
    if (!uuid || typeof uuid !== 'string') {
      return false;
    }
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  },

  // ==================== SHEET ACCESS METHODS ====================
  /**
   * Gets the metadata sheet
   * @returns {GoogleAppsScript.Spreadsheet.Sheet} Metadata sheet
   * @throws {Error} If metadata sheet doesn't exist
   */
  getMetadataSheet: function() {
    const props = PropertiesService.getScriptProperties();
    const spreadsheetId = props.getProperty('SPREADSHEET_ID');
    const ss = SpreadsheetApp.openById(spreadsheetId);
    const sheet = ss.getSheetByName('metadata');

    if (!sheet) {
      throw ResponseHandler.serverError(
        'Metadata sheet not found. Please create a sheet named "metadata" in your spreadsheet with the required columns.',
        'sheets.error.metadataNotFound'
      );
    }

    return sheet;
  },

  /**
   * Gets the clients sheet
   * @returns {GoogleAppsScript.Spreadsheet.Sheet} Clients sheet
   * @throws {Error} If clients sheet doesn't exist
   */
  getClientsSheet: function() {
    const props = PropertiesService.getScriptProperties();
    const spreadsheetId = props.getProperty('SPREADSHEET_ID');
    const ss = SpreadsheetApp.openById(spreadsheetId);
    const sheet = ss.getSheetByName('clients');

    if (!sheet) {
      throw ResponseHandler.serverError(
        'Clients sheet not found. Please create a sheet named "clients" in your spreadsheet with the required columns.',
        'sheets.error.clientsNotFound'
      );
    }

    return sheet;
  },

  /**
   * Parses a row into a case metadata object
   * @param {Array} row - Row data from sheet
   * @param {number} rowIndex - Row index (1-based)
   * @param {boolean} includeSystemFields - Whether to include system-generated fields
   * @returns {Object} Case metadata object
   */
  parseRow: function(row, rowIndex, includeSystemFields) {
    const caseData = {
      caseId: row[0],          // A: caseId
      caseName: row[1],        // B: caseName
      clientId: row[2],        // C: clientId (UUID)
      assignedTo: row[3],      // D: assignedTo
      caseType: row[4],        // E: caseType
      status: row[5],          // F: status
      notes: row[6]            // G: notes
    };

    if (includeSystemFields) {
      caseData.createdBy = row[7];          // H: createdBy
      caseData.createdAt = row[8];          // I: createdAt
      caseData.assignedAt = row[9];         // J: assignedAt
      caseData.lastUpdatedBy = row[10];     // K: lastUpdatedBy
      caseData.lastUpdatedAt = row[11];     // L: lastUpdatedAt
      caseData.version = row[12];           // M: version
      caseData.rowIndex = rowIndex;
    }

    return caseData;
  },

  /**
   * Searches for cases by client name (combined search of firstName and lastName)
   * Feature 007: Search clients sheet first, then find cases by clientId
   * @param {string} firstName - Client first name (optional, partial match)
   * @param {string} lastName - Client last name (optional, partial match)
   * @returns {Array} Array of matching case objects
   */
  searchCasesByName: function(firstName, lastName) {
    // Normalize search terms (case-insensitive)
    const searchFirst = firstName ? firstName.toLowerCase().trim() : null;
    const searchLast = lastName ? lastName.toLowerCase().trim() : null;

    // Step 1: Find matching clients
    const clients = this.getAllClients();
    const matchingClientIds = [];

    clients.forEach(client => {
      const clientFirstName = (client.firstName || '').toLowerCase();
      const clientLastName = (client.lastName || '').toLowerCase();

      let matches = false;
      if (searchFirst && searchLast) {
        matches = clientFirstName.includes(searchFirst) && clientLastName.includes(searchLast);
      } else if (searchFirst) {
        matches = clientFirstName.includes(searchFirst);
      } else if (searchLast) {
        matches = clientLastName.includes(searchLast);
      }

      if (matches) {
        matchingClientIds.push(client.clientId);
      }
    });

    // Step 2: Find cases for matching clients
    const sheet = this.getMetadataSheet();
    const data = sheet.getDataRange().getValues();
    const results = [];

    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const clientId = row[2]; // Column C: clientId

      if (matchingClientIds.includes(clientId)) {
        results.push(this.parseRow(row, i + 1, false));
      }
    }

    // Step 3: Enrich with client names
    return this.enrichCasesWithClientNames(results);
  },

  /**
   * Searches for a case by unique case ID
   * @param {string} caseId - Case ID to search for
   * @returns {Object|null} Case object or null if not found
   */
  searchCaseByCaseId: function(caseId) {
    const sheet = this.getMetadataSheet();
    const data = sheet.getDataRange().getValues();

    // Skip header row
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      if (row[0] === caseId) { // A: caseId
        // Exclude system-generated fields for search results
        return this.parseRow(row, i + 1, false);
      }
    }

    return null;
  },

  /**
   * Gets a case by ID with all fields (for editing)
   * @param {string} caseId - Case ID
   * @returns {Object|null} Full case object with system fields or null if not found
   */
  getCaseById: function(caseId) {
    const sheet = this.getMetadataSheet();
    const data = sheet.getDataRange().getValues();

    // Skip header row
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      if (row[0] === caseId) { // A: caseId
        // Include system-generated fields for editing
        const caseData = this.parseRow(row, i + 1, true);

        // Feature 007: Enrich with client name from clients sheet
        return this.enrichCaseWithClientName(caseData);
      }
    }

    return null;
  },

  /**
   * Gets all cases from metadata sheet (for dashboard analytics)
   * Feature 008: Dashboard Analytics
   * @returns {Array} Array of all case objects
   */
  getAllCases: function() {
    const sheet = this.getMetadataSheet();
    const data = sheet.getDataRange().getValues();
    const cases = [];

    // Skip header row
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      if (row[0]) { // Only include rows with caseId
        cases.push(this.parseRow(row, i + 1, true));
      }
    }

    return cases;
  },

  /**
   * Creates a new case metadata entry
   * @param {Object} caseData - Case data object
   * @param {string} currentUser - Email of user creating the case
   * @returns {Object} Created case object
   */
  createCase: function(caseData, currentUser) {
    const sheet = this.getMetadataSheet();

    // ========================================
    // VALIDATION: clientId is required
    // ========================================
    if (!caseData.clientId) {
      throw ResponseHandler.validationError(
        'clientId is required for case creation',
        'metadata.create.error.clientIdRequired'
      );
    }

    // ========================================
    // VALIDATION: clientId must be valid UUID
    // ========================================
    if (!this.isValidUUID(caseData.clientId)) {
      throw ResponseHandler.validationError(
        'clientId must be a valid UUID format',
        'metadata.create.error.invalidClientId'
      );
    }

    // ========================================
    // VALIDATION: clientId must exist in clients sheet
    // ========================================
    const client = this.getClientById(caseData.clientId);
    if (!client) {
      throw ResponseHandler.validationError(
        `Client with ID ${caseData.clientId} not found in clients sheet`,
        'metadata.create.error.clientNotFound'
      );
    }

    // Check if case ID already exists
    const existing = this.getCaseById(caseData.caseId);
    if (existing) {
      throw ResponseHandler.conflictError(
        'Case ID already exists',
        'metadata.create.error.duplicate'
      );
    }

    const now = caseData.createdAt || DateUtil.getCurrentTimestamp();
    const assignedAt = caseData.assignedTo ? now : '';
    const createdBy = caseData.createdBy || currentUser;

    // ========================================
    // ROW DATA: Include clientId in Column C
    // Feature 007: clientName column removed from metadata sheet
    // ========================================
    const row = [
      caseData.caseId,                       // A: caseId
      caseData.caseName || '',               // B: caseName
      caseData.clientId,                     // C: clientId (UUID)
      caseData.assignedTo || '',             // D: assignedTo
      caseData.caseType || '',               // E: caseType
      caseData.status || '',                 // F: status
      caseData.notes || '',                  // G: notes
      createdBy,                             // H: createdBy
      now,                                   // I: createdAt
      assignedAt,                            // J: assignedAt
      currentUser,                           // K: lastUpdatedBy
      now,                                   // L: lastUpdatedAt
      0                                      // M: version
    ];

    sheet.appendRow(row);

    // Return created case with dynamically enriched client name
    // Feature 007: getCaseById() already enriches with client name
    return this.getCaseById(caseData.caseId);
  },

  /**
   * Updates case metadata with optimistic locking
   * @param {string} caseId - Case ID
   * @param {Object} updates - Fields to update
   * @param {number} expectedVersion - Expected current version number
   * @param {string} currentUser - Email of user making the update
   * @returns {Object} Updated case object
   */
  updateCase: function(caseId, updates, expectedVersion, currentUser) {
    // ========================================
    // VALIDATION: Reject clientId updates
    // ========================================
    if (updates.hasOwnProperty('clientId')) {
      throw ResponseHandler.validationError(
        'clientId is immutable and cannot be updated',
        'metadata.update.error.clientIdImmutable'
      );
    }

    // ========================================
    // VALIDATION: Feature 007 - Reject clientName updates (no longer stored in sheet)
    // ========================================
    if (updates.hasOwnProperty('clientName')) {
      throw ResponseHandler.validationError(
        'clientName is not stored in the metadata sheet. Update client information from Client Details page.',
        'metadata.update.error.clientNameNotStored'
      );
    }

    const currentCase = this.getCaseById(caseId);
    if (!currentCase) {
      throw ResponseHandler.notFoundError(
        'Case not found',
        'metadata.update.error.notfound'
      );
    }

    // Check version for optimistic locking
    if (currentCase.version !== expectedVersion) {
      throw ResponseHandler.error({
        status: 409,
        msgKey: 'metadata.update.error.conflict',
        message: 'Case was modified by another user. Please refresh and try again.',
        data: {
          currentVersion: currentCase.version,
          expectedVersion: expectedVersion
        }
      });
    }

    const sheet = this.getMetadataSheet();
    const row = currentCase.rowIndex;
    const now = DateUtil.getCurrentTimestamp();

    // Track if assignedTo changed
    const assignedToChanged = updates.assignedTo !== undefined &&
                              updates.assignedTo !== currentCase.assignedTo;

    // ========================================
    // Update editable fields (Feature 007: clientName column removed)
    // ========================================
    // A: caseId - not editable
    if (updates.caseName !== undefined) {
      sheet.getRange(row, 2).setValue(updates.caseName); // B: caseName
    }
    // C: clientId - NOT EDITABLE (system-managed)
    // D: clientName - REMOVED (no longer stored in sheet)
    if (updates.assignedTo !== undefined) {
      sheet.getRange(row, 4).setValue(updates.assignedTo); // D: assignedTo
    }
    if (updates.caseType !== undefined) {
      sheet.getRange(row, 5).setValue(updates.caseType); // E: caseType
    }
    if (updates.status !== undefined) {
      sheet.getRange(row, 6).setValue(updates.status); // F: status
    }
    if (updates.notes !== undefined) {
      sheet.getRange(row, 7).setValue(updates.notes); // G: notes
    }

    // ========================================
    // Auto-update system fields
    // ========================================
    if (assignedToChanged) {
      sheet.getRange(row, 10).setValue(now); // J: assignedAt
    }
    sheet.getRange(row, 11).setValue(currentUser);         // K: lastUpdatedBy
    sheet.getRange(row, 12).setValue(now);                 // L: lastUpdatedAt
    sheet.getRange(row, 13).setValue(expectedVersion + 1); // M: version

    // Return updated case
    return this.getCaseById(caseId);
  },

  // ==================== CLIENT MANAGEMENT METHODS ====================

  /**
   * Parses a client row into a client object
   * @param {Array} row - Row data from clients sheet
   * @returns {Object} Client object
   */
  parseClientRow: function(row) {
    return {
      clientId: row[0],
      firstName: row[1],
      lastName: row[2],
      nationalId: row[3],
      telephone: row[4] || '',
      email: row[5] || '',
      folderId: row[6] || '',
      createdAt: row[7],
      updatedAt: row[8]
    };
  },

  /**
   * Gets all clients from the clients sheet
   * @returns {Array} Array of all client objects
   */
  getAllClients: function() {
    const sheet = this.getClientsSheet();
    const data = sheet.getDataRange().getValues();
    const clients = [];

    // Skip header row
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      // Skip empty rows
      if (row[0]) {
        clients.push(this.parseClientRow(row));
      }
    }

    return clients;
  },

  /**
   * Gets a client by their unique national ID
   * @param {string} nationalId - National ID to search for
   * @returns {Object|null} Client object or null if not found
   */
  getClientByNationalId: function(nationalId) {
    const sheet = this.getClientsSheet();
    const data = sheet.getDataRange().getValues();

    // Skip header row
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      if (row[3] === nationalId) {
        return this.parseClientRow(row);
      }
    }

    return null;
  },

  /**
   * Gets a client by their client ID
   * @param {string} clientId - Client ID (UUID)
   * @returns {Object|null} Client object or null if not found
   */
  getClientById: function(clientId) {
    const sheet = this.getClientsSheet();
    const data = sheet.getDataRange().getValues();

    // Skip header row
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      if (row[0] === clientId) {
        return this.parseClientRow(row);
      }
    }

    return null;
  },

  /**
   * Creates a new client entry
   * @param {Object} clientData - Client data object
   * @param {string} clientData.clientId - UUID for the client
   * @param {string} clientData.firstName - First name (required)
   * @param {string} clientData.lastName - Last name (required)
   * @param {string} clientData.nationalId - National ID (required, unique)
   * @param {string} clientData.telephone - Telephone (optional)
   * @param {string} clientData.email - Email (optional)
   * @param {string} clientData.folderId - Google Drive folder ID (optional)
   * @returns {Object} Created client object
   */
  createClient: function(clientData) {
    const sheet = this.getClientsSheet();

    // Check if national ID already exists
    const existing = this.getClientByNationalId(clientData.nationalId);
    if (existing) {
      throw ResponseHandler.conflictError(
        'A client with this National ID already exists',
        'client.create.error.duplicate'
      );
    }

    const now = DateUtil.getCurrentTimestamp();

    // Create client row
    const row = [
      clientData.clientId,            // A: clientId (UUID)
      clientData.firstName,           // B: firstName
      clientData.lastName,            // C: lastName
      clientData.nationalId,          // D: nationalId (unique)
      clientData.telephone || '',     // E: telephone
      clientData.email || '',         // F: email
      clientData.folderId || '',      // G: folderId
      now,                            // H: createdAt
      now                             // I: updatedAt
    ];

    sheet.appendRow(row);

    // Return created client
    return this.getClientById(clientData.clientId);
  },

  /**
   * Updates an existing client
   * @param {string} clientId - Client ID to update
   * @param {Object} updates - Fields to update
   * @returns {Object} Updated client object
   */
  updateClient: function(clientId, updates) {
    const sheet = this.getClientsSheet();
    const data = sheet.getDataRange().getValues();
    let rowIndex = -1;

    // Find the client row
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === clientId) {
        rowIndex = i + 1; // Convert to 1-based index
        break;
      }
    }

    if (rowIndex === -1) {
      throw ResponseHandler.notFoundError(
        'Client not found',
        'client.update.error.notfound'
      );
    }

    const now = DateUtil.getCurrentTimestamp();

    // Update editable fields
    if (updates.firstName !== undefined) {
      sheet.getRange(rowIndex, 2).setValue(updates.firstName);
    }
    if (updates.lastName !== undefined) {
      sheet.getRange(rowIndex, 3).setValue(updates.lastName);
    }
    if (updates.telephone !== undefined) {
      sheet.getRange(rowIndex, 5).setValue(updates.telephone);
    }
    if (updates.email !== undefined) {
      sheet.getRange(rowIndex, 6).setValue(updates.email);
    }
    if (updates.folderId !== undefined) {
      sheet.getRange(rowIndex, 7).setValue(updates.folderId);
    }

    // Auto-update updatedAt timestamp
    sheet.getRange(rowIndex, 9).setValue(now);

    // Return updated client
    return this.getClientById(clientId);
  },

  // ==================== CLIENT NAME ENRICHMENT ====================

  /**
   * Enriches case data with client name from clients sheet
   * Feature 007: Dynamic client name lookup for data consistency
   *
   * @param {Object} caseData - Case data object
   * @returns {Object} Case data with clientName added
   */
  enrichCaseWithClientName: function(caseData) {
    if (!caseData) {
      return caseData;
    }

    if (caseData.clientId) {
      try {
        const client = this.getClientById(caseData.clientId);
        if (client) {
          caseData.clientName = `${client.firstName} ${client.lastName}`;
        } else {
          caseData.clientName = '[Client Not Found]';
          Logger.log(`WARNING: Client not found for clientId: ${caseData.clientId} in case: ${caseData.caseId}`);
        }
      } catch (error) {
        caseData.clientName = '[Error Loading Client]';
        Logger.log(`ERROR: Failed to fetch client ${caseData.clientId}: ${error.message}`);
      }
    } else {
      caseData.clientName = '[No Client]';
      Logger.log(`WARNING: Case ${caseData.caseId} has no clientId`);
    }

    return caseData;
  },

  /**
   * Enriches multiple cases with client names (optimized batch lookup)
   * Feature 007: Batch processing for performance
   *
   * @param {Array} cases - Array of case data objects
   * @returns {Array} Cases with clientNames added
   */
  enrichCasesWithClientNames: function(cases) {
    if (!Array.isArray(cases) || cases.length === 0) {
      return cases;
    }

    // Extract unique clientIds
    const clientIds = [...new Set(cases.map(c => c.clientId).filter(Boolean))];

    // Build client lookup map for efficiency
    const clientMap = {};
    clientIds.forEach(clientId => {
      try {
        const client = this.getClientById(clientId);
        if (client) {
          clientMap[clientId] = `${client.firstName} ${client.lastName}`;
        }
      } catch (error) {
        Logger.log(`ERROR: Failed to fetch client ${clientId}: ${error.message}`);
      }
    });

    // Enrich each case
    return cases.map(caseData => {
      if (caseData.clientId && clientMap[caseData.clientId]) {
        caseData.clientName = clientMap[caseData.clientId];
      } else if (caseData.clientId) {
        caseData.clientName = '[Client Not Found]';
      } else {
        caseData.clientName = '[No Client]';
      }
      return caseData;
    });
  }
};
