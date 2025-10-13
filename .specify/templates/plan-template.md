# Implementation Plan: [FEATURE]

**Branch**: `[###-feature-name]` | **Date**: [DATE] | **Spec**: [link]
**Input**: Feature specification from `/specs/[###-feature-name]/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

[Extract from feature spec: primary requirement + technical approach from research]

## Technical Context

<!--
  ACTION REQUIRED: Replace the content in this section with the technical details
  for the project. The structure here is presented in advisory capacity to guide
  the iteration process.
-->

**Language/Version**: [e.g., Python 3.11, Swift 5.9, Rust 1.75 or NEEDS CLARIFICATION]  
**Primary Dependencies**: [e.g., FastAPI, UIKit, LLVM or NEEDS CLARIFICATION]  
**Storage**: [if applicable, e.g., PostgreSQL, CoreData, files or N/A]  
**Testing**: [e.g., pytest, XCTest, cargo test or NEEDS CLARIFICATION]  
**Target Platform**: [e.g., Linux server, iOS 15+, WASM or NEEDS CLARIFICATION]
**Project Type**: [single/web/mobile - determines source structure]  
**Performance Goals**: [domain-specific, e.g., 1000 req/s, 10k lines/sec, 60 fps or NEEDS CLARIFICATION]  
**Constraints**: [domain-specific, e.g., <200ms p95, <100MB memory, offline-capable or NEEDS CLARIFICATION]  
**Scale/Scope**: [domain-specific, e.g., 10k users, 1M LOC, 50 screens or NEEDS CLARIFICATION]

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Core Principles Compliance

- [ ] **Vue 3 Composition API**: Feature uses `<script setup>` exclusively, no Options API or `export default`
- [ ] **Plain JavaScript**: No TypeScript syntax, interfaces, or type annotations
- [ ] **Functional Component Splitting**: Each distinct feature is its own component with single responsibility
- [ ] **Quasar Integration**: Uses Quasar components and composables consistently
- [ ] **Clean & Readable Code**: Components under 250 lines, reusable logic extracted to composables

### Testing Standards Compliance

- [ ] **Component Isolation**: Each component has its own dedicated test file
- [ ] **Vitest + Vue Test Utils**: Tests written in plain JavaScript
- [ ] **Realistic Test Scenarios**: Tests simulate actual user flows with edge cases

### UX Consistency Compliance

- [ ] **Design System**: Follows color palette, typography, and layout structure specifications
- [ ] **Quasar Design Language**: Consistent padding, typography, Material Icons
- [ ] **Clear Feedback & States**: Loading indicators, `$q.notify()` for errors, success confirmations
- [ ] **Accessibility**: Form labels, WCAG AA contrast, keyboard navigation
- [ ] **Responsive**: Uses Quasar grid system, mobile-tested

### Performance Requirements Compliance

- [ ] **Lazy Loading**: Route components are async, heavy components dynamically imported
- [ ] **Efficient Reactivity**: Uses `computed` for derived state, debounced search inputs
- [ ] **Network & Memory Hygiene**: Cancels requests on unmount, cleans up timers/listeners
- [ ] **Bundle Awareness**: Imports only needed Quasar components, evaluates dependency impact

### Additional Requirements Compliance

- [ ] **Mobile-First Design**: Designed for mobile viewports first
- [ ] **Internationalization**: Supports English and French via i18n keys
- [ ] **Progress Indicators**: Displays indicators for all async operations

### Google Apps Script Architecture Compliance (if applicable)

- [ ] **Project Structure**: All GAS code written in `gas/` folder at project root
- [ ] **Request Flow**: Follows Security Interceptor → Router → Handler → Response pattern
- [ ] **Security**: Validates tokens, uses PropertiesService for credentials
- [ ] **Response Format**: Returns standardized JSON with status, msgKey, message, data, token

## Project Structure

### Documentation (this feature)

```
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)
<!--
  ACTION REQUIRED: Replace the placeholder tree below with the concrete layout
  for this feature. Delete unused options and expand the chosen structure with
  real paths (e.g., apps/admin, packages/something). The delivered plan must
  not include Option labels.
-->

```
# [REMOVE IF UNUSED] Option 1: Single project (DEFAULT)
src/
├── models/
├── services/
├── cli/
└── lib/

tests/
├── contract/
├── integration/
└── unit/

# [REMOVE IF UNUSED] Option 2: Web application (when "frontend" + "backend" detected)
backend/
├── src/
│   ├── models/
│   ├── services/
│   └── api/
└── tests/

frontend/
├── src/
│   ├── components/
│   ├── pages/
│   └── services/
└── tests/

# [REMOVE IF UNUSED] Option 3: Mobile + API (when "iOS/Android" detected)
api/
└── [same as backend above]

ios/ or android/
└── [platform-specific structure: feature modules, UI flows, platform tests]
```

**Structure Decision**: [Document the selected structure and reference the real
directories captured above]

## Complexity Tracking

*Fill ONLY if Constitution Check has violations that must be justified*

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |
