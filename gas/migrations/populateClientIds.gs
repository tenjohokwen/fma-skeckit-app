/**
 * Feature 006: Migrate existing cases to include clientId
 *
 * This script populates the clientId column (Column C) in the metadata sheet
 * for all existing cases by matching clientName to the clients sheet.
 *
 * IMPORTANT: Run this AFTER manually inserting Column C in the metadata sheet
 *
 * @author Development Team
 * @date 2025-10-18
 */

/**
 * Main migration function
 * Populates clientId for all existing cases in metadata sheet
 *
 * @returns {Object} Migration results
 */
function migrateClientIds() {
  Logger.log('========================================');
  Logger.log('Starting clientId migration');
  Logger.log('========================================');

  const props = PropertiesService.getScriptProperties();
  const spreadsheetId = props.getProperty('SPREADSHEET_ID');
  const ss = SpreadsheetApp.openById(spreadsheetId);

  const metadataSheet = ss.getSheetByName('metadata');
  const clientsSheet = ss.getSheetByName('clients');

  if (!metadataSheet) {
    throw new Error('Metadata sheet not found');
  }

  if (!clientsSheet) {
    throw new Error('Clients sheet not found');
  }

  const metadataData = metadataSheet.getDataRange().getValues();
  const clientsData = clientsSheet.getDataRange().getValues();

  // ========================================
  // Build client lookup: fullName -> clientId
  // ========================================
  Logger.log('Building client lookup table...');
  const clientLookup = {};
  const duplicateNames = {};

  for (let i = 1; i < clientsData.length; i++) {
    const clientId = clientsData[i][0];   // Column A
    const firstName = clientsData[i][1];  // Column B
    const lastName = clientsData[i][2];   // Column C
    const fullName = `${firstName} ${lastName}`;

    // Track duplicates
    if (clientLookup[fullName]) {
      if (!duplicateNames[fullName]) {
        duplicateNames[fullName] = [clientLookup[fullName]];
      }
      duplicateNames[fullName].push(clientId);
    }

    // Keep last occurrence (will need manual review for duplicates)
    clientLookup[fullName] = clientId;
  }

  Logger.log(`Found ${Object.keys(clientLookup).length} unique client names`);

  if (Object.keys(duplicateNames).length > 0) {
    Logger.log('WARNING: Duplicate client names detected:');
    Object.keys(duplicateNames).forEach(name => {
      Logger.log(`  - "${name}": ${duplicateNames[name].length} clients`);
    });
  }

  // ========================================
  // Update metadata rows
  // ========================================
  Logger.log('Updating metadata rows...');
  let updatedCount = 0;
  let notFoundCount = 0;
  let alreadyPopulatedCount = 0;
  const notFoundCases = [];

  for (let i = 1; i < metadataData.length; i++) {
    const caseId = metadataData[i][0];         // Column A
    const existingClientId = metadataData[i][2]; // Column C
    const clientName = metadataData[i][3];     // Column D (after column insertion)

    // Skip if clientId already populated
    if (existingClientId && existingClientId.toString().trim() !== '') {
      alreadyPopulatedCount++;
      continue;
    }

    // Lookup clientId by name
    const clientId = clientLookup[clientName];

    if (clientId) {
      // Update Column C with clientId
      metadataSheet.getRange(i + 1, 3).setValue(clientId);
      updatedCount++;

      if (updatedCount % 10 === 0) {
        Logger.log(`  Progress: ${updatedCount} cases updated...`);
      }
    } else {
      notFoundCount++;
      notFoundCases.push({
        row: i + 1,
        caseId: caseId,
        clientName: clientName
      });
      Logger.log(`  WARNING: No client found for case "${caseId}" (${clientName})`);
    }
  }

  // ========================================
  // Migration summary
  // ========================================
  Logger.log('========================================');
  Logger.log('Migration complete!');
  Logger.log('========================================');
  Logger.log(`Total cases processed: ${metadataData.length - 1}`);
  Logger.log(`  - Updated: ${updatedCount}`);
  Logger.log(`  - Already populated: ${alreadyPopulatedCount}`);
  Logger.log(`  - Not found: ${notFoundCount}`);
  Logger.log('========================================');

  if (notFoundCases.length > 0) {
    Logger.log('Cases requiring manual review:');
    notFoundCases.forEach(item => {
      Logger.log(`  Row ${item.row}: ${item.caseId} - "${item.clientName}"`);
    });
  }

  if (Object.keys(duplicateNames).length > 0) {
    Logger.log('========================================');
    Logger.log('IMPORTANT: Duplicate client names detected!');
    Logger.log('Manual review required for these cases:');
    Object.keys(duplicateNames).forEach(name => {
      Logger.log(`  - "${name}": clientIds = ${duplicateNames[name].join(', ')}`);
    });
  }

  return {
    totalCases: metadataData.length - 1,
    updated: updatedCount,
    alreadyPopulated: alreadyPopulatedCount,
    notFound: notFoundCount,
    notFoundCases: notFoundCases,
    duplicateNames: duplicateNames
  };
}

/**
 * Validation script to check data integrity after migration
 *
 * @returns {Object} Validation results
 */
function validateClientIds() {
  Logger.log('========================================');
  Logger.log('Starting clientId validation');
  Logger.log('========================================');

  const props = PropertiesService.getScriptProperties();
  const spreadsheetId = props.getProperty('SPREADSHEET_ID');
  const ss = SpreadsheetApp.openById(spreadsheetId);

  const metadataSheet = ss.getSheetByName('metadata');
  const clientsSheet = ss.getSheetByName('clients');

  const metadataData = metadataSheet.getDataRange().getValues();
  const clientsData = clientsSheet.getDataRange().getValues();

  // Build set of valid clientIds
  const validClientIds = new Set();
  for (let i = 1; i < clientsData.length; i++) {
    validClientIds.add(clientsData[i][0]);
  }

  Logger.log(`Valid client IDs in system: ${validClientIds.size}`);

  // Check each case
  const issues = [];
  let validCount = 0;

  for (let i = 1; i < metadataData.length; i++) {
    const caseId = metadataData[i][0];
    const clientId = metadataData[i][2];  // Column C

    if (!clientId || clientId.toString().trim() === '') {
      issues.push({
        row: i + 1,
        caseId: caseId,
        issue: 'Missing clientId'
      });
    } else if (!validClientIds.has(clientId)) {
      issues.push({
        row: i + 1,
        caseId: caseId,
        clientId: clientId,
        issue: 'Orphaned (clientId not found in clients sheet)'
      });
    } else {
      validCount++;
    }
  }

  // Validation summary
  Logger.log('========================================');
  Logger.log('Validation complete!');
  Logger.log('========================================');
  Logger.log(`Total cases: ${metadataData.length - 1}`);
  Logger.log(`  - Valid: ${validCount}`);
  Logger.log(`  - Issues: ${issues.length}`);
  Logger.log('========================================');

  if (issues.length > 0) {
    Logger.log('Issues found:');
    issues.forEach(issue => {
      Logger.log(`  Row ${issue.row}: ${issue.caseId} - ${issue.issue}`);
    });
  } else {
    Logger.log('✅ All cases have valid clientId!');
  }

  return {
    totalCases: metadataData.length - 1,
    valid: validCount,
    issues: issues
  };
}

/**
 * Helper: Export migration results to a new sheet for review
 *
 * @param {Object} results - Migration results object
 */
function exportMigrationResults(results) {
  const props = PropertiesService.getScriptProperties();
  const spreadsheetId = props.getProperty('SPREADSHEET_ID');
  const ss = SpreadsheetApp.openById(spreadsheetId);

  const timestamp = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd_HHmmss');
  const sheetName = `Migration_Results_${timestamp}`;

  const resultSheet = ss.insertSheet(sheetName);

  // Write summary
  const summaryData = [
    ['Feature 006: clientId Migration Results'],
    ['Timestamp', new Date()],
    [''],
    ['Summary'],
    ['Total Cases', results.totalCases],
    ['Updated', results.updated],
    ['Already Populated', results.alreadyPopulated],
    ['Not Found', results.notFound],
    [''],
    ['Cases Not Found (Manual Review Required)']
  ];

  resultSheet.getRange(1, 1, summaryData.length, 2).setValues(summaryData);

  // Write not found cases
  if (results.notFoundCases && results.notFoundCases.length > 0) {
    const headers = [['Row', 'Case ID', 'Client Name']];
    const notFoundData = results.notFoundCases.map(item => [
      item.row,
      item.caseId,
      item.clientName
    ]);

    resultSheet.getRange(summaryData.length + 1, 1, 1, 3).setValues(headers);
    resultSheet.getRange(summaryData.length + 2, 1, notFoundData.length, 3).setValues(notFoundData);
  }

  Logger.log(`Results exported to sheet: ${sheetName}`);
  return sheetName;
}
