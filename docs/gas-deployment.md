# Google Apps Script Deployment Guide

This guide explains how to deploy the Google Apps Script backend to enable CORS for the frontend application.

## Prerequisites

- Google account
- Access to Google Apps Script
- The GAS files in the `/gas` directory

## CORS and Google Apps Script

Google Apps Script web apps **do support CORS** when deployed properly. The key is to:

1. Deploy the web app with correct access settings
2. Ensure the deployment URL ends in `/exec` (not `/dev`)
3. Set access to "Anyone, even anonymous" for development

## Deployment Steps

### Step 1: Create a New Apps Script Project

1. Go to [Google Apps Script](https://script.google.com/)
2. Click **"New Project"**
3. Name your project: `FMA-Backend-API`

### Step 2: Copy GAS Files

- Copy all `.gs` files from the `/gas` directory to your Apps Script project: (OR use `clasp push --project .clasp-prod.json`)

**Required Files:**

- `Main.gs` - Entry point (doPost/doGet)
- `gas/utils/Router.gs`
- `gas/utils/ResponseHandler.gs`
- `gas/utils/PasswordUtil.gs`
- `gas/utils/DateUtil.gs`
- `gas/security/SecurityInterceptor.gs`
- `gas/security/TokenManager.gs`
- `gas/services/UserService.gs`
- `gas/services/EmailService.gs`
- `gas/services/SheetsService.gs`
- `gas/services/DriveService.gs`
- `gas/handlers/AuthHandler.gs`
- `gas/handlers/MetadataHandler.gs`
- `gas/handlers/FileHandler.gs`

**Note:** Apps Script doesn't support folder structures, so all files go in the root. Each file name will be prefixed with its folder name. e.g the ClientHandler.gs file is named handlers/ClientHandler.gs

### Step 3: Configure Script Properties

1. In Apps Script, click **Project Settings** (gear icon)
2. Scroll to **Script Properties**
3. Add the following properties:

| Property            | Value                | Description                                                  |
| ------------------- | -------------------- | ------------------------------------------------------------ |
| `SPREADSHEET_ID`    | Your Google Sheet ID | ID of the spreadsheet for storing users and metadata         |
| `CASES_FOLDER_ID`   | Your Drive Folder ID | ID of the Google Drive folder for client files               |
| `ENCRYPTION_KEY`    | Random secret key    | Used for token encryption (generate a random 32-char string) |
| `TOKEN_TTL_MINUTES` | `1440`               | Auth token time-to-live (24 hours)                           |
| `OTP_TTL_HOURS`     | `2`                  | OTP time-to-live for password reset                          |
| `APP_TIMEZONE`      | `Africa/Douala`      | Timezone for timestamps                                      |

**How to get IDs:**

- **SPREADSHEET_ID**: Create a new Google Sheet, copy the ID from the URL: `https://docs.google.com/spreadsheets/d/SPREADSHEET_ID_HERE/edit`
- **CASES_FOLDER_ID**: Create a new Google Drive folder, copy the ID from the URL: `https://drive.google.com/drive/folders/FOLDER_ID_HERE`
- **ENCRYPTION_KEY**: Generate a random string (e.g., `openssl rand -hex 32` on Mac/Linux)

### Step 4: Create Required Sheets

1. Open the Google Spreadsheet (using the SPREADSHEET_ID)
2. Create two sheets:
   - **users** - For storing user accounts
   - **metadata** - For storing case information

**Users Sheet Columns (Row 1):**

```
email | password | salt | type | role | status | verificationToken | verificationExpiry | otp | otpExpiry | url
```

**metadata Sheet Columns (Row 1):**

```
Case ID | Client First Name | Client Last Name | Client Email | Client Phone Number | Amount Paid | Payment Status | Folder Name | Folder Path | Assigned To | Assigned At | Last Updated By | Last Updated At | Tasks Remaining | Next Action | Comment | Due Date | status | version
```

### Step 5: Test the Setup

1. In Apps Script, select the function `testSetup` from the dropdown
2. Click **Run**
3. Review the execution logs (View > Logs)
4. Ensure all checks pass

### Step 6: Deploy as Web App

1. Click **Deploy** > **New deployment**
2. Click the gear icon next to "Select type" and choose **Web app**
3. Configure deployment:
   - **Description**: `Production API v1`
   - **Execute as**: **Me** (your email)
   - **Who has access**: **Anyone** (or **Anyone, even anonymous** for public access)

4. Click **Deploy**
5. **Authorize** the application when prompted
   - Review permissions
   - Click **Allow**

6. **Copy the Web App URL** - it will look like:
   ```
   https://script.google.com/macros/s/AKfycby.../exec
   ```

### Step 7: Update Frontend Environment Variable

1. Open the `.env` file in your frontend project root
2. Update `VITE_GAS_API_URL` with the deployment URL:

   ```
   VITE_GAS_API_URL=https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec
   ```

3. Restart your development server:
   ```bash
   npm run dev
   ```

### Step 8: Verify CORS Works

1. Open your browser to `http://localhost:9000`
2. Open DevTools > Network tab
3. Try to sign up or log in
4. Check that requests to the GAS URL succeed (status 200)
5. Verify no CORS errors in the console

## CORS Configuration in GAS

- I do not know if google is trying to block things or what, but ensure you have this header or else you will have CORS issues

```
'Content-Type': 'text/plain;charset=utf-8'
```

- This is a workaround for CORS issues. Follow the next steps if you still have issues

Google Apps Script web apps deployed with `/exec` URLs automatically handle CORS correctly when:

1. **Access is set to "Anyone"** or "Anyone, even anonymous"
2. **The response uses `ContentService.createTextOutput()`** (which we do in ResponseHandler.gs)
3. **The deployment is published** (not using the dev URL)

## Troubleshooting CORS Issues

### Issue: "No 'Access-Control-Allow-Origin' header"

**Cause**: Using the `/dev` URL instead of `/exec`

**Solution**:

- Ensure you deployed as a Web App (not just saved)
- Use the `/exec` URL from the deployment, not the test URL

### Issue: "Access denied" or 401 errors

**Cause**: Deployment access settings are too restrictive

**Solution**:

- Redeploy with access set to "Anyone" or "Anyone, even anonymous"
- Ensure "Execute as" is set to "Me"

### Issue: Requests work in Postman but not browser

**Cause**: Browser enforces CORS, Postman doesn't

**Solution**:

- Verify you're using the `/exec` URL
- Check that deployment access is set to "Anyone"
- Clear browser cache and try again

### Issue: "Script function not found" errors

**Cause**: Missing `doPost` or `doGet` functions

**Solution**:

- Ensure `Main.gs` is included in your project
- Verify `doPost` and `doGet` functions are defined

## Testing the API

### Test with curl

```bash
curl -X POST https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec \
  -H "Content-Type: application/json" \
  -d '{"action":"auth.signup","data":{"email":"test@example.com","password":"Test123!@#"}}'
```

### Test with Postman

1. Create a new POST request
2. URL: Your `/exec` deployment URL
3. Headers: `Content-Type: application/json`
4. Body (raw JSON):
   ```json
   {
     "action": "auth.signup",
     "data": {
       "email": "test@example.com",
       "password": "Test123!@#"
     }
   }
   ```
5. Send and verify response

### Test with Browser

1. Navigate to `http://localhost:9000/#/signup`
2. Fill in the signup form
3. Click "Create Account"
4. Open DevTools > Network tab
5. Verify the request to GAS succeeds

## Updating the Deployment

### Method 1: Using clasp (Command Line - Recommended)

If you have clasp installed and configured:

1. **Push your changes**:

   ```bash
   clasp push
   ```

2. **Create a new version**:

   ```bash
   clasp version "Description of changes"
   ```

3. **Update the web app deployment**:
   - You MUST update the deployment through the Google Apps Script UI
   - Go to https://script.google.com/home/projects/YOUR_SCRIPT_ID/deployments
   - Or get your script ID: `cat .clasp.json | grep scriptId`
   - Visit: https://script.google.com/home
   - Find your project "FMA-Backend-API"
   - Click **Deploy** > **Manage deployments**
   - Click the **edit icon** (pencil) next to your active web app deployment
   - Under **Version**: Select **New version** (choose the latest version number)
   - Click **Deploy**

**IMPORTANT**: Simply running `clasp push` does NOT automatically update the web app! You must manually update the deployment to the new version through the UI.

### Method 2: Using Google Apps Script UI

1. Save all files in Apps Script editor
2. Click **Deploy** > **Manage deployments**
3. Click the edit icon (pencil) next to your active deployment
4. Change **Version**: Select **New version**
5. Click **Deploy**

**Note**: The deployment URL stays the same, but the version increments.

### Verifying the Update

After updating the deployment:

1. Wait 1-2 minutes for Google's servers to propagate the update
2. Clear your browser cache or use incognito mode
3. Test the API endpoint to verify the changes are live

## Security Considerations

### For Production:

1. **Change access to "Anyone"** (not anonymous) once authentication is working
2. **Rotate ENCRYPTION_KEY** periodically
3. **Enable audit logging** in the Google Workspace admin console
4. **Set up monitoring** for failed authentication attempts
5. **Review script permissions** regularly

### For Development:

- Use "Anyone, even anonymous" for easier testing
- Use a separate GAS project and spreadsheet for development
- Never commit `.env` files with production URLs to version control

## Common Issues

### CORS still not working

1. **Clear browser cache** completely
2. **Hard refresh** the page (Cmd+Shift+R / Ctrl+Shift+R)
3. **Try incognito mode** to rule out extensions
4. **Verify the URL** ends in `/exec` not `/dev`
5. **Check deployment access** is set to "Anyone"

### Changes not reflecting

1. Create a **new deployment** instead of updating
2. Update the `.env` file with the new URL
3. Restart the frontend dev server
4. Clear browser cache

### Authorization issues

1. Reauthorize the script in **Project Settings > OAuth**
2. Ensure you're signed in to Google with the correct account
3. Check that required scopes are approved

## Environment Variables Reference

Your `.env` file should contain:

```bash
# Google Apps Script API URL (from deployment)
VITE_GAS_API_URL=https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec

# Optional: Enable API logging
VITE_API_DEBUG=true
```

## Next Steps

After successful deployment:

1. Test all authentication flows (signup, login, password reset)
2. Verify email sending works (check Gmail sent folder)
3. Test file upload/download functionality
4. Set up error monitoring
5. Configure production environment variables

## Support

If you encounter issues:

1. Check the Apps Script **Executions** log (View > Executions)
2. Review browser console for errors
3. Use Apps Script **Logs** to debug (console.log statements)
4. Verify all script properties are set correctly
5. Ensure all required Google services are enabled

---

**Last Updated**: October 2025
**Version**: 1.0
