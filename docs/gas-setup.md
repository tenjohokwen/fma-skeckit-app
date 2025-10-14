# Google Apps Script Setup Guide

This guide explains how to set up and deploy the Google Apps Script backend for the File Management System.

## Prerequisites

- Google Account
- Completed [Google Workspace Setup](./google-setup.md)
- Basic understanding of JavaScript

## 1. Create Google Apps Script Project

### 1.1 Create New Project

1. Go to [Google Apps Script](https://script.google.com)
2. Click **New Project**
3. Name the project: `File Management System - Backend`

### 1.2 Enable Required APIs

1. In the Apps Script editor, click **Services** (+ icon in left sidebar)
2. Add the following services:
   - **Drive API** (DriveApp is built-in, but enable Drive API v3 for advanced operations)
   - **Sheets API** (SpreadsheetApp is built-in)

## 2. Project Structure

The Google Apps Script code follows this structure (per constitution):

```
gas/
├── security/
│   ├── SecurityInterceptor.gs    # Request validation and auth
│   └── TokenManager.gs            # Token generation and validation
├── handlers/
│   ├── AuthHandler.gs             # Authentication endpoints
│   ├── MetadataHandler.gs         # Case metadata endpoints
│   └── FileHandler.gs             # File management endpoints
├── services/
│   ├── UserService.gs             # User data operations
│   ├── MetadataService.gs         # Metadata operations
│   └── FileService.gs             # File operations
└── utils/
    ├── ResponseHandler.gs         # Standardized responses
    ├── PasswordUtil.gs            # Password hashing
    ├── DateUtil.gs                # Date formatting
    └── Router.gs                  # Request routing

Main.gs                            # Entry point (doPost)
```

## 3. Upload Code Files

### Option A: Manual Upload

1. In the Apps Script editor, click **+** next to **Files**
2. Choose **Script** for .gs files
3. Copy and paste the content from each file in the `gas/` directory (if a file called DateUtil.gs is in the utils directory then name it like so: "utils/DateUtil.gs" since gas will not let you create the folders)
4. Save each file

### Option B: Using clasp (Command Line)

Install and configure clasp for easier deployment:

```bash
# Install clasp globally
npm install -g @google/clasp

# Login to Google account
clasp login

# enable the API
Go to the URL below and then toggle the link/button to "on"
https://script.google.com/home/usersettings

# Create .clasp.json in project root
clasp create --type standalone --title "File Management System - Backend"

# Push all files to Apps Script
clasp push

# Open the project in browser
clasp open
```

**Note:** The project includes a `.claspignore` file to exclude unnecessary files.

## 4. Configure Script Properties

### 4.1 Set Properties via UI

1. In Apps Script editor, click **Project Settings** (gear icon)
2. Scroll to **Script Properties**
3. Click **Add script property** for each:

| Property            | Example Value             | Required |
| ------------------- | ------------------------- | -------- |
| `SPREADSHEET_ID`    | `1abc...xyz`              | Yes      |
| `CASES_FOLDER_ID`   | `1def...uvw`              | Yes      |
| `ENCRYPTION_KEY`    | `aBc123...XyZ` (32 chars) | Yes      |
| `TOKEN_TTL_MINUTES` | `15`                      | Yes      |
| `OTP_TTL_HOURS`     | `2`                       | Yes      |
| `APP_TIMEZONE`      | `Africa/Douala`           | Yes      |

### 4.2 Set Properties via Code (Alternative)

Run this function once to set properties programmatically:

```javascript
function setupScriptProperties() {
  const props = PropertiesService.getScriptProperties()

  props.setProperties({
    SPREADSHEET_ID: 'YOUR_SPREADSHEET_ID',
    CASES_FOLDER_ID: 'YOUR_FOLDER_ID',
    ENCRYPTION_KEY: 'YOUR_32_CHAR_ENCRYPTION_KEY',
    TOKEN_TTL_MINUTES: '15',
    OTP_TTL_HOURS: '2',
    APP_TIMEZONE: 'Africa/Douala',
  })

  console.log('Script properties set successfully')
}
```

## 5. Deploy as Web App

### 5.1 Create Deployment

1. Click **Deploy** > **New deployment**
2. Click **Select type** > **Web app**
3. Configure settings:
   - **Description**: `Production v1` (or version number)
   - **Execute as**: **Me** (your Google account)
   - **Who has access**: **Anyone** (required for public API)
4. Click **Deploy**

### 5.2 Authorize Permissions

On first deployment, you'll be prompted to authorize:

1. Click **Authorize access**
2. Choose your Google account
3. Click **Advanced** > **Go to [Project Name] (unsafe)** if prompted
4. Review and accept permissions:
   - View and manage spreadsheets in Google Drive
   - View and manage files in Google Drive
5. Click **Allow**

### 5.3 Copy Web App URL

After deployment, copy the **Web app URL**:

```
https://script.google.com/macros/s/AKfycby.../exec
```

Save this URL for frontend configuration.

## 6. Testing the Deployment

### 6.1 Test with Apps Script Test Runner

Create a test function in Apps Script:

```javascript
function testDeployment() {
  // Test signup endpoint
  const signupRequest = {
    parameter: {
      action: 'auth.signup',
    },
    postData: {
      contents: JSON.stringify({
        email: 'test@example.com',
        password: 'Test123!@#',
      }),
      type: 'application/json',
    },
  }

  const response = doPost(signupRequest)
  console.log('Signup response:', response.getContent())
}
```

Run the function and check the logs.

### 6.2 Test with curl

Test the deployed web app URL:

```bash
curl -X POST \
  https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec \
  -H "Content-Type: application/json" \
  -d '{
    "action": "auth.signup",
    "data": {
      "email": "test@example.com",
      "password": "Test123!@#"
    }
  }'
```

Expected response:

```json
{
  "status": 201,
  "msgKey": "auth.signup.success",
  "message": "User created successfully. Please check your email for verification.",
  "data": {
    "email": "test@example.com",
    "status": "PENDING"
  }
}
```

## 7. Update and Redeploy

### 7.1 Version Management

When updating code:

1. Make changes to files in `gas/` directory
2. Test changes using Apps Script editor test runner
3. Create new deployment (recommended) or update existing one

### 7.2 Create New Version

For production changes:

1. Click **Deploy** > **New deployment**
2. Select previous deployment from **Version**
3. Increment version description: `Production v2`
4. Click **Deploy**
5. Update frontend `.env` with new URL (if needed)

### 7.3 Manage Deployments

View and manage deployments:

1. Click **Deploy** > **Manage deployments**
2. See all active deployments
3. Archive old deployments
4. Update deployment settings

## 8. Monitoring and Debugging

### 8.1 View Execution Logs

1. In Apps Script editor, click **Execution log** (icon in top-right)
2. View real-time logs for requests
3. Filter by date, status, or function

### 8.2 Enable Advanced Logging

Add logging to your functions:

```javascript
function myFunction() {
  console.log('Starting function')
  console.info('Info message')
  console.warn('Warning message')
  console.error('Error message')
}
```

### 8.3 Set Up Triggers (Optional)

For maintenance tasks:

1. Click **Triggers** (clock icon in left sidebar)
2. Click **Add Trigger**
3. Configure:
   - Function: e.g., `cleanupExpiredTokens`
   - Event source: **Time-driven**
   - Type: **Hour timer**
   - Interval: **Every hour**

## 9. Security Best Practices

### 9.1 Environment Security

- ✅ **DO**: Store sensitive data in Script Properties
- ✅ **DO**: Use HTTPS for all requests
- ✅ **DO**: Validate all input data
- ✅ **DO**: Log security events
- ❌ **DON'T**: Hard-code credentials in scripts
- ❌ **DON'T**: Expose internal error details to clients

### 9.2 Access Control

- Limit spreadsheet and folder access to service account only
- Use token-based authentication for all secured endpoints
- Implement rate limiting for authentication endpoints
- Set appropriate token TTL values

### 9.3 Data Protection

- Hash passwords with salt (never store plain text)
- Encrypt sensitive data in transit and at rest
- Implement optimistic locking for concurrent updates
- Regular backups of spreadsheet data

## 10. Troubleshooting

### "Authorization required" Error

**Solution**: Re-authorize the script

1. Go to Apps Script project
2. Run any function manually
3. Complete authorization flow
4. Redeploy if needed

### "Service invoked too many times" Error

**Solution**: Apps Script has quota limits

- Free tier: 20,000 URL Fetch calls/day
- Consider caching responses
- Implement request throttling

### "Script function not found" Error

**Solution**: Verify function names

- Check that handler methods exist
- Ensure router maps actions correctly
- Verify case-sensitive names

### Slow Response Times

**Solution**: Optimize queries

- Use batch operations for Sheets
- Cache frequently accessed data
- Minimize API calls
- Use CacheService for temporary data

## 11. Development Workflow

Recommended workflow:

1. **Develop locally** in `gas/` directory using VS Code
2. **Test** in Apps Script editor using test functions
3. **Deploy** to test deployment for integration testing
4. **Verify** with frontend application
5. **Deploy to production** when stable
6. **Monitor** logs for errors

## 12. Resources

- [Google Apps Script Documentation](https://developers.google.com/apps-script)
- [Quotas and Limits](https://developers.google.com/apps-script/guides/services/quotas)
- [Best Practices](https://developers.google.com/apps-script/guides/support/best-practices)
- [clasp Documentation](https://github.com/google/clasp)

## Next Steps

1. Complete [Google Workspace Setup](./google-setup.md)
2. Implement backend handlers (Phase 2 tasks)
3. Test all API endpoints
4. Configure frontend with deployment URL
5. Run integration tests
