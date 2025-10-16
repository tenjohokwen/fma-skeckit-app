/**
 * ResponseHandler.gs
 *
 * Provides standardized HTTP response formatting for all API endpoints.
 * Ensures consistent response structure across the application.
 *
 * Response Format:
 * {
 *   status: number,        // HTTP status code
 *   msgKey: string,        // i18n message key
 *   message: string,       // English message
 *   data: object,          // Response payload
 *   token: {               // Optional auth token
 *     value: string,
 *     ttl: number,
 *     username: string
 *   }
 * }
 */

const ResponseHandler = {
  /**
   * Wraps execution in try-catch and returns standardized response
   * @param {Function} fn - Function to execute
   * @returns {GoogleAppsScript.Content.TextOutput} JSON response
   */
  handle: function(fn) {
    try {
      const result = fn();
      return this.success(result);
    } catch (error) {
      console.error('Error in ResponseHandler:', error);
      return this.error(error);
    }
  },

  /**
   * Creates success response
   * Supports two call patterns:
   * 1. success(result) - where result = { status, msgKey, message, data, token }
   * 2. success(data, msgKey, message) - shorthand where data is wrapped automatically
   *
   * @param {Object} result - Result object OR data payload
   * @param {string} msgKey - Optional message key (for shorthand pattern)
   * @param {string} message - Optional message (for shorthand pattern)
   * @returns {GoogleAppsScript.Content.TextOutput} JSON response
   */
  success: function(result, msgKey, message) {
    let response;

    // Check if this is shorthand pattern: success(data, msgKey, message)
    if (msgKey || (!result.status && !result.msgKey && !result.message && !result.data)) {
      // Shorthand pattern - wrap data
      response = {
        status: 200,
        msgKey: msgKey || 'success',
        message: message || 'Operation completed successfully',
        data: result || {}
      };
    } else {
      // Full pattern - result already has proper structure
      response = {
        status: result.status || 200,
        msgKey: result.msgKey || 'success',
        message: result.message || 'Operation completed successfully',
        data: result.data || {}
      };

      // Include token if provided
      if (result.token) {
        response.token = result.token;
      }
    }

    return ContentService
      .createTextOutput(JSON.stringify(response))
      .setMimeType(ContentService.MimeType.JSON);
  },

  /**
   * Creates error response
   * @param {Error|Object} error - Error object or error details
   * @returns {GoogleAppsScript.Content.TextOutput} JSON response
   */
  error: function(error) {
    let status = 500;
    let msgKey = 'error.internal';
    let message = 'Internal server error';

    // Handle custom error objects
    if (error.status) {
      status = error.status;
    }
    if (error.msgKey) {
      msgKey = error.msgKey;
    }
    if (error.message) {
      message = error.message;
    }

    // Handle standard Error objects
    if (error instanceof Error && !error.status) {
      message = error.message;
      console.error('Unhandled error:', error.stack);
    }

    const response = {
      status: status,
      msgKey: msgKey,
      message: message,
      data: {}
    };

    return ContentService
      .createTextOutput(JSON.stringify(response))
      .setMimeType(ContentService.MimeType.JSON);
  },

  /**
   * Creates validation error response
   * @param {string} message - Validation error message
   * @param {string} msgKey - i18n message key
   * @returns {Object} Error object to throw
   */
  validationError: function(message, msgKey = 'error.validation') {
    return {
      status: 400,
      msgKey: msgKey,
      message: message
    };
  },

  /**
   * Creates unauthorized error response
   * @param {string} message - Unauthorized message
   * @param {string} msgKey - i18n message key
   * @returns {Object} Error object to throw
   */
  unauthorizedError: function(message = 'Unauthorized', msgKey = 'error.unauthorized') {
    return {
      status: 401,
      msgKey: msgKey,
      message: message
    };
  },

  /**
   * Creates forbidden error response
   * @param {string} message - Forbidden message
   * @param {string} msgKey - i18n message key
   * @returns {Object} Error object to throw
   */
  forbiddenError: function(message = 'Forbidden', msgKey = 'error.forbidden') {
    return {
      status: 403,
      msgKey: msgKey,
      message: message
    };
  },

  /**
   * Creates not found error response
   * @param {string} message - Not found message
   * @param {string} msgKey - i18n message key
   * @returns {Object} Error object to throw
   */
  notFoundError: function(message = 'Resource not found', msgKey = 'error.notFound') {
    return {
      status: 404,
      msgKey: msgKey,
      message: message
    };
  },

  /**
   * Creates conflict error response
   * @param {string} message - Conflict message
   * @param {string} msgKey - i18n message key
   * @returns {Object} Error object to throw
   */
  conflictError: function(message = 'Resource already exists', msgKey = 'error.conflict') {
    return {
      status: 409,
      msgKey: msgKey,
      message: message
    };
  },

  /**
   * Creates server error response
   * @param {string} message - Server error message
   * @param {string} msgKey - i18n message key
   * @returns {Object} Error object to throw
   */
  serverError: function(message = 'Internal server error', msgKey = 'error.internal') {
    return {
      status: 500,
      msgKey: msgKey,
      message: message
    };
  }
};
