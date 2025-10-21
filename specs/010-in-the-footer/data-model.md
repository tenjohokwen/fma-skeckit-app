# Data Model: Footer Branding and Copyright

**Feature**: 010-in-the-footer
**Date**: 2025-10-21

## Overview

**This feature does not involve any data model or data persistence.**

The footer displays static branding text and a dynamically calculated year using JavaScript's `Date` object. No database, API, or state management is required.

## Rationale

The footer is purely presentational with:
- Static text: "Powered by Virtues Cafe"
- Static symbol: "Copyright ©"
- Dynamic year: Calculated client-side using `new Date().getFullYear()`

No data is:
- Stored in database
- Persisted to localStorage
- Sent to/received from API
- Managed in Pinia stores

## Component State

The only "state" is a computed property for the current year:

```javascript
const currentYear = computed(() => new Date().getFullYear())
```

This is ephemeral, recalculated on component mount, and not persisted anywhere.
