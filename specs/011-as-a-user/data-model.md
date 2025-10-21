# Data Model: UI Simplification - Remove File and Client Management Pages

**Feature**: [spec.md](spec.md) | **Plan**: [plan.md](plan.md)
**Date**: 2025-10-21

## Overview

This feature does NOT introduce any data model changes. It is a pure frontend UI simplification that removes navigation pages and routes without affecting the underlying data structures.

## Entities

**No new entities** - This feature removes UI components only.

## Existing Entities (Unchanged)

The following entities remain unchanged by this feature:

- **Client**: Managed through SearchPage instead of ClientManagementPage
- **Case**: Managed through SearchPage, CaseDetailsPage, and CaseEditPage
- **File**: Managed through CaseFilesPage (case-specific files) instead of FileManagementPage (global file browser)
- **User**: Authentication and profile management unchanged

## Data Flow

**No changes to data flow** - All data operations continue to work through retained pages:

- Client search and management: SearchPage
- Case viewing and editing: CaseDetailsPage, CaseEditPage
- Case file management: CaseFilesPage
- User authentication: LoginPage, SignUpPage, EmailVerificationPage
- User profile: ProfilePage

## Storage

**No storage changes** - All data continues to be stored in Google Sheets via Google Apps Script backend. No APIs, schemas, or storage mechanisms are affected by this feature.

## Migration

**No data migration required** - This is a UI-only change with zero impact on stored data.

## Summary

This feature has no data model implications. It removes frontend pages and navigation entries without touching the underlying data layer, business logic, or storage mechanisms.
