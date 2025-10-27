# Feature Specification: Dashboard Access Parity for All Users

**Feature Branch**: `016-as-a-user`
**Created**: 2025-10-27
**Status**: Draft
**Input**: User description: "As a user without admin rights I should be able to see all chart data on the dashboard"

**Note**: All features must comply with the project constitution at `.specify/memory/constitution.md`, including Vue 3 Composition API requirements, component isolation testing standards, design system specifications, and performance requirements.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Non-Admin Dashboard Overview (Priority: P1)

A non-admin user (legal professional) logs into the application and navigates to the dashboard. They can view comprehensive business analytics showing all organizational data, not just cases assigned to them personally. This gives them situational awareness about overall firm workload, case distribution, and business trends.

**Why this priority**: This is the core MVP functionality - enabling non-admin users to see organization-wide dashboard data. Without this, non-admin users have limited visibility into firm-wide metrics and cannot make informed decisions about workload, case priorities, or business operations.

**Independent Test**: Can be fully tested by logging in as a non-admin user, navigating to the dashboard, and verifying that all charts display data from all cases (not just assigned cases). Success is measured by comparing chart data between admin and non-admin views - they should show identical aggregate metrics.

**Acceptance Scenarios**:

1. **Given** a non-admin user is logged in, **When** they navigate to the dashboard, **Then** they see all 6 analytics charts (Active Cases, Cases by Status, Cases by Type, Cases per Attorney, Resolution Time, Case Trends) populated with organization-wide data
2. **Given** the dashboard loads successfully, **When** the non-admin user views the "Cases by Status" chart, **Then** the chart displays counts for all statuses across all cases in the system, not just cases assigned to the user
3. **Given** the dashboard displays "Cases per Attorney" chart, **When** the non-admin user views this chart, **Then** they see workload distribution for all attorneys in the organization, including attorneys they don't work with directly
4. **Given** a non-admin user views the dashboard, **When** they compare the total case count with an admin user's dashboard, **Then** both users see the same aggregate numbers

---

### User Story 2 - Personal Metrics Visibility (Priority: P2)

A non-admin user can distinguish their personally assigned cases from the organization-wide metrics. While they see all organizational data, they can identify which portion represents their own workload through visual indicators or a personal metrics section.

**Why this priority**: While seeing organization-wide data is valuable (P1), users also need to understand their personal contribution and workload. This provides context: "The firm has 150 active cases, and I'm personally responsible for 12 of them."

**Independent Test**: Can be tested by logging in as a non-admin user with assigned cases and verifying that: (1) organization-wide metrics are displayed, AND (2) personal metrics are visually distinguished (e.g., highlighted in charts, shown in a separate "My Cases" section, or indicated with different colors/labels).

**Acceptance Scenarios**:

1. **Given** a non-admin user has 5 assigned cases out of 50 total active cases, **When** they view the dashboard, **Then** they can identify both numbers: total active cases (50) and their personal assignment (5)
2. **Given** the "Cases per Attorney" chart is displayed, **When** the non-admin user views it, **Then** their own name/workload is visually distinguished (e.g., highlighted, different color, or marked with an indicator)
3. **Given** a non-admin user views case statistics, **When** they look at resolution time metrics, **Then** they see organization-wide averages AND have visibility into their personal resolution time performance

---

### Edge Cases

- What happens when a non-admin user has zero assigned cases but the organization has many cases?
  - Dashboard should still display all organizational metrics; personal metrics section would show "0 assigned cases"

- How does the system handle organizations with a single user (solo practitioners)?
  - Organization-wide metrics and personal metrics would be identical; no special handling needed

- What if case data is missing required fields (e.g., assignedTo, status, caseType)?
  - Charts should handle missing data gracefully, showing "Unassigned", "Unknown Status", "Uncategorized" categories as they currently do

- What happens if a non-admin user's browser session becomes stale between page loads?
  - Standard auth refresh should apply; dashboard data should reflect current user's role permissions at request time

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST display identical aggregate dashboard metrics to all users regardless of role (admin vs non-admin)
- **FR-002**: System MUST remove role-based filtering in dashboard data retrieval that currently limits non-admin users to only their assigned cases
- **FR-003**: Non-admin users MUST be able to view the "Cases per Attorney" chart showing workload for all attorneys, not just themselves
- **FR-004**: Non-admin users MUST be able to view organization-wide case statistics including total active cases, cases by status, and cases by type
- **FR-005**: Non-admin users MUST be able to view resolution time metrics calculated from all closed cases in the system
- **FR-006**: System MUST provide a way for non-admin users to identify their personal case assignments within the organization-wide data (visual indicator, separate section, or filter)
- **FR-007**: Dashboard cache keys MUST NOT include user role or user email as differentiators when calculating organization-wide metrics
- **FR-008**: System MUST maintain existing admin dashboard functionality without regression
- **FR-009**: Dashboard refresh functionality MUST work identically for admin and non-admin users
- **FR-010**: System MUST preserve existing security controls for case edit/delete operations (viewing metrics does not grant edit permissions)

### Key Entities

- **Dashboard Metrics**: Aggregated analytics calculated from all cases in the system
  - Attributes: activeCases count, casesByStatus distribution, casesByType distribution, casesPerAttorney workload, resolutionTime statistics, lastUpdated timestamp
  - Relationships: Derived from Case entities

- **User**: Authenticated application user with assigned role
  - Attributes: email, role (ROLE_ADMIN or ROLE_USER), assignedCases
  - Relationships: Has many Cases (via assignedTo field)

- **Case**: Legal case record in the system
  - Key attributes for metrics: status, caseType, assignedTo, createdAt, lastUpdatedAt
  - Relationships: Belongs to one attorney (assignedTo), belongs to one client

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Non-admin users see identical aggregate case counts as admin users (e.g., if there are 150 total active cases, both admin and non-admin dashboards display "150 Active Cases")
- **SC-002**: Dashboard load time for non-admin users remains under 3 seconds (same performance as current admin experience)
- **SC-003**: Non-admin users can successfully identify their personal workload within 5 seconds of viewing the dashboard
- **SC-004**: 100% of dashboard charts render with organization-wide data for non-admin users (6 charts total: Active Cases, Cases by Status, Cases by Type, Cases per Attorney, Resolution Time, Case Trends)
- **SC-005**: Zero increase in support tickets related to "missing dashboard data" after feature deployment
- **SC-006**: Cache hit rate for dashboard metrics improves by at least 50% due to shared cache keys across all users (currently separate caches per user/role)

## Assumptions

- The current dashboard caching mechanism will be retained and optimized for shared access
- Users understand that viewing organization-wide metrics does not grant them permission to edit cases outside their assignments
- The existing role system (ROLE_ADMIN, ROLE_USER) will remain unchanged; this feature only affects dashboard data visibility
- Backend performance can handle calculating organization-wide metrics for all users (no performance degradation expected given current admin usage)
- Personal metrics visibility (FR-006) can be implemented through frontend visual distinction without requiring backend changes beyond removing role-based filtering

## Out of Scope

- Modifying the role-based access control system itself (ROLE_ADMIN, ROLE_USER remain as-is)
- Granting non-admin users permission to edit/delete cases outside their assignments
- Adding new chart types or analytics beyond the existing 6 charts
- Creating custom dashboard views or user-configurable chart arrangements
- Implementing granular permissions (e.g., department-level access, team-level access)
- Adding export functionality for dashboard data
- Creating scheduled reports or email digests of dashboard metrics
- Implementing real-time dashboard updates (auto-refresh interval remains as-is)
