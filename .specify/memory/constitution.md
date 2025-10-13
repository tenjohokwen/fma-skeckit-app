<!--
SYNC IMPACT REPORT
===================
Version Change: 1.0.0 → 1.0.1 (PATCH: clarification)
Modified Principles: N/A
Added Sections: Google Apps Script Architecture > Project Structure (folder requirement)
Removed Sections: N/A

Templates Requiring Updates:
✅ plan-template.md - Updated Constitution Check to include GAS folder structure requirement
✅ spec-template.md - No changes needed (already references constitution)
✅ tasks-template.md - No changes needed (already references constitution)

Follow-up TODOs:
- None - folder structure requirement added and templates updated
-->

# File Management App Constitution

## Core Principles

### I. Vue 3 Composition API with `<script setup>`

**Rule**: Use `<script setup>` syntax exclusively throughout the codebase. The Options API and `export default` patterns are prohibited.

**Rationale**: Composition API provides superior type inference, better code organization through composables, and improved tree-shaking. The `<script setup>` syntax reduces boilerplate and enforces modern Vue 3 best practices.

**Requirements**:
- MUST use `ref`, `reactive`, `computed`, and `watch` from Vue
- MUST NOT use `this` keyword or class-style components
- MUST leverage Composition API features for all reactive state

### II. Plain JavaScript Only

**Rule**: No TypeScript syntax, interfaces, or type annotations are permitted in the codebase.

**Rationale**: Maintains simplicity and reduces build complexity while keeping the codebase accessible to developers without TypeScript expertise.

**Requirements**:
- MUST use plain JavaScript (.js files) for all code
- MUST use JSDoc comments for clarity when needed
- MUST validate data at runtime using simple checks instead of compile-time type checking

### III. Functional Component Splitting

**Rule**: Each distinct feature MUST be its own component. Components MUST focus on one responsibility and NEVER combine unrelated features.

**Rationale**: Single responsibility principle enables better testing, reusability, and maintainability. Smaller focused components are easier to understand, debug, and modify.

**Requirements**:
- MUST separate distinct features into individual components
- MUST limit each component to a single, well-defined responsibility
- MUST extract shared functionality into composables rather than creating multi-purpose components

### IV. Quasar Integration

**Rule**: Use Quasar components and utilities consistently throughout the application.

**Rationale**: Quasar provides a comprehensive, battle-tested component library with built-in theming, responsive utilities, and consistent UX patterns that accelerate development and ensure visual consistency.

**Requirements**:
- MUST use Quasar components for all UI elements
- MUST leverage Quasar composables like `useQuasar()` for notifications and dialogs
- MUST follow Quasar's theming and spacing utilities (no custom CSS frameworks)

### V. Clean & Readable Code

**Rule**: Components MUST be limited to 250 lines maximum. Reusable logic MUST be extracted into composables.

**Rationale**: Enforcing size limits prevents component bloat and encourages proper abstraction. Composables promote code reuse and testability.

**Requirements**:
- MUST keep components under 250 lines
- MUST extract reusable logic into composables when logic appears in multiple components
- MUST name variables and functions clearly using descriptive, intention-revealing names

## Testing Standards

### Component Isolation

**Rule**: Each functional component MUST have its own dedicated test file that tests only that component's behavior.

**Rationale**: Isolated tests are easier to maintain, debug, and run independently. They provide clear ownership and prevent test interdependencies.

**Requirements**:
- MUST create one test file per functional component
- MUST test only the component's own behavior (not its dependencies)
- MUST place test files adjacent to components or in parallel test directory structure

### Vitest + Vue Test Utils

**Rule**: All tests MUST be written in plain JavaScript using Vitest and Vue Test Utils.

**Rationale**: Vitest provides fast, modern testing with excellent Vue integration. Plain JavaScript tests maintain consistency with the codebase's TypeScript-free approach.

**Requirements**:
- MUST write tests in plain JavaScript (no TypeScript)
- MUST cover user interactions, loading states, and conditional rendering
- MUST mock API calls and Quasar plugins to isolate component behavior

### Realistic Test Scenarios

**Rule**: Tests MUST simulate actual user flows and include edge cases, asserting against visible text or user-facing behavior.

**Rationale**: Testing from the user's perspective ensures the application works as expected in real-world scenarios and catches integration issues.

**Requirements**:
- MUST simulate realistic user interactions (clicks, form inputs, navigation)
- MUST include edge cases (empty states, errors, loading states)
- MUST assert against user-visible behavior rather than implementation details

## User Experience Consistency

### Design System

**Color Palette** (NON-NEGOTIABLE):
- **Primary Blue**: `#2563eb` (headers, buttons, key UI elements)
- **White**: `#ffffff` (form backgrounds, content areas)
- **Dark Text**: `#1e293b` (primary text content)
- **Light Gray**: `#f1f5f9` (subtle backgrounds, borders)
- **Hover Blue**: `#1d4ed8` (interactive elements on hover)
- **Success Green**: `#10b981` (success messages)
- **Warning Amber**: `#f59e0b` (warnings)
- **Error Red**: `#ef4444` (error messages)

**Typography** (NON-NEGOTIABLE):
- **Primary Font**: Inter, system-ui, -apple-system, sans-serif
- **Alternative**: Roboto, Helvetica, Arial, sans-serif
- **Font Sizes**:
  - H1: 28px, weight 700 (page titles)
  - H2: 24px, weight 600 (section titles)
  - H3: 20px, weight 600 (subsection titles)
  - Body Large: 16px, weight 400 (main content)
  - Body Medium: 14px, weight 400 (secondary content)
  - Body Small: 12px, weight 400 (captions, footnotes)
- **Line Height**: Headings 1.2, Body Text 1.5

**Layout Structure** (NON-NEGOTIABLE):
- **Grid**: 12-column, 1200px max-width, 24px gutters
- **Spacing Scale**: 4px, 8px, 16px, 24px, 32px, 48px, 64px
- **Page Structure**:
  - Header: Fixed 80px height
  - Main Content: Flexible height with padding
  - Footer: Fixed 60px height

**Component Specifications**:

Primary Button:
```vue
<q-btn
  unelevated
  color="primary"
  padding="12px 24px"
  class="rounded-6 weight-500"
>
  Button Text
</q-btn>
```

Secondary Button:
```vue
<q-btn
  outline
  color="primary"
  padding="12px 24px"
  class="rounded-6 weight-500 bg-white"
>
  Button Text
</q-btn>
```

Input Field:
```vue
<q-input
  bg-color="white"
  class="rounded-6 q-px-md"
  :style="{ border: '1px solid #f1f5f9' }"
/>
```

Form Section:
```vue
<q-card class="rounded-8 q-pa-md bg-white shadow-1">
  <!-- Form content -->
</q-card>
```

### Quasar Design Language Consistency

**Rule**: MUST use consistent padding, typography, and color via Quasar classes. MUST stick to Quasar's default icon set (Material Icons) and maintain uniform button styles.

**Rationale**: Consistency creates a professional, predictable user experience and reduces cognitive load for users navigating the application.

### Clear Feedback & States

**Rule**: MUST show loading indicators during async operations, display errors via `$q.notify()`, and provide success confirmation after actions.

**Rationale**: Users need clear feedback to understand system state and know whether their actions succeeded or failed.

**Requirements**:
- MUST display loading spinners or skeletons during data fetching
- MUST use `$q.notify()` for all error messages with appropriate severity levels
- MUST confirm successful actions with success notifications

### Accessibility (a11y)

**Rule**: All form inputs MUST have visible labels or `aria-label` attributes. MUST ensure sufficient contrast and focus visibility. MUST make interactive elements keyboard-navigable.

**Rationale**: Accessibility is not optional. The application must be usable by people with disabilities and comply with basic web accessibility standards.

**Requirements**:
- MUST provide labels for all form inputs
- MUST maintain WCAG AA contrast ratios (4.5:1 for normal text)
- MUST ensure all interactive elements are keyboard accessible and show focus indicators

### Responsive by Default

**Rule**: MUST use Quasar's responsive grid system, hide/adjust layout on small screens, and test on mobile viewports during development.

**Rationale**: Mobile-first responsive design ensures the application works across all device sizes and provides an optimal experience regardless of viewport.

**Requirements**:
- MUST use Quasar grid classes (`col-xs`, `col-sm`, `col-md`, etc.)
- MUST adjust layouts for mobile screens (< 768px)
- MUST test features on mobile viewports before considering them complete

## Performance Requirements

### Lazy Loading & Code Splitting

**Rule**: Route-level components MUST be async. Heavy components SHOULD be dynamically imported.

**Rationale**: Lazy loading reduces initial bundle size and improves time-to-interactive, especially for users on slower connections.

**Requirements**:
- MUST use dynamic imports for route components: `component: () => import('pages/SomePage.vue')`
- SHOULD dynamically import large components that aren't needed on initial render

### Efficient Reactivity

**Rule**: MUST use `computed` for derived state, debounce search inputs, and avoid inline functions/objects in templates.

**Rationale**: Efficient reactivity prevents unnecessary re-renders and computations, improving application responsiveness.

**Requirements**:
- MUST use `computed()` for any derived values
- MUST debounce search/filter inputs (300ms minimum)
- MUST extract functions and objects from templates to prevent recreation on every render

### Network & Memory Hygiene

**Rule**: MUST cancel pending requests when components unmount, clean up timers and event listeners, and avoid storing large datasets in component state.

**Rationale**: Proper cleanup prevents memory leaks and unnecessary network traffic that can degrade performance over time.

**Requirements**:
- MUST use AbortController to cancel pending requests in `onUnmounted()`
- MUST clear all timers and remove event listeners in `onUnmounted()`
- MUST use pagination or virtualization for large datasets instead of loading everything into state

### Bundle Awareness

**Rule**: MUST import only needed Quasar components/plugins and avoid large third-party libraries.

**Rationale**: Smaller bundles mean faster load times and better performance, especially on mobile devices with limited bandwidth.

**Requirements**:
- MUST use Quasar's tree-shaking by importing only used components
- MUST evaluate bundle impact before adding new dependencies
- MUST prefer lightweight alternatives when multiple libraries solve the same problem

## Testing Support

**Rule**: Add unique IDs to elements for easy testing.

**Rationale**: Test-specific IDs make tests more reliable and easier to maintain by providing stable selectors that aren't affected by styling changes.

**Requirements**:
- SHOULD add `data-testid` attributes to key interactive elements
- MUST use semantic HTML elements when possible for natural accessibility and testability

## Additional Requirements

### Mobile-First Responsive Design

**Rule**: Design and build for mobile viewports first, then enhance for larger screens.

**Rationale**: Mobile-first ensures the most constrained experience works well, then progressively enhances for more capable devices.

### Clean, Minimalist UI with Clear Navigation

**Rule**: MUST maintain a clean, uncluttered interface with intuitive navigation patterns.

**Rationale**: Simplicity reduces cognitive load and makes the application easier to learn and use.

### Internationalization (i18n)

**Rule**: MUST support both English and French localization.

**Rationale**: Multi-language support ensures the application is accessible to both English and French-speaking users.

**Requirements**:
- MUST use i18n keys for all user-facing text
- MUST provide complete translations in both English and French
- MUST test the application in both languages

### Progress Indicators for Async Operations

**Rule**: MUST display progress indicators for all asynchronous operations.

**Rationale**: Users need visual feedback for operations that take time, preventing confusion about whether the system is working.

## Google Apps Script Architecture

### Project Structure

**Rule**: All Google Apps Script code MUST be written in the `gas/` folder at the root of the project.

**Rationale**: Centralized folder structure provides clear separation between frontend Vue code and backend Apps Script code, making the codebase easier to navigate and maintain.

**Requirements**:
- MUST place all `.gs` files in the `gas/` directory
- MUST organize GAS code by functional area within the `gas/` folder (e.g., `gas/security/`, `gas/handlers/`, `gas/utils/`)
- MUST NOT mix GAS code with frontend code in other directories

### Request Flow

**Pattern** (NON-NEGOTIABLE):
```
Client Request → Security Interceptor → Router → Handler Method → Response Handler → Client
```

**Rationale**: This layered architecture provides separation of concerns, enabling security enforcement, routing logic, and error handling to be managed independently.

### Security

**Rule**: MUST validate tokens for secured endpoints via a security interceptor that processes all requests.

**Rationale**: Centralized security validation prevents bypass attempts and ensures consistent authentication across all endpoints.

**Requirements**:
- MUST implement a security interceptor that runs before routing
- MUST validate token presence, expiration, and integrity
- MUST reject requests with invalid or expired tokens

### Router

**Rule**: MUST route requests to appropriate methods using method discovery and invocation pattern.

**Rationale**: A centralized router enables clean separation between routing logic and business logic.

### Response Handler

**Rule**: MUST return responses in the following standardized JSON format:

```javascript
{
  status: "HTTP status code",
  msgKey: "i18nKey",
  message: "Error message in English",
  data: {},
  token: {
    value: "encrypted",
    ttl: currentUTCTime + 15 minutes,
    username: "username"
  }
}
```

**Rationale**: Standardized responses enable predictable client-side handling and consistent error reporting across the application.

**Requirements**:
- MUST include all fields in every response
- MUST provide i18n keys for localization
- MUST refresh tokens with 15-minute TTL on successful authenticated requests

### Best Practices

**Logging**: Use `console.log()` thoughtfully - log important events and errors, but avoid verbose logging that impacts performance.

**Security** (NON-NEGOTIABLE): Never hard-code tokens or credentials. MUST use PropertiesService for sensitive configuration.

**Caching**: Use CacheService for repeated requests to reduce quota usage and improve response times.

**Configuration**: Use PropertiesService for all environment-specific settings.

### Implementation Pattern

**Rule**: MUST implement the `doPost` function using the following pattern:

```javascript
function doPost(e) {
  return ResponseHandler.handle(() => {
    SecurityInterceptor.validateRequest(e);
    return Router.route(e);
  });
}
```

**Rationale**: This pattern ensures every request flows through security validation and centralized error handling without requiring manual try-catch blocks in every handler.

## Governance

### Amendment Procedure

**Rule**: Constitution amendments MUST be documented with version bump, rationale, and migration plan. All amendments require approval before taking effect.

**Rationale**: Controlled evolution of standards prevents drift and ensures teams have time to adapt to changes.

**Requirements**:
- MUST increment version following semantic versioning rules
- MUST document rationale for changes in sync impact report
- MUST update all dependent templates when constitution changes

### Versioning Policy

**Rule**: Version increments follow semantic versioning:
- **MAJOR**: Backward-incompatible governance/principle removals or redefinitions
- **MINOR**: New principle/section added or materially expanded guidance
- **PATCH**: Clarifications, wording, typo fixes, non-semantic refinements

### Compliance Review

**Rule**: All PRs and code reviews MUST verify compliance with constitution principles. Any complexity that violates principles MUST be justified and documented.

**Rationale**: Active enforcement prevents constitution drift and ensures principles are applied consistently.

**Requirements**:
- MUST reference relevant constitution principles in PR descriptions
- MUST document and justify any deviations from constitutional requirements
- MUST block PRs that violate non-negotiable principles without proper justification

**Version**: 1.0.1 | **Ratified**: 2025-10-13 | **Last Amended**: 2025-10-13
