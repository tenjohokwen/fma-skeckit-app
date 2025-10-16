/**
 * Main.gs
 *
 * Entry point for the Google Apps Script API.
 * Handles all incoming POST requests and routes them through the security and routing layers.
 *
 * Request Flow:
 * Client → doPost() → SecurityInterceptor → Router → Handler → ResponseHandler → Client
 */

/**
 * Handles POST requests to the web app
 * This is the main entry point for all API calls
 *
 * @param {Object} e - Event object containing request data
 * @returns {GoogleAppsScript.Content.TextOutput} JSON response
 */
function doPost(e) {
  return ResponseHandler.handle(function() {
    // Step 1: Validate request and authenticate user
    const context = SecurityInterceptor.validateRequest(e);

    // Step 2: Route to appropriate handler
    const result = Router.route(context);

    // Step 3: Return result (ResponseHandler.handle wraps this)
    return result;
  });
}

/**
 * Handles GET requests (optional - for health checks)
 * @param {Object} e - Event object
 * @returns {GoogleAppsScript.Content.TextOutput} JSON response
 */
function doGet(e) {
  return ResponseHandler.success({
    status: 200,
    msgKey: 'health.ok',
    message: 'File Management System API is running',
    data: {
      version: '1.0.0',
      timestamp: DateUtil.getCurrentTimestamp(),
      timezone: DateUtil.getTimezone()
    }
  });
}

/**
 * Test function to verify setup
 * Run this manually in Apps Script editor to verify configuration
 */
function testSetup() {
  const props = PropertiesService.getScriptProperties();

  const requiredProps = [
    'SPREADSHEET_ID',
    'CASES_FOLDER_ID',
    'ENCRYPTION_KEY',
    'TOKEN_TTL_MINUTES',
    'OTP_TTL_HOURS',
    'APP_TIMEZONE'
  ];

  const results = {
    configured: [],
    missing: []
  };

  requiredProps.forEach(function(prop) {
    const value = props.getProperty(prop);
    if (value) {
      results.configured.push(prop);
    } else {
      results.missing.push(prop);
    }
  });

  console.log('Setup Test Results:');
  console.log('Configured properties:', results.configured);
  console.log('Missing properties:', results.missing);

  if (results.missing.length > 0) {
    console.error('ERROR: Missing required properties. Please configure them in Project Settings.');
    return false;
  }

  // Test spreadsheet access
  try {
    const ss = SpreadsheetApp.openById(props.getProperty('SPREADSHEET_ID'));
    const usersSheet = ss.getSheetByName('users');
    const metadataSheet = ss.getSheetByName('caseMetadata');

    if (!usersSheet || !metadataSheet) {
      console.error('ERROR: Required sheets not found. Expected: users, caseMetadata');
      return false;
    }

    console.log('Spreadsheet access: OK');
  } catch (error) {
    console.error('ERROR: Cannot access spreadsheet:', error.message);
    return false;
  }

  // Test Drive folder access
  try {
    const folder = DriveApp.getFolderById(props.getProperty('CASES_FOLDER_ID'));
    console.log('Drive folder access: OK (' + folder.getName() + ')');
  } catch (error) {
    console.error('ERROR: Cannot access Drive folder:', error.message);
    return false;
  }

  console.log('All checks passed! Setup is complete.');
  return true;
}

/**
 * Lists all available API routes
 * Run this manually in Apps Script editor to see available endpoints
 */
function listApiRoutes() {
  const routes = Router.listRoutes();
  console.log('Available API Routes:');

  Object.keys(routes).forEach(function(route) {
    console.log(' - ' + route + ': ' + routes[route]);
  });
}

/**
 * Test the client.update endpoint
 * Run this manually in Apps Script editor to test the update functionality
 */
function testClientUpdate() {
  // Get a test client first
  const clients = SheetsService.getAllClients();
  if (clients.length === 0) {
    console.error('No clients found to test with');
    return;
  }

  const testClient = clients[0];
  console.log('Testing with client:', testClient.clientId, testClient.firstName, testClient.lastName);

  try {
    // Test update
    const updated = SheetsService.updateClient(testClient.clientId, {
      firstName: testClient.firstName,
      lastName: testClient.lastName,
      nationalId: testClient.nationalId,
      telephone: testClient.telephone || '',
      email: testClient.email || ''
    });

    console.log('Update successful:', updated);
    return true;
  } catch (error) {
    console.error('Update failed:', error.message);
    console.error('Stack:', error.stack);
    return false;
  }
}
