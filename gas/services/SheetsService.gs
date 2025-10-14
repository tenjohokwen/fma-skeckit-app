/**
 * SheetsService.gs
 *
 * Provides database operations for case metadata management.
 * Interacts with the 'metadata' sheet in Google Sheets.
 *
 * Schema:
 * A: clientFirstName, B: clientLastName, C: clientEmail, D: clientPhoneNumber,
 * E: amountPaid, F: paymentStatus, G: folderName, H: folderPath,
 * I: assignedTo, J: assignedAt, K: lastUpdatedBy, L: lastUpdatedAt,
 * M: tasksRemaining, N: nextAction, O: comment, P: dueDate,
 * Q: status, R: caseId, S: version
 */

const SheetsService = {
  /**
   * Gets the metadata sheet
   * @returns {GoogleAppsScript.Spreadsheet.Sheet} Metadata sheet
   */
  getMetadataSheet: function() {
    const props = PropertiesService.getScriptProperties();
    const spreadsheetId = props.getProperty('SPREADSHEET_ID');
    const ss = SpreadsheetApp.openById(spreadsheetId);
    return ss.getSheetByName('metadata');
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
      caseId: row[17],
      clientFirstName: row[0],
      clientLastName: row[1],
      clientEmail: row[2],
      clientPhoneNumber: row[3],
      amountPaid: row[4],
      paymentStatus: row[5],
      folderName: row[6],
      folderPath: row[7],
      assignedTo: row[8],
      tasksRemaining: row[12],
      nextAction: row[13],
      comment: row[14],
      dueDate: row[15],
      status: row[16]
    };

    if (includeSystemFields) {
      caseData.assignedAt = row[9];
      caseData.lastUpdatedBy = row[10];
      caseData.lastUpdatedAt = row[11];
      caseData.version = row[18];
      caseData.rowIndex = rowIndex;
    }

    return caseData;
  },

  /**
   * Searches for cases by client first name and/or last name
   * @param {string} firstName - Client first name (optional, partial match)
   * @param {string} lastName - Client last name (optional, partial match)
   * @returns {Array} Array of matching case objects
   */
  searchCasesByName: function(firstName, lastName) {
    const sheet = this.getMetadataSheet();
    const data = sheet.getDataRange().getValues();
    const results = [];

    // Normalize search terms (case-insensitive)
    const searchFirst = firstName ? firstName.toLowerCase().trim() : null;
    const searchLast = lastName ? lastName.toLowerCase().trim() : null;

    // Skip header row
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const rowFirstName = (row[0] || '').toLowerCase();
      const rowLastName = (row[1] || '').toLowerCase();

      let matches = false;

      if (searchFirst && searchLast) {
        // Both names provided - both must match
        matches = rowFirstName.includes(searchFirst) && rowLastName.includes(searchLast);
      } else if (searchFirst) {
        // Only first name provided
        matches = rowFirstName.includes(searchFirst);
      } else if (searchLast) {
        // Only last name provided
        matches = rowLastName.includes(searchLast);
      }

      if (matches) {
        // Exclude system-generated fields for search results
        results.push(this.parseRow(row, i + 1, false));
      }
    }

    return results;
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
      if (row[17] === caseId) {
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
      if (row[17] === caseId) {
        // Include system-generated fields for editing
        return this.parseRow(row, i + 1, true);
      }
    }

    return null;
  },

  /**
   * Creates a new case metadata entry
   * @param {Object} caseData - Case data object
   * @param {string} currentUser - Email of user creating the case
   * @returns {Object} Created case object
   */
  createCase: function(caseData, currentUser) {
    const sheet = this.getMetadataSheet();

    // Check if case ID already exists
    const existing = this.getCaseById(caseData.caseId);
    if (existing) {
      throw ResponseHandler.conflictError(
        'Case ID already exists',
        'metadata.create.error.duplicate'
      );
    }

    const now = DateUtil.getCurrentTimestamp();
    const assignedAt = caseData.assignedTo ? now : '';

    // Create case row
    const row = [
      caseData.clientFirstName,              // A: clientFirstName
      caseData.clientLastName,               // B: clientLastName
      caseData.clientEmail || '',            // C: clientEmail
      caseData.clientPhoneNumber || '',      // D: clientPhoneNumber
      caseData.amountPaid || 0,              // E: amountPaid
      caseData.paymentStatus || '',          // F: paymentStatus
      caseData.folderName,                   // G: folderName
      caseData.folderPath,                   // H: folderPath
      caseData.assignedTo || '',             // I: assignedTo
      assignedAt,                            // J: assignedAt
      currentUser,                           // K: lastUpdatedBy
      now,                                   // L: lastUpdatedAt
      caseData.tasksRemaining || '',         // M: tasksRemaining
      caseData.nextAction || '',             // N: nextAction
      caseData.comment || '',                // O: comment
      caseData.dueDate || '',                // P: dueDate
      caseData.status || '',                 // Q: status
      caseData.caseId,                       // R: caseId
      1                                      // S: version
    ];

    sheet.appendRow(row);

    // Return created case
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

    // Update editable fields
    if (updates.clientFirstName !== undefined) {
      sheet.getRange(row, 1).setValue(updates.clientFirstName);
    }
    if (updates.clientLastName !== undefined) {
      sheet.getRange(row, 2).setValue(updates.clientLastName);
    }
    if (updates.clientEmail !== undefined) {
      sheet.getRange(row, 3).setValue(updates.clientEmail);
    }
    if (updates.clientPhoneNumber !== undefined) {
      sheet.getRange(row, 4).setValue(updates.clientPhoneNumber);
    }
    if (updates.amountPaid !== undefined) {
      sheet.getRange(row, 5).setValue(updates.amountPaid);
    }
    if (updates.paymentStatus !== undefined) {
      sheet.getRange(row, 6).setValue(updates.paymentStatus);
    }
    if (updates.folderName !== undefined) {
      sheet.getRange(row, 7).setValue(updates.folderName);
    }
    if (updates.folderPath !== undefined) {
      sheet.getRange(row, 8).setValue(updates.folderPath);
    }
    if (updates.assignedTo !== undefined) {
      sheet.getRange(row, 9).setValue(updates.assignedTo);
    }
    if (updates.tasksRemaining !== undefined) {
      sheet.getRange(row, 13).setValue(updates.tasksRemaining);
    }
    if (updates.nextAction !== undefined) {
      sheet.getRange(row, 14).setValue(updates.nextAction);
    }
    if (updates.comment !== undefined) {
      sheet.getRange(row, 15).setValue(updates.comment);
    }
    if (updates.dueDate !== undefined) {
      sheet.getRange(row, 16).setValue(updates.dueDate);
    }
    if (updates.status !== undefined) {
      sheet.getRange(row, 17).setValue(updates.status);
    }

    // Auto-update system fields
    if (assignedToChanged) {
      sheet.getRange(row, 10).setValue(now); // J: assignedAt
    }
    sheet.getRange(row, 11).setValue(currentUser);         // K: lastUpdatedBy
    sheet.getRange(row, 12).setValue(now);                 // L: lastUpdatedAt
    sheet.getRange(row, 19).setValue(expectedVersion + 1); // S: version

    // Return updated case
    return this.getCaseById(caseId);
  }
};
