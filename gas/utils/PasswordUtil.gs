/**
 * PasswordUtil.gs
 *
 * Provides secure password hashing and validation utilities.
 * Uses PBKDF2 with SHA-256 for password hashing.
 *
 * Per constitution: Never store plain text passwords, always hash with salt.
 */

const PasswordUtil = {
  /**
   * Generates a random salt for password hashing
   * @returns {string} Base64-encoded salt
   */
  generateSalt: function() {
    const bytes = [];
    for (let i = 0; i < 16; i++) {
      bytes.push(Math.floor(Math.random() * 256));
    }
    return Utilities.base64Encode(String.fromCharCode.apply(null, bytes));
  },

  /**
   * Hashes a password with the provided salt using PBKDF2
   * @param {string} password - Plain text password
   * @param {string} salt - Base64-encoded salt
   * @returns {string} Base64-encoded hashed password
   */
  hashPassword: function(password, salt) {
    // Combine password and salt
    const saltBytes = Utilities.base64Decode(salt);
    const passwordBytes = Utilities.newBlob(password).getBytes();

    // Use SHA-256 to hash the password with salt
    // Note: Apps Script doesn't have native PBKDF2, so we use iterative SHA-256
    let hash = passwordBytes;
    for (let i = 0; i < 1000; i++) {
      const combined = hash.concat(saltBytes);
      hash = Utilities.computeDigest(
        Utilities.DigestAlgorithm.SHA_256,
        combined
      );
    }

    return Utilities.base64Encode(String.fromCharCode.apply(null, hash));
  },

  /**
   * Validates a password against a stored hash
   * @param {string} password - Plain text password to validate
   * @param {string} storedHash - Stored hashed password
   * @param {string} salt - Salt used for the stored hash
   * @returns {boolean} True if password matches
   */
  validatePassword: function(password, storedHash, salt) {
    const computedHash = this.hashPassword(password, salt);
    return computedHash === storedHash;
  },

  /**
   * Validates password strength
   * @param {string} password - Password to validate
   * @returns {Object} { isValid: boolean, errors: string[] }
   */
  validatePasswordStrength: function(password) {
    const errors = [];

    if (!password || password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }

    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }

    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }

    if (!/[0-9]/.test(password)) {
      errors.push('Password must contain at least one number');
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }

    return {
      isValid: errors.length === 0,
      errors: errors
    };
  },

  /**
   * Generates a random 6-digit OTP code
   * @returns {string} 6-digit OTP code
   */
  generateOTP: function() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }
};
