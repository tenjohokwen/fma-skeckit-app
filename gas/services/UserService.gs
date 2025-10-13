/**
 * UserService.gs
 *
 * Provides database operations for user management.
 * Interacts with the 'users' sheet in Google Sheets.
 *
 * Schema:
 * A: email, B: password, C: salt, D: role, E: status,
 * F: verificationToken, G: verificationTokenExpiry,
 * H: passwordResetOTP, I: otpExpiry,
 * J: createdAt, K: lastLoginAt
 */

const UserService = {
  /**
   * Gets the users sheet
   * @returns {GoogleAppsScript.Spreadsheet.Sheet} Users sheet
   */
  getUsersSheet: function() {
    const props = PropertiesService.getScriptProperties();
    const spreadsheetId = props.getProperty('SPREADSHEET_ID');
    const ss = SpreadsheetApp.openById(spreadsheetId);
    return ss.getSheetByName('users');
  },

  /**
   * Creates a new user
   * @param {Object} userData - User data object
   * @param {string} userData.email - User email
   * @param {string} userData.password - Plain text password
   * @param {string} userData.role - User role (ROLE_ADMIN or ROLE_USER)
   * @returns {Object} Created user object (without password)
   */
  createUser: function(userData) {
    const sheet = this.getUsersSheet();

    // Check if user already exists
    const existingUser = this.getUserByEmail(userData.email);
    if (existingUser) {
      throw ResponseHandler.conflictError(
        'User with this email already exists',
        'error.user.alreadyExists'
      );
    }

    // Generate salt and hash password
    const salt = PasswordUtil.generateSalt();
    const hashedPassword = PasswordUtil.hashPassword(userData.password, salt);

    // Generate verification token
    const verificationToken = Utilities.getUuid();
    const verificationTokenExpiry = DateUtil.addHours(new Date(), 24).getTime();

    // Create user row
    const now = DateUtil.getCurrentTimestamp();
    const row = [
      userData.email,                    // A: email
      hashedPassword,                    // B: password
      salt,                              // C: salt
      userData.role || 'ROLE_USER',      // D: role
      'PENDING',                         // E: status
      verificationToken,                 // F: verificationToken
      verificationTokenExpiry,           // G: verificationTokenExpiry
      '',                                // H: passwordResetOTP
      '',                                // I: otpExpiry
      now,                               // J: createdAt
      ''                                 // K: lastLoginAt
    ];

    sheet.appendRow(row);

    return {
      email: userData.email,
      role: userData.role || 'ROLE_USER',
      status: 'PENDING',
      verificationToken: verificationToken,
      createdAt: now
    };
  },

  /**
   * Gets a user by email
   * @param {string} email - User email
   * @returns {Object|null} User object or null if not found
   */
  getUserByEmail: function(email) {
    const sheet = this.getUsersSheet();
    const data = sheet.getDataRange().getValues();

    // Skip header row
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === email) {
        return {
          email: data[i][0],
          password: data[i][1],
          salt: data[i][2],
          role: data[i][3],
          status: data[i][4],
          verificationToken: data[i][5],
          verificationTokenExpiry: data[i][6],
          passwordResetOTP: data[i][7],
          otpExpiry: data[i][8],
          createdAt: data[i][9],
          lastLoginAt: data[i][10],
          rowIndex: i + 1 // Store row index for updates
        };
      }
    }

    return null;
  },

  /**
   * Updates a user's data
   * @param {string} email - User email
   * @param {Object} updates - Fields to update
   * @returns {Object} Updated user object (without password)
   */
  updateUser: function(email, updates) {
    const user = this.getUserByEmail(email);
    if (!user) {
      throw ResponseHandler.notFoundError(
        'User not found',
        'error.user.notFound'
      );
    }

    const sheet = this.getUsersSheet();
    const row = user.rowIndex;

    // Update allowed fields
    if (updates.password !== undefined) {
      const newSalt = PasswordUtil.generateSalt();
      const newHash = PasswordUtil.hashPassword(updates.password, newSalt);
      sheet.getRange(row, 2).setValue(newHash); // B: password
      sheet.getRange(row, 3).setValue(newSalt); // C: salt
    }
    if (updates.role !== undefined) {
      sheet.getRange(row, 4).setValue(updates.role); // D: role
    }
    if (updates.status !== undefined) {
      sheet.getRange(row, 5).setValue(updates.status); // E: status
    }
    if (updates.verificationToken !== undefined) {
      sheet.getRange(row, 6).setValue(updates.verificationToken); // F: verificationToken
    }
    if (updates.verificationTokenExpiry !== undefined) {
      sheet.getRange(row, 7).setValue(updates.verificationTokenExpiry); // G: verificationTokenExpiry
    }
    if (updates.passwordResetOTP !== undefined) {
      sheet.getRange(row, 8).setValue(updates.passwordResetOTP); // H: passwordResetOTP
    }
    if (updates.otpExpiry !== undefined) {
      sheet.getRange(row, 9).setValue(updates.otpExpiry); // I: otpExpiry
    }
    if (updates.lastLoginAt !== undefined) {
      sheet.getRange(row, 11).setValue(updates.lastLoginAt); // K: lastLoginAt
    }

    // Return updated user (fetch fresh data)
    const updatedUser = this.getUserByEmail(email);
    delete updatedUser.password;
    delete updatedUser.salt;
    delete updatedUser.passwordResetOTP;
    return updatedUser;
  },

  /**
   * Verifies a user's email
   * @param {string} email - User email
   * @param {string} token - Verification token
   * @returns {Object} Updated user object
   */
  verifyEmail: function(email, token) {
    const user = this.getUserByEmail(email);
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

    if (user.verificationToken !== token) {
      throw ResponseHandler.validationError(
        'Invalid verification token',
        'error.verification.invalidToken'
      );
    }

    if (DateUtil.isExpired(user.verificationTokenExpiry)) {
      throw ResponseHandler.validationError(
        'Verification token expired',
        'error.verification.tokenExpired'
      );
    }

    return this.updateUser(email, {
      status: 'VERIFIED',
      verificationToken: '',
      verificationTokenExpiry: ''
    });
  },

  /**
   * Updates last login timestamp
   * @param {string} email - User email
   */
  updateLastLogin: function(email) {
    this.updateUser(email, {
      lastLoginAt: DateUtil.getCurrentTimestamp()
    });
  },

  /**
   * Generates and stores password reset OTP
   * @param {string} email - User email
   * @returns {string} Generated OTP
   */
  generatePasswordResetOTP: function(email) {
    const user = this.getUserByEmail(email);
    if (!user) {
      throw ResponseHandler.notFoundError(
        'User not found',
        'error.user.notFound'
      );
    }

    const otp = PasswordUtil.generateOTP();
    const otpExpiry = DateUtil.createOTPExpiry();

    this.updateUser(email, {
      passwordResetOTP: otp,
      otpExpiry: otpExpiry
    });

    return otp;
  },

  /**
   * Verifies password reset OTP
   * @param {string} email - User email
   * @param {string} otp - OTP to verify
   * @returns {boolean} True if OTP is valid
   */
  verifyPasswordResetOTP: function(email, otp) {
    const user = this.getUserByEmail(email);
    if (!user) {
      throw ResponseHandler.notFoundError(
        'User not found',
        'error.user.notFound'
      );
    }

    if (!user.passwordResetOTP || user.passwordResetOTP !== otp) {
      throw ResponseHandler.validationError(
        'Invalid OTP',
        'error.otp.invalid'
      );
    }

    if (DateUtil.isExpired(user.otpExpiry)) {
      throw ResponseHandler.validationError(
        'OTP expired',
        'error.otp.expired'
      );
    }

    return true;
  },

  /**
   * Resets user password with verified OTP
   * @param {string} email - User email
   * @param {string} otp - Verified OTP
   * @param {string} newPassword - New password
   * @returns {Object} Updated user object
   */
  resetPassword: function(email, otp, newPassword) {
    // Verify OTP first
    this.verifyPasswordResetOTP(email, otp);

    // Update password and clear OTP
    return this.updateUser(email, {
      password: newPassword,
      passwordResetOTP: '',
      otpExpiry: ''
    });
  }
};
