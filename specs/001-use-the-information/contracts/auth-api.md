# Authentication API Contract

**Version**: 1.0.0
**Base URL**: `{GAS_WEB_APP_URL}`
**Protocol**: HTTPS POST
**Content-Type**: application/json

## Overview

Authentication endpoints for user registration, login, email verification, and password recovery.

## Standard Response Format

All endpoints return JSON in this format:

```json
{
  "status": 200,
  "msgKey": "i18nKey",
  "message": "Human-readable message in English",
  "data": { ... },
  "token": {
    "value": "base64EncodedToken",
    "ttl": 1697234567890,
    "username": "user@example.com"
  }
}
```

**Response Fields**:
- `status`: HTTP status code (200, 400, 401, 403, 500)
- `msgKey`: i18n key for frontend translation
- `message`: English fallback message
- `data`: Endpoint-specific response data (null on error)
- `token`: Authentication token (null for public endpoints or on error)

---

## Endpoints

### 1. Sign Up

**Action**: `signup`

**Description**: Register a new user account with email verification workflow.

**Request**:
```json
{
  "action": "signup",
  "data": {
    "name": "John Doe",
    "email": "john@example.com",
    "password": "SecurePass123",
    "language": "en"
  }
}
```

**Request Fields**:
- `name` (string, required): User's full name (1-100 chars)
- `email` (string, required): Valid email address
- `password` (string, required): Minimum 8 characters
- `language` (string, optional): "en" or "fr", default "en"

**Success Response** (200):
```json
{
  "status": 200,
  "msgKey": "auth.signup.success",
  "message": "Account created successfully. Please check your email for verification link.",
  "data": {
    "email": "john@example.com",
    "status": "PENDING"
  },
  "token": null
}
```

**Error Responses**:

Duplicate Email (400):
```json
{
  "status": 400,
  "msgKey": "auth.signup.error.duplicate",
  "message": "This email is already registered",
  "data": null,
  "token": null
}
```

Invalid Input (400):
```json
{
  "status": 400,
  "msgKey": "auth.signup.error.invalid",
  "message": "Invalid email format or password too short",
  "data": null,
  "token": null
}
```

**Side Effects**:
- Creates User record with status=PENDING, type=ALLOWED, role=ROLE_USER
- Generates verification token
- Sends verification email

---

### 2. Verify Email

**Action**: `verifyEmail`

**Description**: Verify user email address using token from verification email.

**Request**:
```json
{
  "action": "verifyEmail",
  "data": {
    "token": "verification-token-from-email"
  }
}
```

**Request Fields**:
- `token` (string, required): Verification token from email link

**Success Response** (200):
```json
{
  "status": 200,
  "msgKey": "auth.verify.success",
  "message": "Email verified successfully. You can now log in.",
  "data": {
    "email": "john@example.com",
    "status": "VERIFIED"
  },
  "token": null
}
```

**Error Responses**:

Invalid Token (400):
```json
{
  "status": 400,
  "msgKey": "auth.verify.error.invalid",
  "message": "Invalid or expired verification token",
  "data": null,
  "token": null
}
```

**Side Effects**:
- Updates User.status from PENDING to VERIFIED
- Clears verification token

---

### 3. Resend Verification Email

**Action**: `resendVerification`

**Description**: Resend verification email for pending account.

**Request**:
```json
{
  "action": "resendVerification",
  "data": {
    "email": "john@example.com",
    "language": "en"
  }
}
```

**Request Fields**:
- `email` (string, required): User's email address
- `language` (string, optional): "en" or "fr", default "en"

**Success Response** (200):
```json
{
  "status": 200,
  "msgKey": "auth.resend.success",
  "message": "Verification email sent. Please check your inbox.",
  "data": null,
  "token": null
}
```

**Error Responses**:

Already Verified (400):
```json
{
  "status": 400,
  "msgKey": "auth.resend.error.verified",
  "message": "This account is already verified",
  "data": null,
  "token": null
}
```

**Side Effects**:
- Generates new verification token
- Sends verification email

---

### 4. Login

**Action**: `login`

**Description**: Authenticate user and receive session token.

**Request**:
```json
{
  "action": "login",
  "data": {
    "email": "john@example.com",
    "password": "SecurePass123"
  }
}
```

**Request Fields**:
- `email` (string, required): User's email address
- `password` (string, required): User's password

**Success Response** (200):
```json
{
  "status": 200,
  "msgKey": "auth.login.success",
  "message": "Login successful",
  "data": {
    "user": {
      "name": "John Doe",
      "email": "john@example.com",
      "role": "ROLE_USER"
    }
  },
  "token": {
    "value": "base64EncodedSessionToken",
    "ttl": 1697234567890,
    "username": "john@example.com"
  }
}
```

**Error Responses**:

Invalid Credentials (401):
```json
{
  "status": 401,
  "msgKey": "auth.login.error.invalid",
  "message": "Invalid email or password",
  "data": null,
  "token": null
}
```

Unverified Account (403):
```json
{
  "status": 403,
  "msgKey": "auth.login.error.unverified",
  "message": "Please verify your email before logging in",
  "data": null,
  "token": null
}
```

Blocked Account (403):
```json
{
  "status": 403,
  "msgKey": "auth.login.error.blocked",
  "message": "Your account has been blocked. Please contact support.",
  "data": null,
  "token": null
}
```

**Side Effects**:
- Generates session token (15-minute TTL)

---

### 5. Request Password Reset (Generate OTP)

**Action**: `requestPasswordReset`

**Description**: Request password reset via OTP sent to email.

**Request**:
```json
{
  "action": "requestPasswordReset",
  "data": {
    "email": "john@example.com",
    "language": "en"
  }
}
```

**Request Fields**:
- `email` (string, required): User's email address
- `language` (string, optional): "en" or "fr", default "en"

**Success Response** (200):
```json
{
  "status": 200,
  "msgKey": "auth.password.reset.sent",
  "message": "If the email exists in our system, a recovery code has been sent.",
  "data": null,
  "token": null
}
```

**Note**: Response is identical whether email exists or not (security measure to prevent email enumeration).

**Side Effects** (if email exists):
- Generates 6-digit OTP
- Sets OTP expiry to current time + 2 hours
- Sends OTP email with recovery link

**Side Effects** (if email doesn't exist):
- Sends informational email about registration attempt

---

### 6. Verify OTP

**Action**: `verifyOTP`

**Description**: Verify OTP for password reset flow.

**Request**:
```json
{
  "action": "verifyOTP",
  "data": {
    "email": "john@example.com",
    "otp": "123456"
  }
}
```

**Request Fields**:
- `email` (string, required): User's email address
- `otp` (string, required): 6-digit OTP from email

**Success Response** (200):
```json
{
  "status": 200,
  "msgKey": "auth.otp.valid",
  "message": "OTP verified. You can now reset your password.",
  "data": {
    "resetToken": "temporary-reset-token-for-password-change"
  },
  "token": null
}
```

**Error Responses**:

Invalid OTP (400):
```json
{
  "status": 400,
  "msgKey": "auth.otp.error.invalid",
  "message": "Invalid or expired OTP",
  "data": null,
  "token": null
}
```

**Side Effects**:
- Generates temporary reset token (valid for 15 minutes)

---

### 7. Reset Password

**Action**: `resetPassword`

**Description**: Set new password after OTP verification.

**Request**:
```json
{
  "action": "resetPassword",
  "data": {
    "resetToken": "temporary-reset-token-from-verify-otp",
    "newPassword": "NewSecurePass456",
    "confirmPassword": "NewSecurePass456"
  }
}
```

**Request Fields**:
- `resetToken` (string, required): Token from verifyOTP response
- `newPassword` (string, required): New password (minimum 8 characters)
- `confirmPassword` (string, required): Must match newPassword

**Success Response** (200):
```json
{
  "status": 200,
  "msgKey": "auth.password.reset.success",
  "message": "Password reset successful. You can now log in with your new password.",
  "data": null,
  "token": null
}
```

**Error Responses**:

Password Mismatch (400):
```json
{
  "status": 400,
  "msgKey": "auth.password.reset.error.mismatch",
  "message": "Passwords do not match",
  "data": null,
  "token": null
}
```

Invalid Token (400):
```json
{
  "status": 400,
  "msgKey": "auth.password.reset.error.token",
  "message": "Invalid or expired reset token",
  "data": null,
  "token": null
}
```

**Side Effects**:
- Generates new salt
- Hashes new password with new salt
- Updates User.password and User.salt
- Clears User.otp and User.dateOfExpiry
- Invalidates reset token
- Sends password reset confirmation email

---

## Security Considerations

1. **Password Storage**: Passwords are hashed using SHA-256 with unique per-user salt
2. **Token Expiry**: Session tokens expire after 15 minutes, OTP after 2 hours
3. **Email Enumeration Prevention**: Password reset always returns success message
4. **Rate Limiting**: Implement on frontend and backend to prevent brute force
5. **HTTPS Required**: All authentication requests must use HTTPS

## Error Codes Summary

| Status | MsgKey Prefix | Description |
|--------|---------------|-------------|
| 200 | auth.*.success | Successful operation |
| 400 | auth.*.error.* | Bad request (validation, duplicates) |
| 401 | auth.login.error.invalid | Authentication failed |
| 403 | auth.login.error.* | Forbidden (unverified, blocked) |
| 500 | error.generic | Server error |

## Testing Checklist

- [ ] Sign up with valid credentials
- [ ] Sign up with duplicate email
- [ ] Sign up with invalid email/short password
- [ ] Verify email with valid token
- [ ] Verify email with invalid token
- [ ] Resend verification for pending account
- [ ] Resend verification for verified account
- [ ] Login with valid credentials
- [ ] Login with invalid password
- [ ] Login with unverified account
- [ ] Login with blocked account
- [ ] Request password reset for existing email
- [ ] Request password reset for non-existent email
- [ ] Verify OTP with valid code
- [ ] Verify OTP with expired code
- [ ] Reset password with matching passwords
- [ ] Reset password with mismatched passwords
- [ ] Reset password with expired reset token
