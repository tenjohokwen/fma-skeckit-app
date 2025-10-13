# Feature Specification: File Management Application with User Authentication

**Feature Branch**: `001-use-the-information`
**Created**: 2025-10-13
**Status**: Draft
**Input**: User description: "use the information in ./myrequirements.md to create the specification"

**Note**: All features must comply with the project constitution at `.specify/memory/constitution.md`, including Vue 3 Composition API requirements, component isolation testing standards, design system specifications, and performance requirements.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - User Registration and Email Verification (Priority: P1)

A new user wants to create an account to access the file management system. They provide their name, email, and password, receive a verification email, and activate their account by clicking the verification link.

**Why this priority**: Authentication is foundational - no other features can work without users being able to create and verify accounts. This is the entry point to the entire application.

**Independent Test**: Can be fully tested by completing the sign-up form, receiving a verification email, and clicking the verification link. Delivers immediate value by allowing users to create verified accounts.

**Acceptance Scenarios**:

1. **Given** a new user is on the sign-up page, **When** they enter a unique email, valid name, and password and click sign up, **Then** an account is created with pending status and a verification email is sent
2. **Given** a user has received a verification email, **When** they click the verification link, **Then** their account status changes to verified and they can log in
3. **Given** a user tries to sign up with an existing email, **When** they submit the form, **Then** an error message indicates the email is already registered
4. **Given** a pending user tries to log in, **When** they enter their credentials, **Then** an error message indicates their email has not been verified

---

### User Story 2 - User Login and Password Recovery (Priority: P1)

An existing verified user logs into the system using their email and password. If they forget their password, they can request a recovery email with an OTP to reset it.

**Why this priority**: Login is essential for accessing the system. Password recovery prevents users from being locked out of their accounts. Both are critical authentication features.

**Independent Test**: Can be tested by logging in with verified credentials, attempting login with invalid credentials, and completing the full password recovery flow including OTP verification and password reset.

**Acceptance Scenarios**:

1. **Given** a verified user with correct credentials, **When** they enter email and password and click login, **Then** they are authenticated and redirected to the search page
2. **Given** a verified user has forgotten their password, **When** they click "forgot password" and enter their email, **Then** an OTP is generated with 2-hour expiry and sent via email
3. **Given** a user enters the OTP from their recovery email, **When** the OTP is valid and not expired, **Then** they are shown a password reset form
4. **Given** a user sets a new password that matches the confirmation field, **When** they click "Reset Password", **Then** the password is updated and they are redirected to the landing page
5. **Given** a blocked user attempts to log in, **When** they enter credentials, **Then** an error message indicates their account has been blocked
6. **Given** a user enters an incorrect or expired OTP, **When** they submit it, **Then** an error message indicates the OTP is invalid or expired

---

### User Story 3 - Search and View Client Case Metadata (Priority: P2)

An authenticated user searches for client cases by name or case ID to view case information including client details, payment status, assigned staff, tasks, and comments.

**Why this priority**: Searching and viewing case data is the primary operational function after authentication. Users need this to access client information for their daily work.

**Independent Test**: Can be tested by logging in as any authenticated user, searching by first/last name or case ID, and viewing the results displayed in UI cards showing all metadata fields.

**Acceptance Scenarios**:

1. **Given** an authenticated user is on the search page, **When** they search by client first name and last name, **Then** all matching cases are displayed as UI cards with metadata
2. **Given** an authenticated user searches by case ID, **When** they enter a valid case ID, **Then** the corresponding case is displayed with full metadata
3. **Given** a non-admin user views search results, **When** they see the cards, **Then** they cannot switch to edit mode or modify any data
4. **Given** search results are displayed, **When** viewing the cards, **Then** system-generated columns (Assigned At, Last Updated By, Last Updated At, version) are excluded from display

---

### User Story 4 - Admin Case Editing with Automatic Metadata Tracking (Priority: P2)

An admin user edits client case information including client details, payment status, assignment, tasks, and comments. The system automatically tracks who made changes, when, and increments the version number.

**Why this priority**: Editing capability is essential for admins to maintain current case information. Automatic tracking ensures audit trail and accountability without manual effort.

**Independent Test**: Can be tested by logging in as an admin user, searching for a case, editing various fields, and verifying that automatic fields (Assigned At, Last Updated By, Last Updated At, version) are updated correctly.

**Acceptance Scenarios**:

1. **Given** an admin user views a case, **When** they click to edit mode, **Then** all editable fields are accessible and system fields are hidden
2. **Given** an admin modifies the "Assigned To" field, **When** they save changes, **Then** "Assigned At" is set to current datetime in Africa/Douala timezone
3. **Given** an admin modifies any field, **When** they save changes, **Then** "Last Updated By" is set to current user name, "Last Updated At" is set to current datetime, and "version" is incremented by 1
4. **Given** a non-admin user accesses the edit page, **When** they try to view it, **Then** they are denied access or see view-only mode

---

### User Story 5 - Admin Client Folder Creation (Priority: P3)

An admin user creates a new client folder by searching for existing clients first, then filling out a form with client information (First Name, Last Name, Telephone, National ID Number, Email). A folder is automatically created in the storage system.

**Why this priority**: Folder creation is needed before files can be managed, but can be deferred after core search/edit functionality. It's foundational for file management but not required for case metadata management.

**Independent Test**: Can be tested by logging in as admin, searching to verify client doesn't exist, submitting the client form, and confirming a folder is created with the naming pattern firstName_lastName_idCardNo under the "cases" root folder.

**Acceptance Scenarios**:

1. **Given** an admin user searches for a client by name and ID number, **When** no results are found, **Then** they can access a "Create New Client" form
2. **Given** an admin fills out the client creation form with all required fields, **When** they click submit, **Then** a folder named "firstName_lastName_idCardNo" is created under the "cases" root folder
3. **Given** an admin searches for an existing client, **When** results are found, **Then** the client's folder information is displayed and the create option is not available

---

### User Story 6 - Admin Case Folder Creation and File Upload (Priority: P3)

An admin user creates a case-specific folder within a client's folder and uploads files for that case. They search for the client, specify a case ID, name their files, and upload them into the case folder.

**Why this priority**: Case-specific file organization enables structured document management per case. This builds on client folder creation and is needed for complete file management.

**Independent Test**: Can be tested by logging in as admin, finding an existing client folder, creating a case folder with a case ID, uploading files with custom names, and verifying files are stored in the correct folder structure.

**Acceptance Scenarios**:

1. **Given** an admin finds an existing client folder, **When** they provide a case ID and upload files, **Then** a folder named with the case ID is created within the client folder
2. **Given** an admin uploads files with custom names, **When** the upload completes, **Then** files are stored in the case folder with the specified names
3. **Given** a case folder already exists, **When** an admin uploads additional files, **Then** files are added to the existing case folder

---

### User Story 7 - Admin Folder Navigation and File Management (Priority: P4)

An admin user browses the folder structure, views files and their types, downloads files they need, and deletes files that are no longer needed.

**Why this priority**: Navigation and file operations (download/delete) are important for file maintenance but can function after the core upload and metadata features are working. These are operational conveniences rather than foundational features.

**Independent Test**: Can be tested by logging in as admin, navigating through the cases folder structure, viewing file lists with types, downloading a file to local storage, and deleting a file with confirmation.

**Acceptance Scenarios**:

1. **Given** an admin user navigates the folder structure, **When** they browse folders, **Then** they see all folders and files with file type indicators
2. **Given** an admin views a file in the folder structure, **When** they click download, **Then** the file is downloaded to their local device
3. **Given** an admin selects a file to delete, **When** they confirm deletion, **Then** the file is permanently removed from the folder
4. **Given** an admin navigates folders, **When** they view contents, **Then** folders display in a hierarchical structure showing the path from cases root through client folder to case folders

---

### Edge Cases

- **Duplicate Email Registration**: What happens when a user tries to register with an email that already exists? System displays an error message indicating the email is already registered.
- **Expired OTP**: How does the system handle an OTP that has exceeded the 2-hour expiry? System displays an error message indicating the OTP has expired and user must request a new one.
- **Password Mismatch**: What happens when "New Password" and "Confirm New Password" don't match? System displays an error message indicating passwords don't match and prevents submission.
- **Non-existent Email Recovery**: How does the system respond when a user requests password recovery for an unregistered email? System sends a generic message saying "recovery email sent" to prevent email enumeration, and sends an informational email to the address.
- **Blocked User Login**: What happens when a blocked user attempts to log in? System displays an error message indicating the account has been blocked.
- **Pending User Login**: What happens when an unverified user tries to log in? System displays an error message indicating email verification is required, with option to resend verification.
- **Empty Search Results**: How does the system handle searches that return no results? System displays a friendly "No results found" message with search tips.
- **File Name Conflicts**: What happens when uploading a file with a name that already exists in the case folder? System prompts user with three options: overwrite existing file, rename the new file, or cancel upload. User must explicitly choose before upload completes.
- **Concurrent Edits**: How does the system handle two admins editing the same case simultaneously? Version number serves as optimistic locking indicator - system should detect version mismatch and prompt for conflict resolution.
- **Large File Uploads**: How does the system handle files exceeding size limits? System displays an error message with the maximum allowed file size.
- **Delete Non-Empty Folder**: What happens when an admin tries to delete a folder containing files? System should prevent deletion and display message, or prompt for confirmation to delete folder and all contents.

## Requirements *(mandatory)*

### Functional Requirements

#### Authentication & User Management

- **FR-001**: System MUST allow new users to register with name, email, and password
- **FR-002**: System MUST validate email uniqueness during registration and reject duplicate emails
- **FR-003**: System MUST hash passwords using secure hashing algorithm before storage
- **FR-004**: System MUST generate a unique verification token for each new registration
- **FR-005**: System MUST send verification email with verification link containing the token
- **FR-006**: System MUST set new user status to "PENDING" and type to "ALLOWED" and role to "ROLE_USER"
- **FR-007**: System MUST change user status to "VERIFIED" when verification link is clicked
- **FR-008**: System MUST authenticate users with email and password
- **FR-009**: System MUST prevent login for users with "PENDING" status and display verification required message
- **FR-010**: System MUST prevent login for users with "BLOCKED" type and display account blocked message
- **FR-011**: System MUST provide "forgot password" functionality with OTP generation
- **FR-012**: System MUST generate OTP with 2-hour expiration time
- **FR-013**: System MUST send OTP and recovery link via email
- **FR-014**: System MUST validate OTP against stored value and expiration time
- **FR-015**: System MUST allow password reset only after valid OTP verification
- **FR-016**: System MUST clear OTP and expiration date after successful password reset
- **FR-017**: System MUST provide "resend verification email" functionality from login page
- **FR-018**: System MUST send informational email for password recovery attempts on non-existent emails (security measure)
- **FR-019**: System MUST store user salt for password hashing

#### Search & Metadata Display

- **FR-020**: System MUST provide search functionality by client first name and last name
- **FR-021**: System MUST provide search functionality by case ID
- **FR-022**: System MUST display search results as UI cards
- **FR-023**: System MUST display all metadata sheet columns in search results except system-generated fields (Assigned At, Last Updated By, Last Updated At, version)
- **FR-024**: System MUST hide edit functionality from users without ROLE_ADMIN

#### Case Editing & Tracking

- **FR-025**: System MUST restrict edit access to users with ROLE_ADMIN
- **FR-026**: System MUST hide system-generated fields from edit interface (Assigned At, Last Updated By, Last Updated At, version)
- **FR-027**: System MUST automatically set "Assigned At" to current datetime (Africa/Douala timezone) when "Assigned To" value changes
- **FR-028**: System MUST automatically set "Last Updated By" to current user name when any field is modified
- **FR-029**: System MUST automatically set "Last Updated At" to current datetime (Africa/Douala timezone) when any field is modified
- **FR-030**: System MUST automatically increment "version" number when any field is modified
- **FR-031**: System MUST allow admins to edit all non-system fields including: Client First Name, Client Last Name, Client Email, Client Phone Number, Amount Paid, Payment Status, Folder Name, Folder Path, Assigned To, Tasks Remaining, Next Action, Comment, Due Date, status, Case ID

#### Client Folder Management

- **FR-032**: System MUST allow admins to search for existing clients by name and ID card number
- **FR-033**: System MUST provide client creation form requiring: First Name, Last Name, Telephone, National ID Number, Email
- **FR-034**: System MUST create client folder with naming pattern "firstName_lastName_idCardNo" under root folder "cases"
- **FR-035**: System MUST prevent client folder creation if client already exists
- **FR-036**: System MUST display existing client folder information when search finds matches

#### Case Folder & File Upload

- **FR-037**: System MUST allow admins to create case folders within client folders
- **FR-038**: System MUST name case folders using the provided case ID
- **FR-039**: System MUST allow admins to upload files to case folders
- **FR-040**: System MUST allow admins to specify custom file names during upload
- **FR-041**: System MUST store files in the correct case folder path: cases/firstName_lastName_idCardNo/caseID/
- **FR-042**: System MUST detect file name conflicts during upload and prompt user with three options: overwrite existing file, rename new file, or cancel upload

#### File Navigation & Operations

- **FR-043**: System MUST allow admins to navigate the folder structure starting from "cases" root
- **FR-044**: System MUST display files with file type indicators
- **FR-045**: System MUST allow admins to download files
- **FR-046**: System MUST allow admins to delete files
- **FR-047**: System MUST display folder hierarchy showing path from root through client to case folders

#### UI/UX Requirements

- **FR-048**: System MUST use a layout with router-based page switching
- **FR-049**: System MUST provide mobile-friendly menu
- **FR-050**: System MUST provide language switcher for English and French
- **FR-051**: System MUST hide storage backend (Google Drive) from users
- **FR-052**: System MUST display appropriate error messages for all error conditions
- **FR-053**: System MUST provide confirmation for destructive actions (delete)

### Key Entities

- **User**: Represents a system user with attributes: name, email, hashed password, salt, type (ALLOWED/BLOCKED), role (ROLE_ADMIN/ROLE_USER), status (PENDING/VERIFIED), verification token, OTP, OTP expiry date, and URL
- **Case Metadata**: Represents a client case with attributes: Client First Name, Client Last Name, Client Email, Client Phone Number, Amount Paid, Payment Status, Folder Name, Folder Path, Assigned To, Assigned At (datetime), Last Updated By, Last Updated At (datetime), Tasks Remaining, Next Action, Comment, Due Date, status, Case ID, version number
- **Client Folder**: Represents a client's root folder in storage with naming pattern firstName_lastName_idCardNo, contains case folders
- **Case Folder**: Represents a specific case within a client folder, named by case ID, contains case-related files
- **File**: Represents an uploaded document stored in a case folder with custom name and file type

### Assumptions

- Email delivery service is configured and operational for sending verification and recovery emails
- Timezone Africa/Douala is consistently used for all datetime operations
- Password hashing uses industry-standard secure algorithm (bcrypt, Argon2, or PBKDF2)
- File size limits are defined at implementation level based on storage service constraints
- Maximum file upload size follows storage service limits (typically 5-10MB for web apps)
- Concurrent edit conflicts use version number for optimistic locking detection
- File name conflicts default to preventing overwrites and require user action
- Search is case-insensitive for user convenience
- UI cards display metadata in read-only format with clear visual hierarchy
- Mobile-friendly menu uses responsive design patterns (hamburger menu, collapsible sections)
- Language switcher persists preference across sessions
- Delete operations for files are permanent (no recycle bin/trash functionality)
- Admin role assignment is managed externally (not part of this feature scope)

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can complete registration and email verification in under 3 minutes
- **SC-002**: Users can complete password recovery flow including OTP entry and password reset in under 5 minutes
- **SC-003**: Users can log in successfully with correct credentials in under 10 seconds
- **SC-004**: Search results are displayed within 2 seconds of query submission
- **SC-005**: Case metadata updates by admins are saved and reflected in under 3 seconds
- **SC-006**: Admin users can create a client folder in under 30 seconds
- **SC-007**: Admin users can upload a file to a case folder in under 1 minute (excluding upload time)
- **SC-008**: Admin users can navigate folder structure and view files in under 5 seconds per level
- **SC-009**: File downloads complete successfully at network speed (no application bottleneck)
- **SC-010**: 95% of users successfully complete their primary task (search, edit, upload) on first attempt
- **SC-011**: System supports at least 50 concurrent users without performance degradation
- **SC-012**: Email delivery (verification, OTP, informational) occurs within 2 minutes of trigger event
- **SC-013**: Mobile users can access all functionality without horizontal scrolling or layout breaking
- **SC-014**: Language switching completes instantly (under 500ms) with all text properly translated
- **SC-015**: Zero data loss occurs during file uploads or case edits
- **SC-016**: System prevents 100% of unauthorized access attempts (blocked users, unverified users, non-admin edits)
