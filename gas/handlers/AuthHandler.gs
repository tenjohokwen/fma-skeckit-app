/**
 * AuthHandler.gs
 *
 * Handles all authentication-related endpoints.
 * Implements User Stories 1 and 2 (Registration, Verification, Login, Password Recovery).
 *
 * All methods receive validated context from SecurityInterceptor via Router.
 */

const AuthHandler = {
  /**
   * T041: User signup (US1)
   * Creates a new user account with email verification
   *
   * @param {Object} context - Request context
   * @param {Object} context.data - { email, password }
   * @returns {Object} Response with user data and verification token info
   */
  signup: function(context) {
    const { email, password } = context.data;

    // Validate required fields
    SecurityInterceptor.validateRequiredFields(context.data, ['email', 'password']);

    // Validate email format
    if (!SecurityInterceptor.isValidEmail(email)) {
      throw ResponseHandler.validationError(
        'Invalid email format',
        'error.email.invalid'
      );
    }

    // Validate password strength
    const passwordValidation = PasswordUtil.validatePasswordStrength(password);
    if (!passwordValidation.isValid) {
      throw ResponseHandler.validationError(
        passwordValidation.errors.join('; '),
        'error.password.weak'
      );
    }

    // Create user (UserService handles duplicate check)
    const user = UserService.createUser({
      email: email,
      password: password,
      role: 'ROLE_USER' // Default role for new signups
    });

    // Send verification email
    try {
      EmailService.sendVerificationEmail(
        user.email,
        user.verificationToken
      );
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
      // Don't fail the signup if email fails - user can resend
    }

    return {
      status: 201,
      msgKey: 'auth.signup.success',
      message: 'User created successfully. Please check your email for verification.',
      data: {
        email: user.email,
        status: user.status
      }
    };
  },

  /**
   * T042: Email verification (US1)
   * Verifies user email with token
   *
   * @param {Object} context - Request context
   * @param {Object} context.data - { email, token }
   * @returns {Object} Response with updated user status
   */
  verifyEmail: function(context) {
    const { email, token } = context.data;

    SecurityInterceptor.validateRequiredFields(context.data, ['email', 'token']);

    const updatedUser = UserService.verifyEmail(email, token);

    // Generate authentication token so user can log in immediately
    const authToken = TokenManager.generateToken(updatedUser.email);

    return ResponseHandler.successWithToken(
      'auth.verify.success',
      'Email verified successfully. You can now log in.',
      {
        email: updatedUser.email,
        role: updatedUser.role,
        status: updatedUser.status
      },
      updatedUser,
      authToken.value
    );
  },

  /**
   * T043: Resend verification email (US1)
   * Generates new verification token and resends email
   *
   * @param {Object} context - Request context
   * @param {Object} context.data - { email }
   * @returns {Object} Response confirming email sent
   */
  resendVerification: function(context) {
    const { email } = context.data;

    SecurityInterceptor.validateRequiredFields(context.data, ['email']);

    const user = UserService.getUserByEmail(email);
    if (!user) {
      throw ResponseHandler.notFoundError(
        'User not found',
        'error.user.notFound'
      );
    }

    if (user.status === 'VERIFIED') {
      throw ResponseHandler.validationError(
        'User already verified',
        'error.user.alreadyVerified'
      );
    }

    // Generate new verification token
    const newToken = Utilities.getUuid();
    const newExpiry = DateUtil.addHours(new Date(), 24).getTime();

    UserService.updateUser(email, {
      verificationToken: newToken,
      verificationTokenExpiry: newExpiry
    });

    // Send new verification email
    try {
      EmailService.sendVerificationEmail(email, newToken);
    } catch (emailError) {
      console.error('Failed to resend verification email:', emailError);
      throw ResponseHandler.error({
        status: 500,
        msgKey: 'error.email.send',
        message: 'Failed to send verification email. Please try again later.'
      });
    }

    return {
      status: 200,
      msgKey: 'auth.resend.success',
      message: 'Verification email sent. Please check your inbox.',
      data: {}
    };
  },

  /**
   * T057: User login (US2)
   * Authenticates user and generates access token
   *
   * @param {Object} context - Request context
   * @param {Object} context.data - { email, password }
   * @returns {Object} Response with token and user data
   */
  login: function(context) {
    const { email, password } = context.data;

    SecurityInterceptor.validateRequiredFields(context.data, ['email', 'password']);

    const user = UserService.getUserByEmail(email);
    if (!user) {
      throw ResponseHandler.unauthorizedError(
        'Invalid email or password',
        'error.login.invalid'
      );
    }

    // Validate password
    if (!PasswordUtil.validatePassword(password, user.password, user.salt)) {
      throw ResponseHandler.unauthorizedError(
        'Invalid email or password',
        'error.login.invalid'
      );
    }

    // Check user status
    if (user.status !== 'VERIFIED') {
      throw ResponseHandler.unauthorizedError(
        'Email not verified. Please check your inbox for verification email.',
        'error.user.notVerified'
      );
    }

    // Generate authentication token
    const token = TokenManager.generateToken(user.email);

    // Update last login timestamp
    UserService.updateLastLogin(user.email);

    return ResponseHandler.successWithToken(
      'auth.login.success',
      'Login successful',
      {
        email: user.email,
        role: user.role,
        status: user.status
      },
      user,
      token.value
    );
  },

  /**
   * T058: Request password reset (US2)
   * Generates OTP and sends reset email
   *
   * @param {Object} context - Request context
   * @param {Object} context.data - { email }
   * @returns {Object} Response confirming OTP sent
   */
  requestPasswordReset: function(context) {
    const { email } = context.data;

    SecurityInterceptor.validateRequiredFields(context.data, ['email']);

    // Generate and store OTP
    const otp = UserService.generatePasswordResetOTP(email);

    // Send OTP email
    try {
      EmailService.sendPasswordResetOTP(email, otp);
    } catch (emailError) {
      console.error('Failed to send password reset email:', emailError);
      throw ResponseHandler.error({
        status: 500,
        msgKey: 'error.email.send',
        message: 'Failed to send password reset email. Please try again later.'
      });
    }

    return {
      status: 200,
      msgKey: 'auth.passwordReset.otpSent',
      message: 'Password reset OTP sent to your email. Valid for 2 hours.',
      data: {}
    };
  },

  /**
   * T059: Verify OTP (US2)
   * Validates OTP for password reset
   *
   * @param {Object} context - Request context
   * @param {Object} context.data - { email, otp }
   * @returns {Object} Response confirming OTP is valid
   */
  verifyOTP: function(context) {
    const { email, otp } = context.data;

    SecurityInterceptor.validateRequiredFields(context.data, ['email', 'otp']);

    // Verify OTP (throws error if invalid or expired)
    UserService.verifyPasswordResetOTP(email, otp);

    return {
      status: 200,
      msgKey: 'auth.otp.verified',
      message: 'OTP verified. You can now reset your password.',
      data: {
        email: email
      }
    };
  },

  /**
   * T060: Reset password (US2)
   * Resets user password with verified OTP
   *
   * @param {Object} context - Request context
   * @param {Object} context.data - { email, otp, newPassword }
   * @returns {Object} Response confirming password reset
   */
  resetPassword: function(context) {
    const { email, otp, newPassword } = context.data;

    SecurityInterceptor.validateRequiredFields(context.data, ['email', 'otp', 'newPassword']);

    // Validate new password strength
    const passwordValidation = PasswordUtil.validatePasswordStrength(newPassword);
    if (!passwordValidation.isValid) {
      throw ResponseHandler.validationError(
        passwordValidation.errors.join('; '),
        'error.password.weak'
      );
    }

    // Reset password (verifies OTP internally)
    UserService.resetPassword(email, otp, newPassword);

    return {
      status: 200,
      msgKey: 'auth.passwordReset.success',
      message: 'Password reset successfully. You can now log in with your new password.',
      data: {}
    };
  },

  /**
   * Ping endpoint to extend session
   * Simply validates token and returns new one with extended TTL
   * Used by frontend session monitor to extend user sessions
   *
   * @param {Object} context - Request context
   * @param {Object} context.user - Authenticated user (validated by SecurityInterceptor)
   * @returns {Object} Response with new token
   */
  ping: function(context) {
    // User is already authenticated by SecurityInterceptor
    // Just return success with new token to extend session

    const user = context.user;
    const newToken = TokenManager.generateToken(user.email);

    return ResponseHandler.successWithToken(
      'token.refresh.success',
      'Session extended',
      {
        email: user.email,
        role: user.role,
        status: user.status
      },
      user,
      newToken.value
    );
  }
};
