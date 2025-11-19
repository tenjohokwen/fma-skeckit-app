# Security Architecture Documentation

**Version**: 1.0
**Last Updated**: November 2025
**Purpose**: Reusable security framework for Google Apps Script applications with Vue.js/Quasar frontends

---

## Table of Contents

1. [Overview](#overview)
2. [Security Use Cases and Flows](#security-use-cases-and-flows)
3. [Architecture Components](#architecture-components)
4. [Google Apps Script Backend Integration](#google-apps-script-backend-integration)
5. [Vue.js + Quasar Frontend Integration](#vuejs--quasar-frontend-integration)
6. [Implementation Guide](#implementation-guide)
7. [Security Best Practices](#security-best-practices)

---

## Overview

This security framework provides a complete, production-ready authentication and authorization system for Google Apps Script (GAS) applications. It implements:

- **Token-based authentication** (JWT-like encrypted tokens)
- **Role-based access control** (RBAC)
- **Email verification** workflow
- **Password reset** with OTP
- **Session management** with automatic token refresh
- **Standardized error handling**
- **Request routing** with security interceptors

### Key Features

✅ **Secure password storage** with salt and iterative SHA-256 hashing
✅ **Encrypted authentication tokens** with expiry validation
✅ **Public and secured route** differentiation
✅ **Admin-only route** protection
✅ **Automatic session extension** on authenticated requests
✅ **Comprehensive validation** (email format, password strength, required fields)
✅ **i18n-ready** error messages and responses

---

## Security Use Cases and Flows

### Use Case 1: User Registration

**Actors**: Anonymous User, System, Email Service
**Flow**:

1. User submits email and password to `auth.signup`
2. System validates email format and password strength
3. System checks for duplicate email
4. System generates salt and hashes password (PBKDF2-like with SHA-256, 1000 iterations)
5. System generates UUID verification token with 24-hour expiry
6. System stores user with `PENDING` status
7. System sends verification email with token
8. User receives email and enters token in `auth.verifyEmail`
9. System validates token and expiry
10. System updates user status to `VERIFIED`
11. System generates authentication token
12. User is automatically logged in

**Security Measures**:
- Password never stored in plain text
- Email validation before storage
- Password strength requirements enforced
- Time-limited verification tokens
- Account locked until email verified

### Use Case 2: User Login

**Actors**: Verified User, System
**Flow**:

1. User submits email and password to `auth.login`
2. System retrieves user by email
3. System validates password against stored hash
4. System checks user status is `VERIFIED`
5. System generates encrypted authentication token with TTL
6. System returns token and user data
7. Frontend stores token in localStorage
8. Frontend includes token in all subsequent requests

**Security Measures**:
- Constant-time password comparison
- Account status verification
- Token expiry (configurable, default 15 minutes)
- Encrypted token payload
- No password in response

### Use Case 3: Password Reset

**Actors**: User, System, Email Service
**Flow**:

1. User submits email to `auth.requestPasswordReset`
2. System generates 6-digit OTP with 2-hour expiry
3. System stores OTP and expiry in user record
4. System sends OTP via email
5. User enters email and OTP in `auth.verifyOTP`
6. System validates OTP and expiry
7. User submits new password in `auth.resetPassword`
8. System validates password strength
9. System re-verifies OTP (paranoid validation)
10. System generates new salt and hashes new password
11. System clears OTP fields
12. User redirected to login

**Security Measures**:
- Time-limited OTP (2 hours)
- OTP validation on both verify and reset endpoints
- Password strength re-validation
- New salt generated for new password
- OTP cleared after successful reset

### Use Case 4: Authenticated Request

**Actors**: Authenticated User, System
**Flow**:

1. User sends request with `action` and `token` in body
2. SecurityInterceptor extracts action and token
3. SecurityInterceptor checks if route is public
4. If secured, SecurityInterceptor decrypts and validates token
5. SecurityInterceptor retrieves user from database
6. SecurityInterceptor validates user status is `VERIFIED`
7. SecurityInterceptor checks role for admin-only routes
8. Router receives validated context with user data
9. Router invokes appropriate handler method
10. Handler processes request with user context
11. Handler generates new token to extend session
12. ResponseHandler returns data with refreshed token
13. Frontend updates token in localStorage

**Security Measures**:
- Token decryption and integrity check
- Token expiry validation
- User status verification
- Role-based access control
- Automatic session extension
- Token refresh on every request

### Use Case 5: Session Expiration

**Actors**: Frontend Session Monitor, User, System
**Flow**:

1. Frontend monitors token TTL every second
2. When 60 seconds remain, show warning dialog
3. User can click "Extend Session" or let it expire
4. If extended, frontend calls `auth.ping`
5. Backend validates token and returns new token
6. Frontend updates token and resets timers
7. If expired, frontend clears token and redirects to login
8. Backend rejects all requests with expired token

**Security Measures**:
- Client-side session monitoring
- Graceful expiration handling
- Automatic logout on expiry
- Ping endpoint for explicit session extension
- Multi-tab synchronization via localStorage events

---

## Architecture Components

### 1. TokenManager (`gas/security/TokenManager.gs`)

**Purpose**: Manages JWT-like token generation, encryption, and validation

**Key Methods**:
- `generateToken(username)`: Creates encrypted token with username and expiry
- `validateToken(token)`: Decrypts and validates token, checks expiry
- `refreshToken(token)`: Generates new token from valid token
- `encrypt(text)`: XOR-based encryption (suitable for GAS environment)
- `decrypt(encryptedText)`: Decrypts encrypted text

**Token Structure** (before encryption):
```javascript
{
  username: "user@example.com",
  expiry: 1699999999999,  // Unix timestamp in ms
  issued: 1699998888888   // Unix timestamp in ms
}
```

**Configuration Required**:
- `ENCRYPTION_KEY`: Script property for token encryption
- `TOKEN_TTL_MINUTES`: Token lifetime (default: 15 minutes)

**Security Notes**:
- Uses XOR encryption (simple but effective for GAS constraints)
- For production, consider external cryptographic service
- Tokens are base64-encoded after encryption
- Expiry checked on every validation

### 2. SecurityInterceptor (`gas/security/SecurityInterceptor.gs`)

**Purpose**: Intercepts all requests, validates authentication, enforces authorization

**Key Methods**:
- `validateRequest(e)`: Main entry point, validates and routes requests
- `extractAction(e)`: Extracts action from URL params or POST body
- `extractToken(e, requestData)`: Extracts token from headers or body
- `isPublicRoute(action)`: Checks if route requires authentication
- `isAdminRoute(action)`: Checks if route requires admin role
- `validateRequiredFields(data, fields)`: Validates required fields present
- `isValidEmail(email)`: Validates email format
- `sanitizeInput(input)`: Removes potentially harmful characters

**Route Categories**:

**Public Routes** (no authentication required):
```javascript
[
  'auth.signup',
  'auth.verifyEmail',
  'auth.resendVerification',
  'auth.login',
  'auth.requestPasswordReset',
  'auth.verifyOTP',
  'auth.resetPassword'
]
```

**Admin Routes** (requires `ROLE_ADMIN`):
```javascript
[
  'metadata.search',
  'metadata.create',
  'metadata.update',
  'metadata.delete'
]
```

**Request Context Structure**:
```javascript
{
  action: "handler.method",
  data: { /* request payload */ },
  user: { /* user object (null for public routes) */ },
  token: "encrypted_token_string"
}
```

### 3. ResponseHandler (`gas/utils/ResponseHandler.gs`)

**Purpose**: Standardizes HTTP responses across all endpoints

**Response Structure**:
```javascript
{
  status: 200,                    // HTTP status code
  msgKey: "auth.login.success",   // i18n message key
  message: "Login successful",    // English message
  data: { /* response payload */ },
  token: {                        // Optional, for authenticated endpoints
    value: "encrypted_token",
    ttl: 1699999999999,          // Expiry timestamp
    username: "user@example.com"
  }
}
```

**Key Methods**:
- `handle(fn)`: Wraps function execution with try-catch
- `success(result)`: Creates success response
- `successWithToken(msgKey, message, data, user, tokenValue)`: Success with token refresh
- `error(error)`: Creates error response
- `validationError(message, msgKey)`: 400 Bad Request
- `unauthorizedError(message, msgKey)`: 401 Unauthorized
- `forbiddenError(message, msgKey)`: 403 Forbidden
- `notFoundError(message, msgKey)`: 404 Not Found
- `conflictError(message, msgKey)`: 409 Conflict
- `serverError(message, msgKey)`: 500 Internal Server Error

**Usage Pattern**:
```javascript
// Handler method
return ResponseHandler.successWithToken(
  'operation.success',
  'Operation completed',
  { id: 123, name: 'Example' },
  context.user,
  TokenManager.generateToken(context.user.email).value
);
```

### 4. PasswordUtil (`gas/utils/PasswordUtil.gs`)

**Purpose**: Secure password hashing and validation

**Key Methods**:
- `generateSalt()`: Creates random 16-byte salt (base64-encoded)
- `hashPassword(password, salt)`: Hashes password with PBKDF2-like algorithm
- `validatePassword(password, storedHash, salt)`: Constant-time comparison
- `validatePasswordStrength(password)`: Enforces password policy
- `generateOTP()`: Creates 6-digit OTP

**Password Policy**:
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character (!@#$%^&*(),.?":{}|<>)

**Hashing Algorithm**:
```javascript
// PBKDF2-like: 1000 iterations of SHA-256
let hash = passwordBytes;
for (let i = 0; i < 1000; i++) {
  hash = SHA256(hash + saltBytes);
}
```

### 5. UserService (`gas/services/UserService.gs`)

**Purpose**: Database operations for user management (Google Sheets backend)

**Sheet Schema** (`users` sheet):
```
A: email
B: password (hashed)
C: salt
D: role (ROLE_ADMIN | ROLE_USER)
E: status (PENDING | VERIFIED)
F: verificationToken
G: verificationTokenExpiry
H: passwordResetOTP
I: otpExpiry
J: createdAt
K: lastLoginAt
```

**Key Methods**:
- `createUser(userData)`: Creates user with hashed password and verification token
- `getUserByEmail(email)`: Retrieves user by email
- `verifyEmail(email, token)`: Validates token and updates status
- `generatePasswordResetOTP(email)`: Creates and stores OTP
- `verifyPasswordResetOTP(email, otp)`: Validates OTP
- `resetPassword(email, otp, newPassword)`: Resets password after OTP validation
- `updateUser(email, updates)`: Updates user fields
- `updateLastLogin(email)`: Updates last login timestamp

**Security Considerations**:
- Never returns password or salt in user objects
- Email used as unique identifier
- Type-safe OTP comparison (string conversion)
- Expiry validation for tokens and OTPs

### 6. AuthHandler (`gas/handlers/AuthHandler.gs`)

**Purpose**: Handles all authentication endpoints

**Endpoints**:

| Endpoint | Method | Public | Description |
|----------|--------|--------|-------------|
| `auth.signup` | POST | ✅ | Create user account |
| `auth.verifyEmail` | POST | ✅ | Verify email with token |
| `auth.resendVerification` | POST | ✅ | Resend verification email |
| `auth.login` | POST | ✅ | Authenticate and get token |
| `auth.ping` | POST | ❌ | Extend session (authenticated) |
| `auth.requestPasswordReset` | POST | ✅ | Request password reset OTP |
| `auth.verifyOTP` | POST | ✅ | Verify OTP |
| `auth.resetPassword` | POST | ✅ | Reset password with OTP |

**Handler Pattern**:
```javascript
methodName: function(context) {
  // 1. Validate required fields
  SecurityInterceptor.validateRequiredFields(context.data, ['field1', 'field2']);

  // 2. Validate business logic
  if (!isValid) {
    throw ResponseHandler.validationError('Error message', 'error.key');
  }

  // 3. Process request
  const result = Service.doSomething(context.data);

  // 4. Return response
  return ResponseHandler.successWithToken(
    'msgKey',
    'Message',
    result,
    context.user,
    newToken
  );
}
```

### 7. Router (`gas/utils/Router.gs`)

**Purpose**: Routes requests to appropriate handlers based on action string

**Routing Pattern**:
```
Action Format: "handler.method"
Example: "auth.login" → AuthHandler.login(context)
```

**Key Methods**:
- `route(context)`: Routes validated request to handler
- `getHandler(handlerName)`: Returns handler object by name
- `listRoutes()`: Returns all available routes (for documentation)

**Handler Registry**:
```javascript
const handlers = {
  'auth': AuthHandler,
  'metadata': MetadataHandler,
  'file': FileHandler,
  'client': ClientHandler,
  'case': CaseHandler,
  'folder': FolderHandler,
  'dashboard': DashboardHandler
};
```

**Request Flow**:
```
doPost(e)
  → ResponseHandler.handle()
    → SecurityInterceptor.validateRequest(e)
      → Router.route(context)
        → Handler.method(context)
          → ResponseHandler.successWithToken()
```

---

## Google Apps Script Backend Integration

### Step 1: Copy Security Files

Copy the following files to your GAS project:

**Core Security** (required):
```
gas/security/TokenManager.gs
gas/security/SecurityInterceptor.gs
gas/utils/ResponseHandler.gs
gas/utils/PasswordUtil.gs
gas/utils/Router.gs
gas/utils/DateUtil.gs
gas/services/UserService.gs
gas/handlers/AuthHandler.gs
```

**Supporting Files** (if using email features):
```
gas/services/EmailService.gs
```

### Step 2: Configure Script Properties

In Google Apps Script Project Settings > Script Properties, add:

| Property | Example Value | Description |
|----------|---------------|-------------|
| `ENCRYPTION_KEY` | `a1b2c3d4e5f6g7h8...` | 32+ character random string |
| `TOKEN_TTL_MINUTES` | `15` | Token lifetime in minutes |
| `OTP_TTL_HOURS` | `2` | OTP validity in hours |
| `SPREADSHEET_ID` | `1a2b3c4d...` | Google Sheets ID for user storage |
| `APP_TIMEZONE` | `Africa/Douala` | Timezone for timestamps |

**Generate Encryption Key**:
```bash
# On Mac/Linux
openssl rand -hex 32

# Or use online generator
# https://www.random.org/strings/
```

### Step 3: Create Users Sheet

In your Google Spreadsheet, create a sheet named `users` with columns:

```
email | password | salt | role | status | verificationToken | verificationTokenExpiry | passwordResetOTP | otpExpiry | createdAt | lastLoginAt
```

### Step 4: Create Main Entry Point

**`Main.gs`**:
```javascript
function doPost(e) {
  return ResponseHandler.handle(function() {
    // Step 1: Validate request and authenticate user
    const context = SecurityInterceptor.validateRequest(e);

    // Step 2: Route to appropriate handler
    const result = Router.route(context);

    // Step 3: Return result
    return result;
  });
}

function doGet(e) {
  return ResponseHandler.success({
    status: 200,
    msgKey: 'health.ok',
    message: 'API is running',
    data: {
      version: '1.0.0',
      timestamp: DateUtil.getCurrentTimestamp()
    }
  });
}
```

### Step 5: Register Handlers

Update `Router.gs` to include your custom handlers:

```javascript
getHandler: function(handlerName) {
  const handlers = {
    'auth': AuthHandler,
    'yourHandler': YourHandler,  // Add your handler here
    // ... other handlers
  };

  return handlers[handlerName] || null;
}
```

### Step 6: Define Route Security

Update `SecurityInterceptor.gs` to configure route access:

```javascript
// Public routes (no authentication)
publicRoutes: [
  'auth.signup',
  'auth.login',
  'yourHandler.publicMethod'  // Add public routes
],

// Admin-only routes
adminRoutes: [
  'metadata.create',
  'yourHandler.adminMethod'  // Add admin routes
]
```

### Step 7: Create Custom Handler

**`YourHandler.gs`**:
```javascript
const YourHandler = {
  /**
   * Public method example
   */
  publicMethod: function(context) {
    // No authentication required
    return {
      status: 200,
      msgKey: 'success',
      message: 'Public method executed',
      data: { result: 'data' }
    };
  },

  /**
   * Authenticated method example
   */
  authenticatedMethod: function(context) {
    // context.user is available (validated by SecurityInterceptor)
    const user = context.user;

    // Do something with user data
    const result = doSomething(context.data, user);

    // Return with token refresh
    const newToken = TokenManager.generateToken(user.email);

    return ResponseHandler.successWithToken(
      'operation.success',
      'Operation completed',
      result,
      user,
      newToken.value
    );
  },

  /**
   * Admin-only method example
   */
  adminMethod: function(context) {
    // User already validated as admin by SecurityInterceptor
    // (if added to adminRoutes)

    const result = doAdminOperation(context.data);

    const newToken = TokenManager.generateToken(context.user.email);

    return ResponseHandler.successWithToken(
      'admin.operation.success',
      'Admin operation completed',
      result,
      context.user,
      newToken.value
    );
  }
};
```

### Step 8: Deploy as Web App

1. Click **Deploy** > **New deployment**
2. Select type: **Web app**
3. Configuration:
   - Execute as: **Me**
   - Who has access: **Anyone** (or **Anyone, even anonymous**)
4. Click **Deploy**
5. Copy the Web App URL (ends with `/exec`)

---

## Vue.js + Quasar Frontend Integration

### Frontend Architecture

```
src/
  services/
    api.js              # Axios client, token management
  stores/
    authStore.js        # Pinia store for auth state
  composables/
    useAuth.js          # Auth operations composable
    useSessionMonitor.js # Session expiry monitoring
  components/
    auth/
      SessionExpirationDialog.vue  # Session warning dialog
  pages/
    auth/
      LoginPage.vue
      SignUpPage.vue
      VerifyTokenPage.vue
  router/
    index.js            # Route guards
```

### Step 1: Install Dependencies

```bash
npm install axios pinia vue-router
```

### Step 2: Create API Client

**`src/services/api.js`**:
```javascript
import axios from 'axios'

const API_URL = import.meta.env.VITE_GAS_API_URL

const axiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'text/plain;charset=utf-8',
  },
})

export const api = {
  async post(action, data = {}, token = null) {
    try {
      // Get token from localStorage if not provided
      if (!token) {
        token = localStorage.getItem('auth_token')
      }

      // Build request payload
      const payload = {
        action: action,
        data: data,
      }

      // Add token for secured endpoints
      if (token) {
        payload.token = token
      }

      // Make request
      const response = await axiosInstance.post('', payload)

      // Check response status
      if (response.data.status >= 400) {
        throw new ApiError(response.data.status, response.data.message, response.data.msgKey)
      }

      // Handle token refresh from response
      if (response.data.token && response.data.token.value) {
        localStorage.setItem('auth_token', response.data.token.value)
        localStorage.setItem('auth_expiry', response.data.token.ttl)

        // Dispatch event for session monitor
        window.dispatchEvent(new CustomEvent('token-refreshed', {
          detail: {
            ttl: response.data.token.ttl,
            value: response.data.token.value
          }
        }))
      }

      return response.data
    } catch (error) {
      // Handle errors
      if (error.response) {
        const data = error.response.data
        throw new ApiError(
          data.status || error.response.status,
          data.message || 'Server error',
          data.msgKey || 'error.server',
        )
      } else if (error.request) {
        throw new ApiError(
          0,
          'No response from server',
          'error.network',
        )
      } else if (error instanceof ApiError) {
        throw error
      } else {
        throw new ApiError(500, error.message, 'error.unknown')
      }
    }
  }
}

class ApiError extends Error {
  constructor(status, message, msgKey) {
    super(message)
    this.status = status
    this.msgKey = msgKey
  }
}

// Auth API methods
export const authApi = {
  signup: (email, password) => api.post('auth.signup', { email, password }),
  verifyEmail: (email, token) => api.post('auth.verifyEmail', { email, token }),
  resendVerification: (email) => api.post('auth.resendVerification', { email }),
  login: (email, password) => api.post('auth.login', { email, password }),
  ping: () => api.post('auth.ping', {}),
  requestPasswordReset: (email) => api.post('auth.requestPasswordReset', { email }),
  verifyOTP: (email, otp) => api.post('auth.verifyOTP', { email, otp }),
  resetPassword: (email, otp, newPassword) => api.post('auth.resetPassword', { email, otp, newPassword }),
}
```

### Step 3: Create Auth Store

**`src/stores/authStore.js`**:
```javascript
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authApi } from 'src/services/api'

export const useAuthStore = defineStore('auth', () => {
  // State
  const token = ref(localStorage.getItem('auth_token'))
  const tokenExpiry = ref(parseInt(localStorage.getItem('auth_expiry') || '0'))
  const user = ref(JSON.parse(localStorage.getItem('auth_user') || 'null'))

  // Getters
  const isAuthenticated = computed(() => {
    return !!token.value && tokenExpiry.value > Date.now()
  })

  const tokenTTL = computed(() => tokenExpiry.value)

  // Actions
  async function login(email, password) {
    const response = await authApi.login(email, password)

    if (response.token) {
      token.value = response.token.value
      tokenExpiry.value = response.token.ttl
      user.value = response.data

      localStorage.setItem('auth_token', response.token.value)
      localStorage.setItem('auth_expiry', response.token.ttl)
      localStorage.setItem('auth_user', JSON.stringify(response.data))
    }

    return response
  }

  async function signup(email, password) {
    return await authApi.signup(email, password)
  }

  async function verifyEmail(email, verificationToken) {
    const response = await authApi.verifyEmail(email, verificationToken)

    if (response.token) {
      token.value = response.token.value
      tokenExpiry.value = response.token.ttl
      user.value = response.data

      localStorage.setItem('auth_token', response.token.value)
      localStorage.setItem('auth_expiry', response.token.ttl)
      localStorage.setItem('auth_user', JSON.stringify(response.data))
    }

    return response
  }

  function logout() {
    token.value = null
    tokenExpiry.value = 0
    user.value = null

    localStorage.removeItem('auth_token')
    localStorage.removeItem('auth_expiry')
    localStorage.removeItem('auth_user')
  }

  function updateToken(tokenData) {
    token.value = tokenData.value
    tokenExpiry.value = tokenData.ttl

    localStorage.setItem('auth_token', tokenData.value)
    localStorage.setItem('auth_expiry', tokenData.ttl.toString())
  }

  return {
    // State
    token,
    tokenExpiry,
    user,

    // Getters
    isAuthenticated,
    tokenTTL,

    // Actions
    login,
    signup,
    verifyEmail,
    logout,
    updateToken
  }
})
```

### Step 4: Create Session Monitor

**`src/composables/useSessionMonitor.js`**:
```javascript
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useAuthStore } from 'src/stores/authStore'
import { useRouter } from 'vue-router'
import { api } from 'src/services/api'

const WARNING_THRESHOLD = 60 // seconds

export function useSessionMonitor() {
  const authStore = useAuthStore()
  const router = useRouter()

  const isWarningVisible = ref(false)
  const timeRemaining = ref(0)
  const isExtending = ref(false)

  let updateTimerId = null
  let warningTimerId = null
  let logoutTimerId = null

  function calculateTimeRemaining() {
    const ttl = authStore.tokenTTL
    if (!ttl) return 0

    const now = Date.now()
    const remaining = Math.max(0, Math.floor((ttl - now) / 1000))
    return remaining
  }

  function updateCountdown() {
    timeRemaining.value = calculateTimeRemaining()

    if (timeRemaining.value === 0 && authStore.isAuthenticated) {
      handleExpiration()
    }
  }

  function showWarning() {
    if (!authStore.isAuthenticated) return
    if (isWarningVisible.value) return

    isWarningVisible.value = true
  }

  function handleExpiration() {
    stopMonitoring()
    authStore.logout()
    router.push({ name: 'login', query: { expired: 'true' } })
  }

  async function extendSession() {
    if (isExtending.value) return

    isExtending.value = true

    try {
      await api.post('auth.ping', {})
      // Token automatically updated by api.js
      isWarningVisible.value = false

      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    } finally {
      isExtending.value = false
    }
  }

  function startMonitoring() {
    if (!authStore.isAuthenticated) return

    stopMonitoring()

    const remaining = calculateTimeRemaining()

    if (remaining <= 0) {
      handleExpiration()
      return
    }

    updateTimerId = setInterval(updateCountdown, 1000)

    const warningDelay = Math.max(0, (remaining - WARNING_THRESHOLD) * 1000)
    warningTimerId = setTimeout(showWarning, warningDelay)

    const logoutDelay = remaining * 1000
    logoutTimerId = setTimeout(handleExpiration, logoutDelay)

    updateCountdown()
  }

  function stopMonitoring(clearWarning = true) {
    if (updateTimerId) clearInterval(updateTimerId)
    if (warningTimerId) clearTimeout(warningTimerId)
    if (logoutTimerId) clearTimeout(logoutTimerId)

    if (clearWarning) {
      isWarningVisible.value = false
    }

    timeRemaining.value = 0
  }

  function handleTokenRefresh(event) {
    const newTTL = event.detail?.ttl
    const newToken = event.detail?.value

    if (!newTTL || !newToken) return

    authStore.updateToken({ value: newToken, ttl: newTTL })
    isWarningVisible.value = false
    stopMonitoring(false)
    startMonitoring()
  }

  onMounted(() => {
    window.addEventListener('token-refreshed', handleTokenRefresh)

    if (authStore.isAuthenticated) {
      startMonitoring()
    }
  })

  onUnmounted(() => {
    window.removeEventListener('token-refreshed', handleTokenRefresh)
    stopMonitoring()
  })

  const formattedTimeRemaining = computed(() => {
    const minutes = Math.floor(timeRemaining.value / 60)
    const seconds = timeRemaining.value % 60
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  })

  return {
    isWarningVisible,
    timeRemaining,
    formattedTimeRemaining,
    isExtending,
    extendSession,
    handleExpiration
  }
}
```

### Step 5: Create Route Guards

**`src/router/index.js`**:
```javascript
import { route } from 'quasar/wrappers'
import { createRouter, createMemoryHistory, createWebHistory, createWebHashHistory } from 'vue-router'
import routes from './routes'
import { useAuthStore } from 'src/stores/authStore'

export default route(function (/* { store, ssrContext } */) {
  const createHistory = process.env.SERVER
    ? createMemoryHistory
    : (process.env.VUE_ROUTER_MODE === 'history' ? createWebHistory : createWebHashHistory)

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,
    history: createHistory(process.env.VUE_ROUTER_BASE)
  })

  // Navigation guard
  Router.beforeEach((to, from, next) => {
    const authStore = useAuthStore()
    const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
    const requiresAdmin = to.matched.some(record => record.meta.requiresAdmin)

    if (requiresAuth && !authStore.isAuthenticated) {
      // Redirect to login
      next({ name: 'login', query: { redirect: to.fullPath } })
    } else if (requiresAdmin && authStore.user?.role !== 'ROLE_ADMIN') {
      // Redirect to home if not admin
      next({ name: 'home' })
    } else {
      next()
    }
  })

  return Router
})
```

### Step 6: Define Protected Routes

**`src/router/routes.js`**:
```javascript
const routes = [
  {
    path: '/auth',
    component: () => import('layouts/AuthLayout.vue'),
    children: [
      { path: 'login', name: 'login', component: () => import('pages/auth/LoginPage.vue') },
      { path: 'signup', name: 'signup', component: () => import('pages/auth/SignUpPage.vue') },
      { path: 'verify-token', name: 'verify-token', component: () => import('pages/auth/VerifyTokenPage.vue') },
    ]
  },
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      { path: '', name: 'home', component: () => import('pages/IndexPage.vue') },
      { path: 'profile', name: 'profile', component: () => import('pages/ProfilePage.vue') },
      {
        path: 'admin',
        name: 'admin',
        component: () => import('pages/AdminPage.vue'),
        meta: { requiresAdmin: true }
      },
    ]
  },
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue')
  }
]

export default routes
```

### Step 7: Add Session Monitor to Layout

**`src/layouts/MainLayout.vue`**:
```vue
<template>
  <q-layout view="hHh lpR fFf">
    <q-header elevated>
      <!-- Header content -->
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>

    <!-- Session Expiration Warning -->
    <SessionExpirationDialog
      v-model="isWarningVisible"
      :time-remaining="formattedTimeRemaining"
      :is-extending="isExtending"
      @extend="extendSession"
      @logout="handleExpiration"
    />
  </q-layout>
</template>

<script setup>
import { useSessionMonitor } from 'src/composables/useSessionMonitor'
import SessionExpirationDialog from 'src/components/auth/SessionExpirationDialog.vue'

const {
  isWarningVisible,
  formattedTimeRemaining,
  isExtending,
  extendSession,
  handleExpiration
} = useSessionMonitor()
</script>
```

---

## Implementation Guide

### Quick Start Checklist

**Backend (Google Apps Script)**:
- [ ] Copy all security files to GAS project
- [ ] Configure script properties (ENCRYPTION_KEY, TOKEN_TTL_MINUTES, etc.)
- [ ] Create `users` sheet with proper columns
- [ ] Create Main.gs entry point
- [ ] Deploy as Web App
- [ ] Test health endpoint (doGet)
- [ ] Test auth.signup endpoint

**Frontend (Vue.js + Quasar)**:
- [ ] Install dependencies (axios, pinia)
- [ ] Create api.js with token handling
- [ ] Create authStore.js for state management
- [ ] Create useSessionMonitor composable
- [ ] Add route guards to router
- [ ] Create login/signup pages
- [ ] Add session expiration dialog
- [ ] Configure .env with VITE_GAS_API_URL

### Testing Authentication Flow

**1. Test Signup**:
```bash
curl -X POST "https://script.google.com/macros/s/.../exec" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "auth.signup",
    "data": {
      "email": "test@example.com",
      "password": "Test123!@#"
    }
  }'
```

**2. Test Login**:
```bash
curl -X POST "https://script.google.com/macros/s/.../exec" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "auth.login",
    "data": {
      "email": "test@example.com",
      "password": "Test123!@#"
    }
  }'
```

**3. Test Authenticated Request**:
```bash
curl -X POST "https://script.google.com/macros/s/.../exec" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "auth.ping",
    "token": "YOUR_TOKEN_HERE",
    "data": {}
  }'
```

---

## Security Best Practices

### Backend Security

1. **Never Log Sensitive Data**
   - Don't log passwords, tokens, or user data
   - Sanitize logs before outputting

2. **Validate All Inputs**
   - Use `SecurityInterceptor.validateRequiredFields()`
   - Validate email format with `isValidEmail()`
   - Sanitize inputs with `sanitizeInput()`

3. **Use Constant-Time Comparisons**
   - Password validation uses constant-time hash comparison
   - OTP validation converts to strings before comparing

4. **Implement Rate Limiting**
   - Consider adding rate limiting for login attempts
   - Implement account lockout after failed attempts

5. **Rotate Encryption Keys**
   - Periodically update ENCRYPTION_KEY
   - Invalidates all existing tokens (planned maintenance)

6. **Use HTTPS Only**
   - GAS Web Apps automatically use HTTPS
   - Never expose deployment URL without /exec

7. **Audit Logging**
   - Log all authentication events
   - Log admin operations
   - Monitor failed login attempts

### Frontend Security

1. **Never Store Passwords**
   - Clear password fields after use
   - Don't store in state or localStorage

2. **Secure Token Storage**
   - Use localStorage (not cookies to avoid CSRF)
   - Clear on logout
   - Clear on session expiration

3. **Validate Server Responses**
   - Check HTTP status codes
   - Validate response structure
   - Handle errors gracefully

4. **Implement Session Monitoring**
   - Monitor token expiry client-side
   - Warn users before expiration
   - Auto-logout on expiry

5. **Use Environment Variables**
   - Never commit .env files
   - Use different URLs for dev/test/prod

6. **Implement CSRF Protection**
   - Use token-based authentication (immune to CSRF)
   - Validate origin if needed

7. **Multi-Tab Synchronization**
   - Use localStorage events
   - Synchronize logout across tabs
   - Synchronize token refresh

### Production Deployment

1. **Use Strong Encryption**
   - Replace XOR encryption with proper AES
   - Consider external cryptographic service
   - Use 256-bit keys minimum

2. **Enable Audit Logging**
   - Log all auth events to separate sheet
   - Include IP addresses if available
   - Monitor for suspicious activity

3. **Set Appropriate Token TTL**
   - Balance security vs. user experience
   - Default: 15 minutes (adjustable)
   - Consider refresh token pattern for longer sessions

4. **Implement Account Lockout**
   - Lock account after N failed login attempts
   - Require email verification to unlock
   - Notify user of lockout

5. **Monitor for Anomalies**
   - Unusual login times
   - Multiple failed attempts
   - Token reuse after logout

6. **Regular Security Reviews**
   - Review access logs monthly
   - Update dependencies
   - Patch known vulnerabilities

7. **Backup User Data**
   - Regular exports of users sheet
   - Encrypted backups
   - Disaster recovery plan

---

## Troubleshooting

### Common Issues

**Issue**: "Invalid token" error
- **Cause**: Token expired or encryption key changed
- **Solution**: Re-login to get new token

**Issue**: "User not verified" error
- **Cause**: Email not verified after signup
- **Solution**: Check email for verification token or resend

**Issue**: "Forbidden" error on admin route
- **Cause**: User doesn't have ROLE_ADMIN
- **Solution**: Update user role in users sheet manually

**Issue**: Session expires too quickly
- **Cause**: TOKEN_TTL_MINUTES too low
- **Solution**: Increase TOKEN_TTL_MINUTES in script properties

**Issue**: Token refresh not working
- **Cause**: Frontend not handling token-refreshed event
- **Solution**: Ensure api.js dispatches event and session monitor listens

---

## License

This security framework is provided as-is for reuse in Google Apps Script applications. Customize as needed for your use case.

---

**End of Documentation**
