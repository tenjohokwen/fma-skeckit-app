/**
 * DateUtil.gs
 *
 * Provides date formatting and timezone utilities.
 * All timestamps use Africa/Douala timezone per constitution.
 */

const DateUtil = {
  /**
   * Gets the application timezone from script properties
   * @returns {string} Timezone string (default: 'Africa/Douala')
   */
  getTimezone: function() {
    const props = PropertiesService.getScriptProperties();
    return props.getProperty('APP_TIMEZONE') || 'Africa/Douala';
  },

  /**
   * Gets the current timestamp in Africa/Douala timezone
   * @returns {string} ISO 8601 formatted timestamp
   */
  getCurrentTimestamp: function() {
    const now = new Date();
    return Utilities.formatDate(now, this.getTimezone(), "yyyy-MM-dd'T'HH:mm:ss");
  },

  /**
   * Gets the current UTC timestamp
   * Used for token expiry calculations
   * @returns {number} Unix timestamp in milliseconds
   */
  getCurrentUTC: function() {
    return new Date().getTime();
  },

  /**
   * Formats a date object to Africa/Douala timezone
   * @param {Date} date - Date object to format
   * @param {string} format - Optional format string (default: "yyyy-MM-dd'T'HH:mm:ss")
   * @returns {string} Formatted date string
   */
  formatDate: function(date, format = "yyyy-MM-dd'T'HH:mm:ss") {
    return Utilities.formatDate(date, this.getTimezone(), format);
  },

  /**
   * Adds minutes to a date
   * @param {Date} date - Starting date
   * @param {number} minutes - Minutes to add
   * @returns {Date} New date object
   */
  addMinutes: function(date, minutes) {
    return new Date(date.getTime() + minutes * 60000);
  },

  /**
   * Adds hours to a date
   * @param {Date} date - Starting date
   * @param {number} hours - Hours to add
   * @returns {Date} New date object
   */
  addHours: function(date, hours) {
    return new Date(date.getTime() + hours * 3600000);
  },

  /**
   * Checks if a timestamp has expired
   * @param {number} expiryTimestamp - Unix timestamp in milliseconds
   * @returns {boolean} True if expired
   */
  isExpired: function(expiryTimestamp) {
    return this.getCurrentUTC() > expiryTimestamp;
  },

  /**
   * Creates a token expiry timestamp
   * @returns {number} Unix timestamp for token expiry (current time + TTL)
   */
  createTokenExpiry: function() {
    const props = PropertiesService.getScriptProperties();
    const ttlMinutes = parseInt(props.getProperty('TOKEN_TTL_MINUTES')) || 15;
    const now = new Date();
    return this.addMinutes(now, ttlMinutes).getTime();
  },

  /**
   * Creates an OTP expiry timestamp
   * @returns {number} Unix timestamp for OTP expiry (current time + TTL)
   */
  createOTPExpiry: function() {
    const props = PropertiesService.getScriptProperties();
    const ttlHours = parseInt(props.getProperty('OTP_TTL_HOURS')) || 2;
    const now = new Date();
    return this.addHours(now, ttlHours).getTime();
  },

  /**
   * Parses an ISO timestamp string to Date object
   * @param {string} timestamp - ISO 8601 timestamp string
   * @returns {Date} Date object
   */
  parseTimestamp: function(timestamp) {
    return new Date(timestamp);
  },

  /**
   * Gets a human-readable time difference
   * @param {Date} date - Date to compare
   * @returns {string} Human-readable difference (e.g., "2 hours ago")
   */
  getTimeAgo: function(date) {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / 60000);

    if (diffMinutes < 1) {
      return 'just now';
    } else if (diffMinutes < 60) {
      return diffMinutes + ' minute' + (diffMinutes > 1 ? 's' : '') + ' ago';
    } else {
      const diffHours = Math.floor(diffMinutes / 60);
      if (diffHours < 24) {
        return diffHours + ' hour' + (diffHours > 1 ? 's' : '') + ' ago';
      } else {
        const diffDays = Math.floor(diffHours / 24);
        return diffDays + ' day' + (diffDays > 1 ? 's' : '') + ' ago';
      }
    }
  }
};
