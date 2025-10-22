# Feature Specification: Update User Guide Documentation

**Feature Branch**: `012-functionality-has-been`
**Created**: 2025-10-21
**Status**: Draft
**Input**: User description: "Functionality has been removed and some changed. Update the /docs/user-guide.md file with a comprehensive up to date user documentation."

**Note**: All features must comply with the project constitution at `.specify/memory/constitution.md`, including Vue 3 Composition API requirements, component isolation testing standards, design system specifications, and performance requirements.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Remove Outdated File Management Documentation (Priority: P1)

As a user reading the documentation, I need the outdated sections about the global "Files" menu and FileManagementPage removed so that I don't get confused trying to access features that no longer exist.

**Why this priority**: This is P1 because users following the current documentation will be frustrated when they cannot find the "Files" menu or File Management page that is extensively documented but no longer exists in the application.

**Independent Test**: Can be fully tested by reading the updated user guide and verifying that no references to the global "Files" menu, "File Management" page, or standalone file browsing features exist. The documentation should only reference case-specific file management via CaseFilesPage.

**Acceptance Scenarios**:

1. **Given** a user reads the Table of Contents, **When** they look for file management sections, **Then** they find only "Managing Case Files" (case-specific) and NOT "File Operations" (global file management)
2. **Given** a user reads the navigation instructions, **When** they follow the menu guidance, **Then** the documentation mentions Dashboard, Search, Profile but NOT a standalone "Files" menu item
3. **Given** a user reads the Admin Features section, **When** they look for file upload instructions, **Then** they find instructions for uploading files to specific case folders only, not global file management
4. **Given** a user follows the documented file operations, **When** they try to replicate the steps, **Then** all steps are accurate and reflect the current simplified UI

---

### User Story 2 - Remove Outdated Client Management Documentation (Priority: P2)

As a user reading the documentation, I need the outdated "Creating Client Folders" and "Client Management" sections removed or updated to reflect that these operations are now handled through the Search page, not a dedicated Clients page.

**Why this priority**: This is P2 because it affects how admin users understand client management workflows. While less impactful than the Files documentation (which affects all users), it still causes confusion for administrators.

**Independent Test**: Can be fully tested by reading the Admin Features section and verifying that there are no references to a standalone "Clients" menu or ClientManagementPage. Documentation should explain that client management is performed through the Search interface.

**Acceptance Scenarios**:

1. **Given** an admin user reads the Admin Features section, **When** they look for client management instructions, **Then** they find guidance integrated with the Search functionality, not a separate "Clients" page
2. **Given** an admin user follows the documentation to create a client folder, **When** they navigate based on the instructions, **Then** the steps accurately reflect accessing this feature through Search or case management workflows
3. **Given** an admin user reads about their role privileges, **When** they review the feature list, **Then** the documentation accurately reflects that client operations are part of the Search page experience

---

### User Story 3 - Update Navigation Menu Documentation (Priority: P1)

As a user reading the documentation, I need the navigation menu structure accurately documented so that I can quickly find the pages that actually exist in the application.

**Why this priority**: This is P1 because incorrect navigation documentation is a critical usability issue. Users will waste time looking for menu items that don't exist and missing items that do exist.

**Independent Test**: Can be fully tested by comparing the documented menu structure against the actual application menu and verifying they match exactly. The documented menu should show: Dashboard, Search, Profile for all users, with no Files or Clients entries.

**Acceptance Scenarios**:

1. **Given** a standard user reads the navigation documentation, **When** they compare it to the actual application menu, **Then** the documentation accurately lists Dashboard, Search, and Profile as the available menu items
2. **Given** an admin user reads the admin features documentation, **When** they check what admin-specific menu items exist, **Then** the documentation correctly states that admin functionality is accessed through context (Edit buttons, permissions) rather than separate admin menu sections
3. **Given** a user follows the "Accessing Features" section, **When** they try to navigate as documented, **Then** every documented navigation path works correctly in the current application

---

### User Story 4 - Add Dashboard Analytics Documentation (Priority: P3)

As a user reading the documentation, I need information about the new Dashboard analytics and charts so that I understand how to interpret the business insights displayed on the Dashboard.

**Why this priority**: This is P3 because while the Dashboard exists and is documented, the recent analytics feature (008-dashboard-analytics with ApexCharts) added 6 analytical charts that users should understand. However, users can navigate the basic application without this deep dive into analytics.

**Independent Test**: Can be fully tested by reading the Dashboard section and verifying that it explains the purpose and interpretation of each chart displayed (case status distribution, payment trends, workload distribution, etc.).

**Acceptance Scenarios**:

1. **Given** a user reads the Getting Started section, **When** they learn about key features, **Then** they find a mention of the Dashboard analytics and business insights
2. **Given** a user navigates to the Dashboard documentation section, **When** they read about available charts, **Then** they find explanations for all 6 analytical visualizations added in feature 008
3. **Given** a user wants to understand their workload, **When** they consult the Dashboard documentation, **Then** they learn how to interpret the workload distribution and task assignment charts

---

### Edge Cases

- What happens if users have bookmarked old documentation URLs that reference removed features? (Redirect or show "feature no longer available" message)
- How do users discover that file management is now case-specific if they previously used global file browsing? (Clear explanation in the migration notes or prominent notice)
- What if users try to follow old printed/saved documentation copies? (Add a version number and "last updated" date prominently at the top)
- How do admin users understand the scope change from dedicated pages to integrated Search functionality? (Clear explanation in Admin Features section about the streamlined interface)

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Documentation MUST remove all references to the global "Files" menu entry and FileManagementPage
- **FR-002**: Documentation MUST remove all references to the "Clients" menu entry and ClientManagementPage
- **FR-003**: Documentation MUST accurately reflect the current navigation menu structure (Dashboard, Search, Profile)
- **FR-004**: Documentation MUST explain that file operations are performed through case-specific interfaces (CaseFilesPage)
- **FR-005**: Documentation MUST explain that client management operations are performed through the Search page
- **FR-006**: Documentation MUST update the Table of Contents to remove sections for deleted features
- **FR-007**: Documentation MUST include a changelog or version history noting when features were removed (feature 011-as-a-user)
- **FR-008**: Documentation MUST add or update the Dashboard section to describe the analytics charts (feature 008-dashboard-analytics)
- **FR-009**: Documentation MUST maintain accurate descriptions for all retained features (Search, Profile, case management, authentication)
- **FR-010**: Documentation MUST update screenshots or UI references if they show removed features

### Key Entities

This feature does not introduce new data entities. It updates documentation to reflect existing UI changes.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Zero references to "Files" menu, "File Management" page, or global file browsing features remain in the documentation
- **SC-002**: Zero references to "Clients" menu or "Client Management" page remain in the documentation
- **SC-003**: 100% of documented navigation paths work correctly in the current application version
- **SC-004**: Documentation accurately reflects the menu structure with 3 main items (Dashboard, Search, Profile) instead of the previous 5+ items
- **SC-005**: Admin users can follow the updated documentation to perform all available admin operations without encountering missing pages
- **SC-006**: The documentation clearly states where file operations occur (case-specific file management through CaseFilesPage)
- **SC-007**: Users report no confusion about features that are documented but unavailable (qualitative feedback)
- **SC-008**: Documentation includes updated "Last Updated" date reflecting current changes

## Assumptions

- **A-001**: Users accessing the documentation want information about the current state of the application, not historical features
- **A-002**: The Search page provides sufficient functionality for client management without needing a dedicated "Clients" page explanation
- **A-003**: File management through case-specific interfaces (CaseFilesPage) is sufficient and clearer than global file management documentation
- **A-004**: Users understand that documentation evolves with the application and removed sections indicate removed features
- **A-005**: The core user workflows (authentication, search, case viewing) remain unchanged despite UI simplification
- **A-006**: Screenshots or images in the documentation either need updating or can be removed without significant loss of clarity

## Dependencies

- **D-001**: Requires knowledge of feature 011-as-a-user (UI simplification that removed FileManagementPage and ClientManagementPage)
- **D-002**: Requires knowledge of feature 008-dashboard-analytics (Dashboard charts and analytics visualizations)
- **D-003**: Requires access to the current application to verify navigation menu structure and available features
- **D-004**: Requires understanding of how file operations are now performed through CaseFilesPage (case-specific file management)
- **D-005**: May require review of features 009-in-the-ui and 010-in-the-footer to document any user-facing changes from those features

## Scope

### In Scope

- Removing documentation for FileManagementPage and global file management features
- Removing documentation for ClientManagementPage and standalone client management features
- Updating navigation menu documentation to reflect current 3-item structure (Dashboard, Search, Profile)
- Updating admin features documentation to explain integrated client/case management through Search
- Adding or updating Dashboard analytics documentation for the 6 charts added in feature 008
- Updating Table of Contents to match revised document structure
- Adding changelog entry for removed features (feature 011-as-a-user)
- Updating "Last Updated" date and version number
- Reviewing and updating all navigation instructions and menu references
- Ensuring all documented workflows are accurate for the current application state

### Out of Scope

- Creating new features or functionality in the application itself
- Designing new documentation layouts or restructuring beyond removing obsolete sections
- Adding API documentation or developer guides (this is user-facing documentation only)
- Translating documentation into languages other than what already exists
- Creating video tutorials or multimedia documentation
- Documenting internal system architecture or technical implementation details
- Making changes to the application code or UI based on documentation updates
- Adding documentation for features that exist but were not part of the changed/removed features (keep existing docs as-is unless they reference removed features)

## Migration Notes

- **Removed**: Sections on "File Operations" for global file management (browse all files, download/delete from global view)
- **Removed**: Sections on "Creating Client Folders" as a standalone admin page feature
- **Updated**: Admin Features section now explains that client operations are performed through Search
- **Updated**: File management documentation now focuses on case-specific operations through CaseFilesPage
- **Updated**: Navigation menu documentation reduced from 5+ items to 3 main items (Dashboard, Search, Profile)
- **Added**: Note in Admin Features explaining the streamlined interface change (feature 011-as-a-user)
- **Added**: Dashboard analytics section explaining the 6 business insight charts (feature 008-dashboard-analytics)
- **Version Update**: Increment from version 1.0 to version 1.1 reflecting significant documentation restructuring
