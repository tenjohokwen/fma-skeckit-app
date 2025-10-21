# Email Signature Configuration

## Purpose
Configure the SIGNATURE script property in Google Apps Script to automatically include a signature in all email notifications.

## Steps to Configure

1. **Open Google Apps Script Project**:
   - Navigate to your Google Apps Script project
   - Or run: `clasp open` from the project root

2. **Access Script Properties**:
   - In the Apps Script editor, click on **Project Settings** (gear icon in left sidebar)
   - Scroll down to **Script Properties** section
   - Click **Add script property**

3. **Add SIGNATURE Property**:
   - **Property name**: `SIGNATURE`
   - **Value**: Enter your HTML email signature, for example:
   ```html
   <p>Best regards,<br>Your Support Team<br><a href="mailto:support@example.com">support@example.com</a></p>
   ```

4. **Save**:
   - Click **Save script property**

## Testing the Signature

The signature will be automatically appended to all email notifications sent via the `sendStatusNotificationEmail` function.

## Optional Configuration

If you want no signature, simply don't add the SIGNATURE property. The system will handle missing signatures gracefully (emails will be sent without a signature).

## Example Signatures

**Simple Text**:
```html
<p>Best regards,<br>File Management Team</p>
```

**With Contact Info**:
```html
<div style="margin-top: 20px; padding-top: 10px; border-top: 1px solid #e0e0e0;">
  <p style="margin: 0;"><strong>File Management System</strong></p>
  <p style="margin: 5px 0;">Email: <a href="mailto:support@example.com">support@example.com</a></p>
  <p style="margin: 5px 0;">Phone: +1 (555) 123-4567</p>
</div>
```

**Professional**:
```html
<div style="font-family: Arial, sans-serif; font-size: 13px; color: #333; margin-top: 20px;">
  <p style="margin: 0; font-weight: bold;">John Doe</p>
  <p style="margin: 5px 0; color: #666;">Senior Case Manager</p>
  <p style="margin: 5px 0; color: #666;">File Management Services Inc.</p>
  <p style="margin: 10px 0;">
    <a href="mailto:john.doe@example.com" style="color: #2563eb; text-decoration: none;">john.doe@example.com</a> | 
    <span style="color: #666;">+1 (555) 123-4567</span>
  </p>
</div>
```

## Notes

- The signature is optional - the feature works without it
- HTML is supported for rich formatting
- Keep signatures concise (< 200 characters recommended)
- Test the signature by sending a test email notification
