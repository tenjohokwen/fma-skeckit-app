# API Contracts: Desktop Application Packaging

**Feature**: [spec.md](../spec.md) | **Plan**: [plan.md](../plan.md)
**Date**: 2025-10-22

## Overview

This feature does NOT introduce new API contracts or backend endpoints. The desktop application is a wrapper for the existing Vue 3/Quasar web application and communicates with the exact same backend APIs as the web version. No API changes are required.

## Contract Changes

**No API changes** - This feature:
- Does NOT add new endpoints
- Does NOT modify existing endpoints
- Does NOT change request/response formats
- Does NOT affect authentication or authorization flows
- Does NOT introduce new backend services

## Existing APIs (Unchanged)

The desktop application uses all existing backend APIs without modification:

### Authentication APIs
- **Login**: POST `/api/auth/login` - Email/password authentication
- **Signup**: POST `/api/auth/signup` - User registration
- **Email Verification**: GET `/api/auth/verify-email/:token` - Email verification callback
- **Password Recovery**: POST `/api/auth/forgot-password` - Request password reset OTP
- **Password Reset**: POST `/api/auth/reset-password` - Reset password with OTP
- **Token Refresh**: POST `/api/auth/refresh-token` - Refresh authentication token

### Client APIs
- **Search Clients**: GET `/api/clients?search=...` - Search for clients by name
- **Read Client**: GET `/api/clients/:id` - Get client details
- **Create Client**: POST `/api/clients` - Create new client folder
- **Update Client**: PUT `/api/clients/:id` - Update client information

### Case APIs
- **Search Cases**: GET `/api/cases?search=...` - Search cases by client or case ID
- **Read Case**: GET `/api/cases/:id` - Get case details with metadata
- **Create Case**: POST `/api/cases` - Create new case folder
- **Update Case**: PUT `/api/cases/:id` - Update case metadata
- **Update Case Metadata**: PUT `/api/cases/:id/metadata` - Update specific metadata fields

### File APIs
- **List Files**: GET `/api/files?caseId=...` - List files in a case folder
- **Upload File**: POST `/api/files` - Upload file to case folder
- **Download File**: GET `/api/files/:id/download` - Download file from Google Drive
- **Delete File**: DELETE `/api/files/:id` - Delete file from Google Drive

### Dashboard APIs (Feature 008)
- **Get Dashboard Analytics**: GET `/api/dashboard/analytics` - Fetch chart data for 6 analytics visualizations

All these APIs remain unchanged and work identically from desktop and web versions.

## Desktop-Specific Interfaces (Not HTTP APIs)

While the desktop wrapper doesn't add HTTP APIs, it does introduce Electron IPC (Inter-Process Communication) for desktop-specific features. These are internal to the desktop application and not network APIs:

### Electron IPC Channels (Internal Only)

**Window Management**:
- `window:minimize` - Minimize application window
- `window:maximize` - Maximize/restore application window
- `window:close` - Close application window

**Deep Linking**:
- `deeplink:open` - Handle custom protocol URLs (e.g., `fmaskeckit://case/12345`)
- Triggered when user clicks fmaskeckit:// link in browser or email

**Notifications**:
- `notification:show` - Display OS-native notification
- `notification:clicked` - User clicked on notification

**Auto-Update** (P3 Feature):
- `update:check` - Check for available updates
- `update:available` - New version is available
- `update:download` - Download update
- `update:install` - Install and restart

**Note**: These are Electron IPC channels between main and renderer processes, NOT HTTP endpoints. They are implementation details of the desktop wrapper.

## External API (Auto-Update Server, P3 Feature)

The auto-update feature (User Story 5, P3 priority) requires querying an external update server:

### Update Check API

**Endpoint**: GitHub Releases API or custom update server
**URL**: `https://api.github.com/repos/{owner}/{repo}/releases/latest` (if using GitHub Releases)

**Request**:
```
GET /repos/{owner}/{repo}/releases/latest
Headers:
  User-Agent: FMA-Skeckit-App/{version}
```

**Response**:
```json
{
  "tag_name": "v1.1.0",
  "published_at": "2025-10-22T12:00:00Z",
  "body": "Release notes markdown",
  "assets": [
    {
      "name": "FMA-Skeckit-App-Setup-1.1.0.exe",
      "browser_download_url": "https://github.com/.../releases/download/v1.1.0/FMA-Skeckit-App-Setup-1.1.0.exe",
      "size": 142857600
    },
    {
      "name": "FMA-Skeckit-App-1.1.0.dmg",
      "browser_download_url": "https://github.com/.../releases/download/v1.1.0/FMA-Skeckit-App-1.1.0.dmg",
      "size": 145678912
    }
  ]
}
```

**Notes**:
- This is the GitHub Releases API format (if using GitHub for hosting)
- electron-updater handles this API call automatically
- Custom update servers can use a simpler format (see electron-updater docs)
- This API is external (GitHub) and not part of the FMA Skeckit backend

## Security Considerations

**Authentication**:
- Desktop app uses same authentication flow as web version
- Tokens stored in LocalStorage (same as web)
- HTTPS required for all API communication
- No changes to authentication or token handling

**CORS**:
- Desktop app runs on `file://` protocol (or localhost with Electron devtools)
- Backend CORS policy should allow desktop origin if not already permissive
- Electron can bypass CORS by disabling web security (NOT RECOMMENDED)
- Proper solution: Backend allows desktop app origin or uses token-based auth without relying on origin checks

**Content Security Policy**:
- Desktop inherits same CSP as web version
- Electron requires explicit CSP configuration in BrowserWindow
- Must allow loading from `file://` protocol or `http://localhost` for dev

## Testing Strategy

**API Testing**:
- Existing API tests remain unchanged (backend tests)
- Desktop uses same APIs, so existing tests provide coverage
- Manual verification that desktop can authenticate and access all features

**Desktop-Specific Testing**:
- Manual testing of deep linking (fmaskeckit:// URLs)
- Manual testing of OS notifications
- Manual testing of auto-update flow (P3)
- Playwright tests for Electron IPC channels (internal communication)

## Summary

This feature introduces **zero new HTTP API contracts**. The desktop application is a client for the existing backend APIs and requires no backend changes. The only "APIs" are internal Electron IPC channels for desktop-specific features (window management, deep linking, notifications, auto-update) and an external GitHub Releases API for auto-updates (P3 feature).

All backend APIs remain unchanged, and the desktop version achieves 100% functional parity with the web version by using the exact same API contracts.
