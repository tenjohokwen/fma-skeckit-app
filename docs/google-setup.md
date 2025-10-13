# Google Workspace Setup Guide

This guide provides step-by-step instructions for setting up the required Google Sheets and Google Drive components for the File Management System.

## Prerequisites

- Google Account with access to Google Drive and Google Sheets
- Google Apps Script project created (see [GAS Setup Guide](./gas-setup.md))

## 1. Create Google Sheets Database

### 1.1 Create the Main Spreadsheet

1. Go to [Google Sheets](https://sheets.google.com)
2. Create a new spreadsheet
3. Name it: `File Management System - Database`
4. Note the Spreadsheet ID from the URL: `https://docs.google.com/spreadsheets/d/{SPREADSHEET_ID}/edit`

### 1.2 Create "users" Sheet

1. Rename "Sheet1" to `users`
2. Add the following headers in Row 1:

| Column | Header | Description |
|--------|--------|-------------|
| A | email | User email address (primary key) |
| B | password | Hashed password |
| C | salt | Password salt |
| D | role | ROLE_ADMIN or ROLE_USER |
| E | status | PENDING or VERIFIED |
| F | verificationToken | Email verification token |
| G | verificationTokenExpiry | Token expiry timestamp (UTC) |
| H | passwordResetOTP | Password reset OTP code |
| I | otpExpiry | OTP expiry timestamp (UTC) |
| J | createdAt | Account creation timestamp (Africa/Douala) |
| K | lastLoginAt | Last login timestamp (Africa/Douala) |

**Formatting:**
- Set Row 1 as **bold** and **frozen**
- Set background color of Row 1 to light gray (#f1f5f9)
- Set data validation for:
  - Column D: List from range `ROLE_ADMIN, ROLE_USER`
  - Column E: List from range `PENDING, VERIFIED`

### 1.3 Create "caseMetadata" Sheet

1. Create a new sheet named `caseMetadata`
2. Add the following headers in Row 1:

| Column | Header | Description |
|--------|--------|-------------|
| A | caseId | Unique case identifier (primary key) |
| B | caseName | Case name |
| C | clientName | Client name |
| D | assignedTo | Assigned user email (foreign key) |
| E | caseType | Case type/category |
| F | status | Case status (OPEN, CLOSED, etc.) |
| G | notes | Additional notes |
| H | createdBy | Creator email (foreign key) |
| I | createdAt | Creation timestamp (Africa/Douala) |
| J | assignedAt | Assignment timestamp (Africa/Douala) |
| K | lastUpdatedBy | Last updater email (foreign key) |
| L | lastUpdatedAt | Last update timestamp (Africa/Douala) |
| M | version | Version number for optimistic locking |

**Formatting:**
- Set Row 1 as **bold** and **frozen**
- Set background color of Row 1 to light gray (#f1f5f9)
- Set Column M (version) default value to `1`

### 1.4 Set Permissions

1. Click **Share** button (top-right)
2. Add the Google Apps Script service account email
3. Grant **Editor** permissions
4. Click **Done**

## 2. Create Google Drive Folder Structure

### 2.1 Create Root "cases" Folder

1. Go to [Google Drive](https://drive.google.com)
2. Navigate to the location where you want to store case files
3. Create a new folder named `cases`
4. Note the Folder ID from the URL when opened: `https://drive.google.com/drive/folders/{FOLDER_ID}`

### 2.2 Set Permissions

1. Right-click the `cases` folder
2. Click **Share**
3. Add the Google Apps Script service account email
4. Grant **Editor** permissions
5. Check **Apply to all items in folder**
6. Click **Done**

**Note:** Client and case subfolders will be created automatically by the application as needed.

## 3. Configure Google Apps Script Properties

After completing the above setup, configure the script properties in your Google Apps Script project:

1. Open your Google Apps Script project
2. Go to **Project Settings** (gear icon)
3. Scroll to **Script Properties**
4. Add the following properties:

| Property | Value | Description |
|----------|-------|-------------|
| `SPREADSHEET_ID` | `{your-spreadsheet-id}` | ID from Step 1.1 |
| `CASES_FOLDER_ID` | `{your-folder-id}` | ID from Step 2.1 |
| `ENCRYPTION_KEY` | `{random-32-char-string}` | Generate using crypto tool |
| `TOKEN_TTL_MINUTES` | `15` | Token time-to-live in minutes |
| `OTP_TTL_HOURS` | `2` | OTP time-to-live in hours |
| `APP_TIMEZONE` | `Africa/Douala` | Application timezone |

### Generate Encryption Key

Use this JavaScript code in the Apps Script editor console to generate a secure key:

```javascript
function generateEncryptionKey() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let key = '';
  for (let i = 0; i < 32; i++) {
    key += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  console.log(key);
}

generateEncryptionKey();
```

## 4. Verify Setup

### 4.1 Test Spreadsheet Access

Run this test function in your Google Apps Script editor:

```javascript
function testSpreadsheetAccess() {
  const spreadsheetId = PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID');
  const ss = SpreadsheetApp.openById(spreadsheetId);

  const usersSheet = ss.getSheetByName('users');
  const metadataSheet = ss.getSheetByName('caseMetadata');

  console.log('Users sheet headers:', usersSheet.getRange(1, 1, 1, 11).getValues()[0]);
  console.log('Metadata sheet headers:', metadataSheet.getRange(1, 1, 1, 13).getValues()[0]);
  console.log('Setup verification successful!');
}
```

### 4.2 Test Drive Folder Access

Run this test function in your Google Apps Script editor:

```javascript
function testDriveFolderAccess() {
  const folderId = PropertiesService.getScriptProperties().getProperty('CASES_FOLDER_ID');
  const folder = DriveApp.getFolderById(folderId);

  console.log('Cases folder name:', folder.getName());
  console.log('Cases folder access verified!');
}
```

## 5. Update Frontend Configuration

Update the `.env` file in the frontend project with your deployed Google Apps Script URL:

```env
VITE_GAS_API_URL=https://script.google.com/macros/s/{YOUR_DEPLOYMENT_ID}/exec
```

To get the deployment URL:
1. In Google Apps Script editor, click **Deploy** > **New deployment**
2. Choose **Web app** type
3. Set **Execute as**: Me
4. Set **Who has access**: Anyone
5. Click **Deploy**
6. Copy the **Web app URL**

## Troubleshooting

### Permission Denied Errors

- Verify the Google Apps Script service account has Editor access to both Sheets and Drive
- Check that script properties are correctly set
- Ensure the spreadsheet and folder IDs are correct

### Sheet Not Found Errors

- Verify sheet names match exactly: `users` and `caseMetadata` (case-sensitive)
- Ensure headers are in Row 1
- Check that sheets are not hidden

### Token/Authentication Errors

- Verify `ENCRYPTION_KEY` is set and is 32 characters
- Check that `TOKEN_TTL_MINUTES` and `OTP_TTL_HOURS` are set
- Ensure timezone is set to `Africa/Douala`

## Next Steps

Once setup is complete:
1. Test the authentication flow by creating a test user
2. Verify metadata CRUD operations
3. Test file upload and folder creation
4. Review the [API Documentation](../specs/001-use-the-information/contracts/) for endpoint details
