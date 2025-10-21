# Test Client Configuration

## Purpose
Ensure at least one test client record has an email address configured for testing email notification functionality.

## Client Schema
According to `gas/services/SheetsService.gs`, the Clients sheet has the following structure:
- **Column A**: clientId (UUID)
- **Column B**: firstName
- **Column C**: lastName
- **Column D**: nationalId (unique)
- **Column E**: telephone
- **Column F**: email ← **REQUIRED for email notifications**
- **Column G**: folderId
- **Column H**: createdAt
- **Column I**: updatedAt

## Verification Steps

1. **Open your Google Spreadsheet**:
   - Navigate to the spreadsheet containing the "clients" sheet

2. **Check Existing Clients**:
   - Review column F (email) for existing client records
   - Verify at least one client has a valid email address

3. **Add/Update Test Client** (if needed):
   - If no clients have emails, add or update a client record
   - Use a test email address you have access to (e.g., your own email)
   
   **Example Test Client**:
   ```
   clientId: [existing UUID or generate new one]
   firstName: Test
   lastName: Client
   nationalId: TEST-001
   telephone: 555-0100
   email: your.email@example.com  ← Add valid email here
   folderId: [existing folder ID]
   createdAt: [timestamp]
   updatedAt: [timestamp]
   ```

4. **Recommended Test Emails**:
   - Use your own email address for initial testing
   - Use a secondary email or test account for verification
   - **DO NOT** use real client emails during development

## Testing Email Notifications

Once configured, you can test by:
1. Creating or editing a case associated with the test client
2. Changing the case status
3. Accepting the email notification prompt
4. Checking your inbox for the notification email

## Notes

- Email is optional for clients in general, but required for testing email notifications
- The system gracefully handles clients without emails (skips sending, shows warning)
- For production use, ensure client emails are collected during client creation
- Consider creating multiple test clients for different testing scenarios:
  - Test Client 1: Valid email (for success testing)
  - Test Client 2: No email (for edge case testing)
  - Test Client 3: Invalid email format (for validation testing)

## Quick Check Command

To verify a client has an email in your Google Sheet:
1. Open the "clients" sheet
2. Check column F for the test client
3. Ensure the email format is valid (e.g., user@domain.com)
