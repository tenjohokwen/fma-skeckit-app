/**
 * TokenManager.gs
 *
 * Manages JWT-like token generation and validation for authentication.
 * Tokens are encrypted and include username and expiry timestamp.
 *
 * Token Structure (before encryption):
 * {
 *   username: string,
 *   expiry: number (Unix timestamp in ms),
 *   issued: number (Unix timestamp in ms)
 * }
 */

const TokenManager = {
  /**
   * Gets the encryption key from script properties
   * @returns {string} Encryption key
   * @throws {Error} If encryption key is not configured
   */
  getEncryptionKey: function() {
    const props = PropertiesService.getScriptProperties();
    const key = props.getProperty('ENCRYPTION_KEY');

    if (!key) {
      throw ResponseHandler.error({
        status: 500,
        msgKey: 'error.config.missing',
        message: 'Encryption key not configured'
      });
    }

    return key;
  },

  /**
   * Generates a new authentication token for a user
   * @param {string} username - User email/username
   * @returns {Object} Token object with value, ttl, and username
   */
  generateToken: function(username) {
    const now = DateUtil.getCurrentUTC();
    const expiry = DateUtil.createTokenExpiry();

    const tokenData = {
      username: username,
      expiry: expiry,
      issued: now
    };

    const tokenString = JSON.stringify(tokenData);
    const encryptedToken = this.encrypt(tokenString);

    return {
      value: encryptedToken,
      ttl: expiry,
      username: username
    };
  },

  /**
   * Validates a token and returns the decoded data
   * @param {string} token - Encrypted token string
   * @returns {Object} Decoded token data with username and expiry
   * @throws {Error} If token is invalid or expired
   */
  validateToken: function(token) {
    if (!token) {
      throw ResponseHandler.unauthorizedError('No token provided', 'error.token.missing');
    }

    let tokenData;
    try {
      const decryptedToken = this.decrypt(token);
      tokenData = JSON.parse(decryptedToken);
    } catch (error) {
      console.error('Token decryption failed:', error);
      throw ResponseHandler.unauthorizedError('Invalid token', 'error.token.invalid');
    }

    // Check if token has expired
    if (DateUtil.isExpired(tokenData.expiry)) {
      throw ResponseHandler.unauthorizedError('Token expired', 'error.token.expired');
    }

    return tokenData;
  },

  /**
   * Encrypts a string using AES encryption
   * @param {string} text - Text to encrypt
   * @returns {string} Base64-encoded encrypted text
   */
  encrypt: function(text) {
    const key = this.getEncryptionKey();

    // Simple XOR-based encryption (Apps Script doesn't have native AES)
    // For production, consider using a library or external service
    const encryptedBytes = [];
    const textBytes = Utilities.newBlob(text).getBytes();
    const keyBytes = Utilities.newBlob(key).getBytes();

    for (let i = 0; i < textBytes.length; i++) {
      const keyByte = keyBytes[i % keyBytes.length];
      encryptedBytes.push(textBytes[i] ^ keyByte);
    }

    return Utilities.base64Encode(String.fromCharCode.apply(null, encryptedBytes));
  },

  /**
   * Decrypts an encrypted string
   * @param {string} encryptedText - Base64-encoded encrypted text
   * @returns {string} Decrypted text
   */
  decrypt: function(encryptedText) {
    const key = this.getEncryptionKey();

    const encryptedBytes = Utilities.base64Decode(encryptedText);
    const keyBytes = Utilities.newBlob(key).getBytes();
    const decryptedBytes = [];

    for (let i = 0; i < encryptedBytes.length; i++) {
      const keyByte = keyBytes[i % keyBytes.length];
      decryptedBytes.push(encryptedBytes[i] ^ keyByte);
    }

    return Utilities.newBlob(decryptedBytes).getDataAsString();
  },

  /**
   * Refreshes a token (generates a new one with updated expiry)
   * @param {string} token - Current valid token
   * @returns {Object} New token object
   */
  refreshToken: function(token) {
    const tokenData = this.validateToken(token);
    return this.generateToken(tokenData.username);
  },

  /**
   * Extracts username from a token without full validation
   * Useful for logging and auditing
   * @param {string} token - Token to extract from
   * @returns {string|null} Username or null if extraction fails
   */
  extractUsername: function(token) {
    try {
      const decryptedToken = this.decrypt(token);
      const tokenData = JSON.parse(decryptedToken);
      return tokenData.username || null;
    } catch (error) {
      console.warn('Failed to extract username from token:', error);
      return null;
    }
  }
};
