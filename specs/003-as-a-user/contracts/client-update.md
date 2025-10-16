# API Contract: Client Update Endpoint

**Feature**: Admin Client Information Editing
**Date**: 2025-10-16
**Endpoint**: `client.update`

## Overview

Updates an existing client's personal information. This endpoint is restricted to administrators only and validates data before persisting changes to Google Sheets.

## Request

### HTTP Method
`POST` to Google Apps Script web app URL

### Action
```
action: "client.update"
```

### Authentication
- **Required**: Yes
- **Token**: Must be included in request body
- **Role**: ROLE_ADMIN only

### Request Body

```javascript
{
  "action": "client.update",
  "data": {
    "clientId": "string",      // Required: Client identifier
    "firstName": "string",     // Required: 1-50 characters
    "lastName": "string",      // Required: 1-50 characters
    "nationalId": "string",    // Required: 5-20 characters, must be unique
    "telephone": "string",     // Optional: 10-15 digits, E.164 format
    "email": "string"          // Optional: Valid email format
  },
  "token": "string"            // Required: Authentication token
}
```

### Field Constraints

| Field | Required | Min Length | Max Length | Format | Unique |
|-------|----------|------------|------------|--------|--------|
| clientId | Yes | N/A | N/A | UUID | Yes |
| firstName | Yes | 1 | 50 | Any text | No |
| lastName | Yes | 1 | 50 | Any text | No |
| nationalId | Yes | 5 | 20 | Alphanumeric | Yes |
| telephone | No | 10 | 15 | E.164 digits | No |
| email | No | N/A | 100 | RFC 5322 | No |

### Example Request

```javascript
{
  "action": "client.update",
  "data": {
    "clientId": "abc123-def456-ghi789",
    "firstName": "Jean",
    "lastName": "Dupont",
    "nationalId": "12345-67890",
    "telephone": "+237612345678",
    "email": "jean.dupont@example.com"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

## Response

### Success Response (HTTP 200)

```javascript
{
  "status": 200,
  "msgKey": "client.update.success",
  "message": "Client information updated successfully",
  "data": {
    "client": {
      "clientId": "abc123-def456-ghi789",
      "firstName": "Jean",
      "lastName": "Dupont",
      "nationalId": "12345-67890",
      "telephone": "+237612345678",
      "email": "jean.dupont@example.com",
      "folderId": "1a2b3c4d5e6f7g8h9i0j",
      "createdAt": "2025-01-15T10:30:00",
      "updatedAt": "2025-10-16T14:25:33"
    }
  },
  "token": {
    "value": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "ttl": 1734357933000,
    "username": "admin@example.com"
  }
}
```

### Error Responses

#### 400 Bad Request - Missing Required Fields

```javascript
{
  "status": 400,
  "msgKey": "client.update.error.missingFields",
  "message": "First name, last name, and national ID are required",
  "data": {},
  "token": {
    "value": "...",
    "ttl": 1734357933000,
    "username": "admin@example.com"
  }
}
```

#### 400 Bad Request - Validation Error

```javascript
{
  "status": 400,
  "msgKey": "client.update.error.validation",
  "message": "Validation failed: First name must be 50 characters or less",
  "data": {
    "errors": [
      "First name must be 50 characters or less"
    ]
  },
  "token": {
    "value": "...",
    "ttl": 1734357933000,
    "username": "admin@example.com"
  }
}
```

#### 400 Bad Request - Duplicate National ID

```javascript
{
  "status": 400,
  "msgKey": "client.update.error.duplicateNationalId",
  "message": "This National ID is already registered to another client",
  "data": {
    "field": "nationalId",
    "value": "12345-67890"
  },
  "token": {
    "value": "...",
    "ttl": 1734357933000,
    "username": "admin@example.com"
  }
}
```

#### 401 Unauthorized - Invalid or Expired Token

```javascript
{
  "status": 401,
  "msgKey": "error.unauthorized",
  "message": "Invalid or expired token",
  "data": {}
}
```

#### 403 Forbidden - Insufficient Permissions

```javascript
{
  "status": 403,
  "msgKey": "error.forbidden",
  "message": "Admin access required",
  "data": {},
  "token": {
    "value": "...",
    "ttl": 1734357933000,
    "username": "user@example.com"
  }
}
```

#### 404 Not Found - Client Does Not Exist

```javascript
{
  "status": 404,
  "msgKey": "client.update.error.notFound",
  "message": "Client not found",
  "data": {
    "clientId": "invalid-id"
  },
  "token": {
    "value": "...",
    "ttl": 1734357933000,
    "username": "admin@example.com"
  }
}
```

#### 500 Internal Server Error

```javascript
{
  "status": 500,
  "msgKey": "error.server",
  "message": "Failed to update client: [error details]",
  "data": {},
  "token": {
    "value": "...",
    "ttl": 1734357933000,
    "username": "admin@example.com"
  }
}
```

## Backend Implementation

### Handler Method

**Location**: `gas/handlers/ClientHandler.gs`

```javascript
/**
 * Updates an existing client's personal information
 * Admin-only endpoint
 *
 * @param {Object} context - Request context from Router
 * @param {Object} context.data - Request parameters
 * @param {string} context.data.clientId - Client ID to update
 * @param {string} context.data.firstName - New first name
 * @param {string} context.data.lastName - New last name
 * @param {string} context.data.nationalId - New national ID
 * @param {string} context.data.telephone - New telephone (optional)
 * @param {string} context.data.email - New email (optional)
 * @param {Object} context.user - Current user
 * @returns {Object} Response with updated client data
 */
update: function(context) {
  try {
    // Admin-only authorization check
    if (!context.user || context.user.role !== 'ROLE_ADMIN') {
      throw ResponseHandler.forbiddenError(
        'Admin access required',
        'error.forbidden'
      );
    }

    // Extract and validate request data
    const { clientId, firstName, lastName, nationalId, telephone, email } = context.data;

    if (!clientId) {
      throw ResponseHandler.validationError(
        'Client ID is required',
        'client.update.error.missingClientId'
      );
    }

    if (!firstName || !lastName || !nationalId) {
      throw ResponseHandler.validationError(
        'First name, last name, and national ID are required',
        'client.update.error.missingFields'
      );
    }

    // Update client via SheetsService
    const updatedClient = SheetsService.updateClient(clientId, {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      nationalId: nationalId.trim(),
      telephone: telephone ? telephone.trim() : '',
      email: email ? email.trim() : ''
    });

    return {
      status: 200,
      msgKey: 'client.update.success',
      message: 'Client information updated successfully',
      data: {
        client: updatedClient
      }
    };

  } catch (error) {
    Logger.log('Error in ClientHandler.update: ' + error.toString());

    if (error.status) {
      throw error;
    }

    throw ResponseHandler.serverError(
      'Failed to update client: ' + error.toString(),
      'error.server'
    );
  }
}
```

### Service Method

**Location**: `gas/services/SheetsService.gs`

```javascript
/**
 * Updates an existing client in the clients sheet
 * Validates data and checks for duplicate national IDs
 *
 * @param {string} clientId - Client ID to update
 * @param {Object} clientData - Updated client data
 * @returns {Object} Updated client object
 * @throws {Error} If validation fails or client not found
 */
updateClient: function(clientId, clientData) {
  const sheet = this.getClientsSheet();
  const data = sheet.getDataRange().getValues();
  
  // Find client row (skip header)
  let clientRow = -1;
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === clientId) {
      clientRow = i + 1; // Convert to 1-based index
      break;
    }
  }
  
  if (clientRow === -1) {
    throw ResponseHandler.notFoundError(
      'Client not found',
      'client.update.error.notFound'
    );
  }
  
  // Validate data
  const errors = this.validateClientData(clientData, clientId);
  if (errors.length > 0) {
    throw ResponseHandler.validationError(
      'Validation failed: ' + errors.join(', '),
      'client.update.error.validation'
    );
  }
  
  // Check national ID uniqueness (excluding current client)
  for (let i = 1; i < data.length; i++) {
    if (i + 1 !== clientRow && data[i][3] === clientData.nationalId) {
      throw ResponseHandler.validationError(
        'This National ID is already registered to another client',
        'client.update.error.duplicateNationalId'
      );
    }
  }
  
  // Update row
  const now = new Date();
  sheet.getRange(clientRow, 2).setValue(clientData.firstName); // B: firstName
  sheet.getRange(clientRow, 3).setValue(clientData.lastName);  // C: lastName
  sheet.getRange(clientRow, 4).setValue(clientData.nationalId); // D: nationalId
  sheet.getRange(clientRow, 5).setValue(clientData.telephone);  // E: telephone
  sheet.getRange(clientRow, 6).setValue(clientData.email);      // F: email
  sheet.getRange(clientRow, 9).setValue(DateUtil.formatDate(now)); // I: updatedAt
  
  // Return updated client
  return {
    clientId: clientId,
    firstName: clientData.firstName,
    lastName: clientData.lastName,
    nationalId: clientData.nationalId,
    telephone: clientData.telephone,
    email: clientData.email,
    folderId: data[clientRow - 1][6], // G: folderId (unchanged)
    createdAt: data[clientRow - 1][7], // H: createdAt (unchanged)
    updatedAt: DateUtil.formatDate(now)
  };
}
```

## Frontend Implementation

### Pinia Store Action

**Location**: `src/stores/client.js`

```javascript
/**
 * Update client information
 * @param {string} clientId - Client ID
 * @param {Object} clientData - Updated client data
 * @returns {Promise<Object>} Updated client object
 */
async function updateClient(clientId, clientData) {
  loading.value = true
  error.value = null

  try {
    const response = await api.post('client.update', {
      clientId,
      ...clientData
    })

    const updatedClient = response.data.client

    // Update selectedClient if it's the one being edited
    if (selectedClient.value?.clientId === clientId) {
      selectedClient.value = updatedClient
    }

    return updatedClient
  } catch (err) {
    error.value = err.message
    throw err
  } finally {
    loading.value = false
  }
}
```

## Security Considerations

1. **Admin-Only Access**: Endpoint validates user role is ROLE_ADMIN before processing
2. **Token Validation**: All requests must include valid, non-expired token
3. **Input Sanitization**: All string inputs are trimmed before processing
4. **SQL Injection Prevention**: N/A (using Google Sheets, not SQL)
5. **XSS Prevention**: Frontend uses Vue's template escaping by default
6. **Rate Limiting**: Inherits Google Apps Script's built-in rate limits

## Performance Considerations

1. **Uniqueness Check**: O(n) linear scan through clients sheet
   - Acceptable for < 1000 clients
   - Future optimization: Add nationalId index for O(1) lookup
2. **Validation**: All validation happens server-side after client-side checks
3. **Response Time**: Target < 2 seconds end-to-end
4. **Caching**: No caching for client data (always fetch fresh to prevent stale edits)

## Testing

### Unit Tests (Backend)
- Test admin-only enforcement
- Test required field validation
- Test format validation (email, phone)
- Test national ID uniqueness check
- Test successful update flow
- Test client not found error

### Integration Tests (Frontend)
- Test form validation before submit
- Test successful save updates UI
- Test error handling displays notification
- Test concurrent edit warning (future)

### E2E Tests
- Admin can edit and save client information
- Non-admin users cannot access edit functionality
- Validation errors prevent save
- Duplicate national ID is rejected
- Successful save shows confirmation

