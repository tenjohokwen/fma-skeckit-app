# FMA Skeckit App - User Guide

**Version:** 1.0
**Last Updated:** October 14, 2025
**Application:** File Management Application with User Authentication

---

## Table of Contents

1. [Introduction](#introduction)
2. [Getting Started](#getting-started)
3. [User Registration & Account Setup](#user-registration--account-setup)
4. [Login & Password Management](#login--password-management)
5. [Searching for Client Cases](#searching-for-client-cases)
6. [Viewing Case Information](#viewing-case-information)
7. [Admin Features](#admin-features)
   - [Editing Case Information](#editing-case-information)
   - [Creating Client Folders](#creating-client-folders)
   - [Managing Case Folders & Files](#managing-case-folders--files)
   - [File Operations](#file-operations)
8. [Language & Accessibility](#language--accessibility)
9. [Troubleshooting](#troubleshooting)
10. [FAQ](#faq)

---

## Introduction

The **FMA Skeckit App** is a comprehensive file management application designed to help legal professionals and case managers organize client information, documents, and case metadata efficiently. The application provides secure user authentication, powerful search capabilities, and role-based access control to ensure data security and operational efficiency.

### Key Features

- **Secure Authentication**: Email verification and password recovery with OTP
- **Advanced Search**: Search cases by client name or case ID
- **Metadata Management**: Track payment status, assignments, tasks, and comments
- **File Organization**: Hierarchical folder structure for client and case documents
- **Role-Based Access**: Admin and standard user roles with appropriate permissions
- **Multilingual Support**: Available in English and French
- **Mobile-Friendly**: Responsive design works on all devices

### User Roles

- **Standard User (ROLE_USER)**: Can search and view case information
- **Administrator (ROLE_ADMIN)**: Full access including editing, file management, and folder creation

---

## Getting Started

### System Requirements

- **Browser**: Modern web browser (Chrome, Firefox, Safari, Edge)
- **Internet Connection**: Required for all operations
- **Screen Resolution**: Optimized for both desktop and mobile devices

### Accessing the Application

1. Navigate to the application URL provided by your administrator
2. You'll see the landing page with options to **Create Account** or **Log In**
3. Choose your preferred language using the language switcher in the top corner

---

## User Registration & Account Setup

### Creating a New Account

1. **Navigate to Sign Up**
   - Click the **"Create Account"** button on the landing page
   - Or select **"Sign Up"** from the menu

2. **Fill Out the Registration Form**
   - **Email Address**: Enter a valid email address (this will be your username)
   - **Password**: Create a strong password that includes:
     - At least 8 characters
     - One uppercase letter
     - One lowercase letter
     - One number
     - One special character (e.g., !@#$%^&*)
   - **Confirm Password**: Re-enter your password to confirm

3. **Submit the Form**
   - Click the **"Create Account"** button
   - If all validations pass, you'll see a success message

4. **Check Your Email**
   - A verification email will be sent to your registered email address
   - The email contains a verification link valid for 24 hours

### Email Verification

1. **Open the Verification Email**
   - Check your inbox (and spam folder if needed)
   - Look for an email from the FMA Skeckit App

2. **Click the Verification Link**
   - Click the blue **"Verify Email Address"** button in the email
   - You'll be redirected to the application

3. **Verification Complete**
   - You'll see a success message with a green check icon
   - Click **"Log In"** to access your account

### Resending Verification Email

If you didn't receive the verification email or it expired:

1. Go to the Email Verification page
2. Click **"Resend Verification Email"**
3. A new verification email will be sent with a fresh 24-hour link

---

## Login & Password Management

### Logging In

1. **Navigate to Login Page**
   - Click **"Log In"** from the landing page
   - Or use the login link from the menu

2. **Enter Credentials**
   - **Email**: Your registered email address
   - **Password**: Your account password

3. **Submit**
   - Click **"Log In"**
   - You'll be redirected to the search page upon successful login

### Account Status Messages

- **Unverified Account**: "Your email has not been verified. Please check your email."
  - Use the **"Resend Verification"** option to get a new verification email

- **Blocked Account**: "Your account has been blocked. Please contact support."
  - Contact your system administrator for assistance

### Forgot Password

If you've forgotten your password:

1. **Click "Forgot Password"**
   - From the login page, click the **"Forgot Password?"** link

2. **Enter Your Email**
   - Provide the email address associated with your account
   - Click **"Send Recovery Email"**

3. **Check Your Email**
   - You'll receive an email with a One-Time Password (OTP)
   - The OTP is valid for 2 hours

4. **Enter the OTP**
   - Copy the OTP from your email
   - Paste it into the verification form
   - Click **"Verify OTP"**

5. **Reset Your Password**
   - Enter your new password
   - Confirm the new password
   - Click **"Reset Password"**

6. **Login with New Password**
   - You'll be redirected to the login page
   - Use your new password to log in

### OTP Expired or Invalid

- If your OTP has expired (after 2 hours), request a new password recovery email
- If you enter an incorrect OTP, you'll see an error message - double-check the code in your email

---

## Searching for Client Cases

Once logged in, all users can search for client cases.

### Search by Client Name

1. **Navigate to Search Page**
   - You'll be automatically directed here after login
   - Or select **"Search"** from the menu

2. **Enter Search Criteria**
   - **First Name**: Enter the client's first name (case-insensitive)
   - **Last Name**: Enter the client's last name (case-insensitive)
   - You can search by first name only, last name only, or both

3. **Submit Search**
   - Click **"Search"** or press Enter
   - Results will appear within 2 seconds

### Search by Case ID

1. **Navigate to Search Page**

2. **Enter Case ID**
   - Type the case ID in the search field
   - Case IDs are unique identifiers for each case

3. **Submit Search**
   - Click **"Search"**
   - The matching case will be displayed

### Understanding Search Results

Search results are displayed as **UI cards**, each showing:

- Client First Name and Last Name
- Client Email and Phone Number
- Case ID
- Payment Status and Amount Paid
- Assigned To (staff member)
- Tasks Remaining
- Next Action
- Comment
- Due Date
- Case Status

**Note**: System-generated fields (Assigned At, Last Updated By, Last Updated At, version) are not displayed in search results.

### No Results Found

If your search returns no results:
- Double-check spelling
- Try searching with partial names
- Verify the case ID is correct
- Contact your administrator if you believe the case should exist

---

## Viewing Case Information

### Case Details Card

Each case is displayed in a card format with:

- **Client Information**: Name, email, phone number
- **Case Details**: Case ID, status, payment information
- **Assignment**: Who is responsible and related tasks
- **Action Items**: Next steps, comments, due dates

### View-Only Mode (Standard Users)

Standard users (ROLE_USER) can:
- View all case information
- Search for cases
- Read metadata

Standard users **cannot**:
- Edit case information
- Create folders or upload files
- Delete files

---

## Admin Features

Administrators (ROLE_ADMIN) have full access to all features including editing, file management, and folder creation.

### Editing Case Information

#### Accessing Edit Mode

1. **Search for the Case**
   - Use the search function to find the case you want to edit

2. **Click "Edit"**
   - An **"Edit"** button appears on the case card for admins
   - Click it to enter edit mode

#### Editable Fields

As an admin, you can edit:

- Client First Name
- Client Last Name
- Client Email
- Client Phone Number
- Amount Paid
- Payment Status
- Assigned To
- Tasks Remaining
- Next Action
- Comment
- Due Date
- Status
- Case ID

**System Fields (Not Editable)**:
- Assigned At (auto-updated when "Assigned To" changes)
- Last Updated By (auto-set to your name)
- Last Updated At (auto-set to current time)
- Version (auto-incremented)

#### Making Changes

1. **Modify Fields**
   - Click on any editable field
   - Enter or select the new value

2. **Save Changes**
   - Click **"Save"** at the bottom of the form
   - Changes are saved within 3 seconds

3. **Automatic Metadata Updates**
   - When you save, the system automatically:
     - Sets "Last Updated By" to your name
     - Sets "Last Updated At" to the current time (Africa/Douala timezone)
     - Increments the "version" number by 1
     - If you changed "Assigned To", sets "Assigned At" to current time

#### Concurrent Edit Warning

If another admin edits the same case while you're editing:
- The system detects a version mismatch
- You'll see a conflict warning
- Review the changes and decide how to proceed

---

### Creating Client Folders

Admin users can create folders for new clients.

#### Before Creating a Client Folder

**Always search first** to ensure the client doesn't already exist:

1. **Search by Name and ID**
   - Enter the client's first name, last name, and national ID number
   - Click **"Search Clients"**

2. **Review Results**
   - If a client exists, their folder information will be displayed
   - Do not create a duplicate

#### Creating a New Client Folder

1. **Access Client Creation Form**
   - After searching and finding no results
   - Click **"Create New Client"**

2. **Fill Out Required Fields**
   - **First Name**: Client's first name
   - **Last Name**: Client's last name
   - **Telephone**: Client's phone number
   - **National ID Number**: Client's ID card number
   - **Email**: Client's email address

3. **Submit the Form**
   - Click **"Create Client Folder"**
   - The system creates a folder with the naming pattern: `firstName_lastName_idCardNo`
   - Folder is created under the root folder called **"cases"**

4. **Confirmation**
   - You'll see a success message
   - The client folder is now ready for case folders and files

---

### Managing Case Folders & Files

#### Creating a Case Folder

1. **Find the Client Folder**
   - Search for the client whose case you're managing
   - Navigate to their folder

2. **Create Case Folder**
   - Click **"Create Case Folder"**
   - **Enter Case ID**: Provide the unique case identifier
   - Click **"Create"**

3. **Folder Structure**
   - The case folder is created inside the client folder
   - Path format: `cases/firstName_lastName_idCardNo/caseID/`

#### Uploading Files to a Case Folder

1. **Navigate to Case Folder**
   - Browse to the specific case folder where you want to upload files

2. **Click "Upload Files"**
   - Select the **"Upload"** option

3. **Choose Files**
   - Click **"Choose Files"** or drag and drop files
   - You can upload multiple files at once

4. **Name Your Files**
   - Optionally, provide custom names for the files
   - If not specified, original file names are used

5. **Handle File Name Conflicts**
   - If a file with the same name already exists, you'll be prompted with three options:
     - **Overwrite**: Replace the existing file
     - **Rename**: Give the new file a different name
     - **Cancel**: Cancel the upload
   - Choose the appropriate option

6. **Complete Upload**
   - Click **"Upload"**
   - Upload completes in under 1 minute (excluding network transfer time)
   - You'll see a success confirmation

#### File Size Limits

- Maximum file size varies based on storage configuration
- Typically 5-10MB per file
- If you exceed the limit, you'll see an error message with the maximum allowed size

---

### File Operations

#### Browsing Folders

1. **Navigate to "Files" Section**
   - Select **"Files"** from the menu

2. **Browse Hierarchy**
   - Start from the **"cases"** root folder
   - Click on client folders to expand
   - Click on case folders to view files

3. **View File Information**
   - Each file displays:
     - File name
     - File type indicator (icon or extension)
     - File size (if available)

#### Downloading Files

1. **Locate the File**
   - Navigate to the case folder containing the file

2. **Click "Download"**
   - Click the download icon or **"Download"** button next to the file
   - The file downloads at network speed

3. **Save File**
   - Choose where to save the file on your device
   - Download completes without application bottleneck

#### Deleting Files

1. **Locate the File**
   - Navigate to the case folder containing the file to delete

2. **Click "Delete"**
   - Click the delete icon or **"Delete"** button

3. **Confirm Deletion**
   - A confirmation dialog appears
   - **Warning**: Deletion is permanent (no recycle bin)

4. **Confirm**
   - Click **"Yes, Delete"** to confirm
   - Or **"Cancel"** to abort

5. **File Removed**
   - The file is permanently deleted from the folder
   - You'll see a success message

#### Deleting Folders

- Folders containing files cannot be deleted directly
- You must either:
  - Delete all files first, then delete the folder
  - Or receive a prompt to confirm deletion of folder and all contents

---

## Language & Accessibility

### Switching Languages

The application supports **English** and **French**.

1. **Locate Language Switcher**
   - The language switcher is in the top corner of every page

2. **Select Language**
   - Click the language switcher
   - Choose **English** or **Français**

3. **Language Changes Instantly**
   - All text updates in under 500ms
   - Your preference is saved across sessions

### Mobile Accessibility

- The application is fully responsive
- All features work on mobile devices
- No horizontal scrolling required
- Touch-friendly buttons and inputs
- Hamburger menu for easy navigation on small screens

---

## Troubleshooting

### Login Issues

**Problem**: "Email not verified"
- **Solution**: Check your email for the verification link. If expired, use "Resend Verification Email" option.

**Problem**: "Invalid email or password"
- **Solution**: Double-check your credentials. Use "Forgot Password" if needed.

**Problem**: "Account blocked"
- **Solution**: Contact your system administrator for assistance.

### Search Issues

**Problem**: No results found
- **Solution**:
  - Verify spelling of client name or case ID
  - Try partial name searches
  - Ensure case exists in the system

**Problem**: Slow search results
- **Solution**:
  - Check your internet connection
  - Results should appear in under 2 seconds
  - Contact support if consistently slow

### File Upload Issues

**Problem**: File too large
- **Solution**:
  - Check the error message for maximum file size
  - Compress the file or split into smaller files
  - Contact administrator for size limit increase

**Problem**: File name conflict
- **Solution**:
  - Choose to rename, overwrite, or cancel from the prompt
  - Use descriptive file names to avoid conflicts

**Problem**: Upload failed
- **Solution**:
  - Check your internet connection
  - Ensure you have admin permissions
  - Try uploading again
  - Contact support if issue persists

### Email Issues

**Problem**: Verification email not received
- **Solution**:
  - Check spam/junk folder
  - Wait 2 minutes (emails can be delayed)
  - Use "Resend Verification Email" option
  - Verify email address was entered correctly

**Problem**: OTP not received
- **Solution**:
  - Check spam/junk folder
  - Wait up to 2 minutes
  - Request password recovery again

### General Issues

**Problem**: Page not loading
- **Solution**:
  - Refresh the browser
  - Clear browser cache
  - Check internet connection
  - Try a different browser

**Problem**: Changes not saving
- **Solution**:
  - Ensure you have admin permissions for edit operations
  - Check for version conflict warnings
  - Refresh and try again
  - Contact support if persistent

---

## FAQ

### General Questions

**Q: What browsers are supported?**
A: All modern browsers including Chrome, Firefox, Safari, and Edge. We recommend keeping your browser up to date.

**Q: Is my data secure?**
A: Yes. Passwords are securely hashed, email verification is required, and role-based access controls protect sensitive operations.

**Q: Can I access the app on my phone?**
A: Yes! The application is fully responsive and works on all mobile devices.

**Q: How do I change my password?**
A: Use the "Forgot Password" flow from the login page. You'll receive an OTP via email to reset your password.

### Account Questions

**Q: How long does email verification take?**
A: Verification emails are typically delivered within 2 minutes. The verification link is valid for 24 hours.

**Q: Can I use the same email for multiple accounts?**
A: No. Each email address can only be associated with one account.

**Q: How do I become an admin?**
A: Admin roles are assigned by system administrators. Contact your organization's administrator for role changes.

**Q: What happens if my account gets blocked?**
A: Contact your system administrator. Blocked accounts cannot log in until unblocked by an admin.

### Search & Case Questions

**Q: Is search case-sensitive?**
A: No. Search is case-insensitive for your convenience.

**Q: How quickly do search results appear?**
A: Search results typically appear within 2 seconds of submitting your query.

**Q: Can I search by partial names?**
A: Yes. The search function supports partial name matching.

**Q: What is the version number on cases?**
A: The version number increments each time a case is edited. It helps track changes and detect concurrent edits.

### File Management Questions

**Q: What file types can I upload?**
A: Most common file types are supported (PDF, Word, Excel, images, etc.). Check with your administrator for specific restrictions.

**Q: What is the maximum file size?**
A: Typically 5-10MB per file, depending on your system configuration. You'll see an error message if you exceed the limit.

**Q: Can I upload multiple files at once?**
A: Yes. You can select and upload multiple files in a single operation.

**Q: Can I recover deleted files?**
A: No. File deletion is permanent. Always confirm before deleting.

**Q: How are folders organized?**
A: Folders follow this hierarchy: `cases` → `client folder (firstName_lastName_idCardNo)` → `case folder (caseID)` → `files`

### Language & Settings Questions

**Q: How do I change the language?**
A: Use the language switcher in the top corner of any page. Your preference is saved automatically.

**Q: Does changing language affect data?**
A: No. Changing language only affects the user interface. All data remains the same.

---

## Getting Help

### Contact Support

If you encounter issues not covered in this guide:

1. **Document the Issue**
   - Take screenshots if applicable
   - Note any error messages
   - Record the steps that led to the problem

2. **Contact Your Administrator**
   - Provide the documentation from step 1
   - Include your username (email address)
   - Describe what you were trying to accomplish

### Providing Feedback

Your feedback helps improve the application:
- Suggest new features
- Report bugs or usability issues
- Share your user experience

Contact your system administrator with feedback.

---

## Appendix

### Password Requirements Summary

- Minimum 8 characters
- At least one uppercase letter (A-Z)
- At least one lowercase letter (a-z)
- At least one number (0-9)
- At least one special character (!@#$%^&*()_+-=[]{}|;:,.<>?)

### Timezone Information

All timestamps use the **Africa/Douala** timezone:
- Assigned At
- Last Updated At
- OTP expiry times

### System-Generated Fields

These fields are automatically managed by the system and cannot be edited directly:

- **Assigned At**: Set when "Assigned To" changes
- **Last Updated By**: Set to the name of the user making changes
- **Last Updated At**: Set to current time on any edit
- **Version**: Incremented by 1 on each edit

### Folder Naming Conventions

- **Client Folder**: `firstName_lastName_idCardNo` (e.g., `John_Doe_123456`)
- **Case Folder**: `caseID` (e.g., `CASE-2025-001`)
- **Root Folder**: `cases` (contains all client folders)

---

**End of User Guide**

For the latest updates and information, contact your system administrator.
