/**
 * SecurityInterceptor.gs
 *
 * Intercepts all requests to validate authentication and authorization.
 * Routes are categorized as public or secured.
 *
 * Per constitution: Validate tokens for secured endpoints, intercept all requests.
 */

const SecurityInterceptor = {
  /**
   * List of public routes that don't require authentication
   * Format: 'handler.method'
   */
  publicRoutes: [
    'auth.signup',
    'auth.verifyEmail',
    'auth.resendVerification',
    'auth.login',
    'auth.requestPasswordReset',
    'auth.verifyOTP',
    'auth.resetPassword'
  ],

  /**
   * List of admin-only routes
   * Format: 'handler.method'
   */
  adminRoutes: [
    'metadata.search',
    'metadata.create',
    'metadata.update',
    'metadata.delete'
  ],

  /**
   * Validates the incoming request
   * @param {Object} e - Request event object from doPost
   * @returns {Object} Validated request context with user info
   */
  validateRequest: function(e) {
    const action = this.extractAction(e);
    const requestData = this.extractRequestData(e);

    // Log request for debugging
    console.log('Incoming request:', {
      action: action,
      timestamp: DateUtil.getCurrentTimestamp()
    });

    // Check if route is public
    if (this.isPublicRoute(action)) {
      return {
        action: action,
        data: requestData,
        user: null // No user for public routes
      };
    }

    // Secured route - validate token
    const token = this.extractToken(e, requestData);
    const tokenData = TokenManager.validateToken(token);

    // Get user from database to check status and role
    const user = UserService.getUserByEmail(tokenData.username);

    if (!user) {
      throw ResponseHandler.unauthorizedError('User not found', 'error.user.notFound');
    }

    if (user.status !== 'VERIFIED') {
      throw ResponseHandler.unauthorizedError(
        'User account not verified',
        'error.user.notVerified'
      );
    }

    // Check if route requires admin role
    if (this.isAdminRoute(action) && user.role !== 'ROLE_ADMIN') {
      throw ResponseHandler.forbiddenError(
        'Admin access required',
        'error.forbidden.adminOnly'
      );
    }

    return {
      action: action,
      data: requestData,
      user: user,
      token: token
    };
  },

  /**
   * Extracts the action from the request
   * @param {Object} e - Request event object
   * @returns {string} Action string (e.g., 'auth.login')
   */
  extractAction: function(e) {
    // Check URL parameters first
    if (e.parameter && e.parameter.action) {
      return e.parameter.action;
    }

    // Check POST body
    if (e.postData && e.postData.contents) {
      try {
        const body = JSON.parse(e.postData.contents);
        if (body.action) {
          return body.action;
        }
      } catch (error) {
        console.warn('Failed to parse POST body for action:', error);
      }
    }

    throw ResponseHandler.validationError(
      'Action parameter is required',
      'error.request.actionRequired'
    );
  },

  /**
   * Extracts request data from POST body
   * @param {Object} e - Request event object
   * @returns {Object} Request data object
   */
  extractRequestData: function(e) {
    if (!e.postData || !e.postData.contents) {
      return {};
    }

    try {
      const body = JSON.parse(e.postData.contents);
      return body.data || body;
    } catch (error) {
      throw ResponseHandler.validationError(
        'Invalid JSON in request body',
        'error.request.invalidJson'
      );
    }
  },

  /**
   * Extracts authentication token from request
   * Checks headers first, then request body
   * @param {Object} e - Request event object
   * @param {Object} requestData - Parsed request data
   * @returns {string} Authentication token
   */
  extractToken: function(e, requestData) {
    // Check Authorization header
    if (e.parameter && e.parameter.token) {
      return e.parameter.token;
    }

    // Check request body
    if (requestData.token) {
      return requestData.token;
    }

    throw ResponseHandler.unauthorizedError(
      'Authentication token required',
      'error.token.required'
    );
  },

  /**
   * Checks if an action is a public route
   * @param {string} action - Action string
   * @returns {boolean} True if public route
   */
  isPublicRoute: function(action) {
    return this.publicRoutes.indexOf(action) !== -1;
  },

  /**
   * Checks if an action is an admin-only route
   * @param {string} action - Action string
   * @returns {boolean} True if admin route
   */
  isAdminRoute: function(action) {
    return this.adminRoutes.indexOf(action) !== -1;
  },

  /**
   * Validates required fields in request data
   * @param {Object} data - Request data
   * @param {string[]} requiredFields - Array of required field names
   * @throws {Error} If any required field is missing
   */
  validateRequiredFields: function(data, requiredFields) {
    const missingFields = [];

    requiredFields.forEach(function(field) {
      if (!data[field] || data[field].toString().trim() === '') {
        missingFields.push(field);
      }
    });

    if (missingFields.length > 0) {
      throw ResponseHandler.validationError(
        'Missing required fields: ' + missingFields.join(', '),
        'error.validation.missingFields'
      );
    }
  },

  /**
   * Validates email format
   * @param {string} email - Email to validate
   * @returns {boolean} True if valid email
   */
  isValidEmail: function(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  /**
   * Sanitizes input to prevent injection attacks
   * @param {string} input - Input string to sanitize
   * @returns {string} Sanitized string
   */
  sanitizeInput: function(input) {
    if (typeof input !== 'string') {
      return input;
    }

    // Remove potentially harmful characters
    return input
      .replace(/[<>]/g, '') // Remove angle brackets
      .trim();
  }
};
