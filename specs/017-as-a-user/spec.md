# Feature Specification: Case-Insensitive Status Handling in Dashboard Charts

**Feature Branch**: `017-as-a-user`
**Created**: 2025-10-27
**Status**: Draft
**Input**: User description: "As a user I expect to see case insensitivity with the status of cases in the charts. For example the following should be treated as the same status: "Closed", "CLOSED", "closed""

**Note**: All features must comply with the project constitution at `.specify/memory/constitution.md`, including Vue 3 Composition API requirements, component isolation testing standards, design system specifications, and performance requirements.

## User Scenarios & Testing

### User Story 1 - Normalized Status Display in Dashboard Charts (Priority: P1)

As a user viewing the dashboard, I want all status values to be treated consistently regardless of their capitalization, so that I see accurate consolidated metrics rather than duplicate status categories in the charts.

**Why this priority**: This is a data integrity issue that directly impacts the accuracy of business insights. Without case-insensitive handling, users may see misleading chart data where "Closed", "CLOSED", and "closed" appear as three separate status categories, giving an incorrect picture of case distribution.

**Independent Test**: Can be fully tested by creating test cases with mixed-case status values (e.g., "Open", "OPEN", "open") and verifying that dashboard charts consolidate all variations into a single category with the correct total count.

**Acceptance Scenarios**:

1. **Given** a dataset contains cases with status values "Closed", "CLOSED", and "closed", **When** the user views the "Cases by Status" chart, **Then** all three variations are grouped together as a single "Closed" status category with the combined count
2. **Given** cases exist with status "In Progress", "IN PROGRESS", "in progress", and "In PROGRESS", **When** the dashboard metrics are calculated, **Then** all variations are treated as the same status
3. **Given** the user views any dashboard chart that displays status information, **When** the chart renders, **Then** each unique status (case-insensitive) appears exactly once with the aggregated count
4. **Given** a case has status "open" in the data source, **When** displayed in the chart, **Then** the label shows a standardized format (e.g., "Open" with title case)

---

### User Story 2 - Consistent Status Display Across All Dashboard Charts (Priority: P2)

As a user, I want status normalization to be applied consistently across all dashboard charts (Cases by Status, Cases per Attorney chart status indicators, etc.), so that I see a coherent view of case data throughout the dashboard.

**Why this priority**: After fixing the primary chart display, ensuring consistency across all chart types prevents confusion and maintains data integrity throughout the user experience.

**Independent Test**: Can be tested by verifying that case-insensitive status handling is applied uniformly to all chart components on the dashboard, comparing multiple charts with the same underlying data to confirm matching status labels and counts.

**Acceptance Scenarios**:

1. **Given** multiple dashboard charts display status information, **When** each chart is rendered, **Then** all charts show identical status labels (same capitalization) for the same underlying status values
2. **Given** the Cases per Attorney chart includes status breakdowns, **When** displayed, **Then** status values match the normalization used in the Cases by Status chart
3. **Given** mixed-case status values exist in the data, **When** the user refreshes the dashboard, **Then** all charts consistently show the normalized status labels

---

### Edge Cases

- What happens when a status value contains only whitespace differences (e.g., "Open " vs " Open" vs "Open")?
- How does the system handle null or empty status values in the dataset?
- What happens when a status contains special characters with different cases (e.g., "In-Progress" vs "in-progress")?
- How does the system handle status values in different languages or character sets?
- What happens when new mixed-case status values are added to the system after normalization is implemented?

## Requirements

### Functional Requirements

- **FR-001**: System MUST normalize all case status values to be case-insensitive when aggregating data for dashboard charts
- **FR-002**: System MUST display status labels in a standardized format (title case recommended) regardless of how they are stored in the data source
- **FR-003**: System MUST group all case-insensitive variations of the same status value together in chart aggregations (e.g., "Closed", "CLOSED", "closed" all count toward the same category)
- **FR-004**: System MUST apply case-insensitive status normalization consistently across all dashboard charts that display status information
- **FR-005**: System MUST preserve the original case-sensitive status values in the underlying data source (normalization is display-only)
- **FR-006**: System MUST trim leading and trailing whitespace from status values before normalization
- **FR-007**: System MUST handle null, undefined, or empty status values gracefully without causing chart rendering errors
- **FR-008**: Cases by Status chart MUST show each unique status (case-insensitive) exactly once with aggregated counts
- **FR-009**: Cases per Attorney chart MUST apply the same status normalization logic when displaying status-related information
- **FR-010**: Dashboard metrics endpoint MUST perform status normalization on the backend before returning aggregated data

### Key Entities

- **Case Status**: Represents the current state of a case (e.g., "Open", "In Progress", "Closed"). May be stored with varying capitalization in the data source. Must be normalized for display purposes while preserving original values in storage.
- **Dashboard Metrics**: Aggregated statistics calculated from case data, including status-based counts and distributions. Must apply case-insensitive grouping when calculating status-related metrics.

## Success Criteria

### Measurable Outcomes

- **SC-001**: 100% of dashboard charts displaying status information show normalized, case-insensitive status labels
- **SC-002**: Users see zero duplicate status categories caused by capitalization differences in any dashboard chart
- **SC-003**: Status aggregation calculations are accurate, with all case-insensitive variations properly consolidated
- **SC-004**: Dashboard metrics load and display without errors even when the dataset contains mixed-case status values
- **SC-005**: Status normalization applies consistently - comparing any two dashboard charts shows identical status labels for the same underlying values

## Assumptions

- The current system stores case status values in a text field with no enforced capitalization standard
- Status values follow English naming conventions (e.g., "Open", "Closed", "In Progress")
- The standard display format will be title case (first letter uppercase, rest lowercase) for single-word statuses
- Multi-word statuses will use title case for each word (e.g., "In Progress")
- Status normalization logic should be implemented on the backend/data layer rather than just in the UI components
- Original status values in the database will not be modified - normalization is for display and aggregation only
- The system uses standard ASCII characters for status values (special character handling is an edge case)

## Out of Scope

- Retrospectively correcting capitalization in historical data stored in the database
- Enforcing capitalization standards when users or systems create new cases
- Validation or normalization of status values at data entry points
- Translation or localization of status labels for different languages
- Status value standardization beyond case-insensitivity (e.g., correcting typos like "Clossed" vs "Closed")
