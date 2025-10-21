# Research: Footer Branding and Copyright

**Feature**: 010-in-the-footer
**Date**: 2025-10-21

## Overview

This feature requires adding a simple footer with branding and copyright information to all pages. No research was needed as all technical decisions are straightforward and use existing patterns.

## Technical Decisions

### Decision 1: Footer Component Type

**Decision**: Use Quasar's `<q-footer>` component inline within both layout files rather than creating a separate reusable component.

**Rationale**:
- Footer is only 5-7 lines of template code
- Used in exactly 2 places (MainLayout and EmptyLayout)
- Creating a separate component would add unnecessary abstraction
- Constitution permits inline components under 10 lines
- Quasar `<q-footer>` provides built-in positioning and styling

**Alternatives Considered**:
- **Separate FooterBranding.vue component**: Rejected because the footer is too simple to warrant its own file and would only be used in 2 places
- **Global Vue component**: Rejected as it violates the functional component splitting principle

---

### Decision 2: Year Calculation Method

**Decision**: Use Vue 3 `computed` property with `new Date().getFullYear()`

**Rationale**:
- Automatically updates when year changes (no manual code updates needed)
- Computed property is reactive and efficient (only recalculates when dependencies change)
- Native JavaScript Date object - no external dependencies
- Follows Vue 3 Composition API best practices

**Alternatives Considered**:
- **Hardcoded year**: Rejected because it requires manual updates every year (violates FR-003)
- **Server-side year injection**: Rejected as overkill for a simple UI element and adds unnecessary backend dependency
- **Build-time year**: Rejected because it would require rebuilding the app each year

---

### Decision 3: Footer Styling

**Decision**: Use Quasar utility classes with Light Gray background (`bg-grey-2`) and muted text color (`text-grey-7`)

**Rationale**:
- Follows constitution's design system color palette (#f1f5f9 = grey-2 in Quasar)
- Uses Quasar's built-in color system for consistency
- `text-caption` class provides appropriate small font size
- `q-pa-sm` provides appropriate padding (8px per Quasar's spacing scale)

**Alternatives Considered**:
- **Custom CSS styling**: Rejected in favor of Quasar utility classes to maintain design system consistency
- **Darker background**: Rejected because footer should be subtle and non-intrusive per spec assumptions

---

### Decision 4: Footer Text Format

**Decision**: "Powered by Virtues Cafe | Copyright © [year]" with pipe separator

**Rationale**:
- Clear visual separation between branding and copyright
- Single line of text works well on all screen sizes
- Pipe separator is a common pattern for footer attributions

**Alternatives Considered**:
- **Two separate lines**: Rejected as it uses more vertical space unnecessarily
- **No separator**: Rejected as it makes text harder to parse visually
- **Bullet separator (•)**: Rejected in favor of pipe for better contrast

---

### Decision 5: Responsive Behavior

**Decision**: Keep text on single line for all screen sizes, using Quasar's `text-caption` for appropriate sizing

**Rationale**:
- Short text fits on one line even on 320px width screens
- `text-caption` (12px) is readable on all devices
- Simpler implementation than responsive text stacking

**Alternatives Considered**:
- **Stack on mobile (<600px)**: Rejected as unnecessary given short text length
- **Reduce font size on mobile**: Rejected because `text-caption` is already appropriately sized

---

## No Research Required

The following areas required no research because they use existing, well-established patterns:

1. **Testing Approach**: Use existing Vitest + Vue Test Utils setup
2. **Component Location**: Obvious - MainLayout.vue and EmptyLayout.vue
3. **Internationalization**: English-only per spec (no i18n needed)
4. **Accessibility**: Quasar footer component handles semantics automatically

## Implementation Notes

- Total lines added per layout: ~7 lines (template) + 3 lines (script) = 10 lines
- No new dependencies required
- No performance impact (static content with simple computed property)
- No backend changes needed
