# Feature Specification: Simplified UI - Remove File and Client Management Pages

**Feature Branch**: `011-as-a-user`
**Created**: 2025-10-21
**Status**: Draft
**Input**: User description: "As a user I want to have a simplified UI and fewer entry flows. I want to have the following pages and all their functionalities but discard the rest. Dashboard (DashboardPage), the profile (Profilepage), ErrorNotFound, Search (SearchPage), Homepage, signup (SignupPage), login (loginPage), verify-email (EmailVerificationPage). Remove the following and related functionality that is not reused by other components. Also remove them from the menu: FileManagementPage.vue, ClientManagementPage.vue"

**Note**: All features must comply with the project constitution at `.specify/memory/constitution.md`, including Vue 3 Composition API requirements, component isolation testing standards, design system specifications, and performance requirements.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Remove File Management Navigation (Priority: P1)

As a user navigating the application, I need the File Management page and its menu entry removed so that I have a simpler, more focused interface without unnecessary options.

**Why this priority**: This is the highest priority because it directly impacts the main navigation menu that users see every time they use the application. Removing clutter from the navigation immediately improves the user experience.

**Independent Test**: Can be fully tested by logging in as any user role, checking the navigation menu does not contain a "Files" or "File Management" entry, and verifying that attempting to navigate to `/files` redirects to an error or dashboard page.

**Acceptance Scenarios**:

1. **Given** an authenticated user is viewing the navigation menu, **When** they look for file-related options, **Then** they see no "Files" or "File Management" menu items
2. **Given** an authenticated user types `/files` in the browser address bar, **When** they press enter, **Then** they are redirected to an error page or dashboard
3. **Given** the navigation drawer is open, **When** the user reviews all menu options, **Then** "Files" is not listed among available pages
4. **Given** a user was previously using file management features, **When** they log in after this change, **Then** they can still access all retained functionality (Dashboard, Search, Profile) without issues

---

### User Story 2 - Remove Client Management Navigation (Priority: P2)

As an admin user, I need the Client Management page and its menu entry removed so that my administrative interface is simplified and focused only on case management via the Search page.

**Why this priority**: This is P2 because it affects admin users specifically. While important for simplification, it has less impact than the File Management removal since fewer users have admin privileges.

**Independent Test**: Can be fully tested by logging in as an admin user, verifying no "Clients" or "Client Management" menu entry exists, and confirming that `/clients` route is inaccessible.

**Acceptance Scenarios**:

1. **Given** an authenticated admin user is viewing the navigation menu, **When** they look for client management options, **Then** they see no "Clients" or "Client Management" menu items
2. **Given** an admin user types `/clients` in the browser address bar, **When** they press enter, **Then** they are redirected to an error page or dashboard
3. **Given** an admin user needs to manage cases, **When** they navigate to the Search page, **Then** they can still search for and manage cases as before
4. **Given** a non-admin user, **When** they view the navigation menu, **Then** they continue to see only the navigation options they had before (no change from their perspective)

---

### User Story 3 - Clean Up Route Definitions (Priority: P3)

As a developer or system maintainer, I need the route definitions for FileManagementPage and ClientManagementPage removed from the router configuration so that the application's routing table is clean and maintainable.

**Why this priority**: This is P3 because it's a technical cleanup that doesn't directly impact user experience but ensures the codebase remains clean and prevents accidental navigation to removed pages.

**Independent Test**: Can be fully tested by reviewing the router configuration file and verifying that no routes reference FileManagementPage.vue or ClientManagementPage.vue, and by attempting to programmatically navigate to these routes (which should fail gracefully).

**Acceptance Scenarios**:

1. **Given** the router configuration file, **When** a developer reviews all route definitions, **Then** no routes point to FileManagementPage.vue or ClientManagementPage.vue
2. **Given** the application is running, **When** any code attempts to navigate to "files" or "clients" routes, **Then** the navigation fails gracefully (redirects to error page or dashboard)
3. **Given** the application bundle, **When** build optimization occurs, **Then** FileManagementPage and ClientManagementPage components are tree-shaken out (not included in bundle)

---

### Edge Cases

- What happens if bookmarks or saved links point to `/files` or `/clients`? (Should redirect to error page or dashboard)
- What happens if other components have hard-coded navigation to these pages? (Should be identified and removed or updated)
- What if there are deep links or external references to these pages? (404/error handling should be graceful)
- What happens to any shared components that were only used by FileManagementPage or ClientManagementPage? (Should be removed if truly unused)
- What about test files for these pages? (Should also be removed to keep test suite clean)

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST remove the "Files" menu entry from the navigation drawer for all user roles
- **FR-002**: System MUST remove the "Clients" menu entry from the navigation drawer for admin users
- **FR-003**: System MUST remove the route definition for `/files` from the router configuration
- **FR-004**: System MUST remove the route definition for `/clients` from the router configuration
- **FR-005**: System MUST redirect attempts to access `/files` or `/clients` routes to an appropriate error page or dashboard
- **FR-006**: System MUST maintain all functionality of the following pages without changes:
  - Dashboard (DashboardPage)
  - Profile (ProfilePage)
  - Error Not Found (ErrorNotFound)
  - Search (SearchPage)
  - Home (HomePage)
  - Sign Up (SignUpPage)
  - Login (LoginPage)
  - Email Verification (EmailVerificationPage)
- **FR-007**: System MUST identify and remove components, composables, or utilities that were exclusively used by FileManagementPage or ClientManagementPage
- **FR-008**: System MUST preserve shared components that are used by other pages (even if they were also used by the removed pages)
- **FR-009**: System MUST remove test files associated exclusively with FileManagementPage and ClientManagementPage

### Key Entities

This feature does not introduce new data entities. It removes UI pages and navigation entries but does not affect the underlying data model.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Navigation menu contains exactly 8 pages or fewer (down from current count which includes Files and Clients)
- **SC-002**: Users report reduced cognitive load and faster task completion due to simpler navigation (qualitative feedback)
- **SC-003**: Application bundle size decreases by the combined size of FileManagementPage.vue and ClientManagementPage.vue components
- **SC-004**: Zero navigation errors or broken links remain after removal (verified by manual and automated testing)
- **SC-005**: All retained pages (Dashboard, Profile, Search, Home, auth pages) continue to function without degradation
- **SC-006**: Zero dead code remains from removed pages (verified by code analysis tools)

## Assumptions

- **A-001**: FileManagementPage.vue and ClientManagementPage.vue do not contain critical functionality that is required by other parts of the application
- **A-002**: The Search page provides sufficient functionality for case management without needing the separate Client Management page
- **A-003**: File management functionality, if critical, is available through other means (e.g., directly from case details pages)
- **A-004**: Users have been notified of this change or the feature is being rolled out to new users who won't expect these pages
- **A-005**: Any shared components (like file upload, client search) are already used by retained pages like Search or CaseDetailsPage
- **A-006**: Navigation menu structure allows for removing these items without breaking layout or remaining menu items

## Dependencies

- **D-001**: Requires review of MainLayout.vue navigation drawer to identify and remove menu entries
- **D-002**: Requires review of router/routes.js to remove route definitions
- **D-003**: Requires identification of components/composables used exclusively by these pages
- **D-004**: Requires verification that CaseDetailsPage, CaseEditPage, and CaseFilesPage continue to work (they may have used file management features)

## Scope

### In Scope

- Removing FileManagementPage.vue and ClientManagementPage.vue page components
- Removing "Files" and "Clients" navigation menu entries from MainLayout
- Removing `/files` and `/clients` route definitions from router configuration
- Removing components, composables, utilities, and tests used exclusively by these pages
- Implementing proper redirect/error handling for removed routes
- Verifying all retained pages continue to function correctly
- Updating any documentation or comments referencing removed pages

### Out of Scope

- Modifying the functionality of retained pages (Dashboard, Search, Profile, etc.)
- Removing case-related pages (CaseDetailsPage, CaseEditPage, CaseFilesPage) - these are kept
- Creating new navigation or pages to replace removed functionality
- Migrating data or features from removed pages to other pages
- Changing user permissions or role-based access controls
- Modifying the authentication flow or user management
- Updating backend APIs (this is purely a frontend UI simplification)
- Removing shared components that are used by retained pages

## Migration Notes

- **Pages to Keep**: Dashboard, Profile, ErrorNotFound, Search, HomePage, SignUpPage, LoginPage, EmailVerificationPage, CaseDetailsPage, CaseEditPage, CaseFilesPage, IndexPage
- **Pages to Remove**: FileManagementPage, ClientManagementPage
- **Routes to Remove**: `/files`, `/clients`
- **Navigation Items to Remove**: "Files" menu item, "Clients" menu item (admin section)
- **Verification Needed**: Ensure CaseFilesPage (which handles files for specific cases) is not affected by FileManagementPage removal
