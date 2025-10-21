# API Contracts: UI Simplification - Remove File and Client Management Pages

**Feature**: [spec.md](../spec.md) | **Plan**: [plan.md](../plan.md)
**Date**: 2025-10-21

## Overview

This feature does NOT introduce any new API contracts or modify existing APIs. It is a pure frontend UI simplification with zero backend impact.

## Contract Changes

**No API changes** - This feature:
- Does NOT add new endpoints
- Does NOT modify existing endpoints
- Does NOT change request/response formats
- Does NOT affect authentication or authorization flows

## Existing APIs (Unchanged)

All existing Google Apps Script endpoints remain unchanged:

- **Authentication APIs**: Login, signup, email verification, token refresh
- **Client APIs**: Search, read, update operations (accessed via SearchPage instead of ClientManagementPage)
- **Case APIs**: CRUD operations for cases
- **File APIs**: Upload, download, list operations (accessed via CaseFilesPage instead of FileManagementPage)

## Frontend-Only Change

This feature removes two frontend pages and navigation entries. All backend functionality remains intact and accessible through other retained pages in the application.

## Summary

No API contracts, OpenAPI specifications, or GraphQL schemas are needed for this feature. It is exclusively a frontend routing and navigation simplification.
