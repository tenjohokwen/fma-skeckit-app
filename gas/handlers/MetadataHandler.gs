/**
 * MetadataHandler.gs
 *
 * Handles all case metadata-related endpoints.
 * Implements User Stories 3 and 4 (Search, View, Edit Case Metadata).
 *
 * All methods receive validated context from SecurityInterceptor via Router.
 */

const MetadataHandler = {
  /**
   * T079: Search cases by client name (US3)
   * Searches for cases by first name and/or last name
   *
   * @param {Object} context - Request context
   * @param {Object} context.data - { firstName, lastName }
   * @param {Object} context.user - Authenticated user object
   * @returns {Object} Response with array of matching cases
   */
  searchCasesByName: function(context) {
    const { firstName, lastName } = context.data;

    // At least one search parameter required
    if (!firstName && !lastName) {
      throw ResponseHandler.validationError(
        'At least one search parameter required (firstName or lastName)',
        'metadata.search.error.params'
      );
    }

    // Search cases
    const cases = SheetsService.searchCasesByName(firstName, lastName);

    // Generate new token to extend session
    const newToken = TokenManager.generateToken(context.user.email);

    return ResponseHandler.successWithToken(
      'metadata.search.success',
      'Search completed successfully',
      {
        cases: cases,
        count: cases.length
      },
      context.user,
      newToken.value
    );
  },

  /**
   * T080: Search case by case ID (US3)
   * Finds a specific case by its unique case ID
   *
   * @param {Object} context - Request context
   * @param {Object} context.data - { caseId }
   * @param {Object} context.user - Authenticated user object
   * @returns {Object} Response with case data
   */
  searchCaseByCaseId: function(context) {
    const { caseId } = context.data;

    SecurityInterceptor.validateRequiredFields(context.data, ['caseId']);

    // Search for case
    const caseData = SheetsService.searchCaseByCaseId(caseId);

    if (!caseData) {
      throw ResponseHandler.notFoundError(
        'Case not found',
        'metadata.search.error.notfound'
      );
    }

    // Generate new token to extend session
    const newToken = TokenManager.generateToken(context.user.email);

    return ResponseHandler.successWithToken(
      'metadata.search.success',
      'Case found',
      {
        case: caseData
      },
      context.user,
      newToken.value
    );
  },

  /**
   * Get case for viewing/editing
   * Retrieves case with version number for optimistic locking
   * Available to all authenticated users (read-only for non-admin)
   *
   * @param {Object} context - Request context
   * @param {Object} context.data - { caseId }
   * @param {Object} context.user - Authenticated user object
   * @returns {Object} Response with full case data including version
   */
  getCaseForEdit: function(context) {
    // No admin check here - viewing case details is allowed for all authenticated users
    // Admin-only restriction is enforced in updateCaseMetadata for write operations

    const { caseId } = context.data;
    SecurityInterceptor.validateRequiredFields(context.data, ['caseId']);

    // Get full case data with system fields
    const caseData = SheetsService.getCaseById(caseId);

    if (!caseData) {
      throw ResponseHandler.notFoundError(
        'Case not found',
        'metadata.edit.error.notfound'
      );
    }

    // Generate new token to extend session
    const newToken = TokenManager.generateToken(context.user.email);

    return ResponseHandler.successWithToken(
      'metadata.edit.fetch.success',
      'Case retrieved for editing',
      {
        case: caseData
      },
      context.user,
      newToken.value
    );
  },

  /**
   * Update case metadata (Admin only - US4)
   * Updates case fields with automatic metadata tracking
   *
   * Feature 006: clientId is immutable and cannot be updated
   * Feature 009: Sends email notification if status changed and sendEmail=true
   *
   * @param {Object} context - Request context
   * @param {Object} context.data - { caseId, version, updates, sendEmail?, clientLanguage? }
   * @param {Object} context.user - Authenticated user object (must be admin)
   * @returns {Object} Response with updated case data
   */
  updateCaseMetadata: function(context) {
    // Check admin role
    if (context.user.role !== 'ROLE_ADMIN') {
      throw ResponseHandler.forbiddenError(
        'Admin role required',
        'metadata.update.error.forbidden'
      );
    }

    const { caseId, version, updates } = context.data;

    SecurityInterceptor.validateRequiredFields(context.data, ['caseId', 'version', 'updates']);

    // ========================================
    // VALIDATION: Reject clientId in updates
    // ========================================
    if (updates.hasOwnProperty('clientId')) {
      throw ResponseHandler.validationError(
        'clientId is system-managed and cannot be updated',
        'metadata.update.error.clientIdImmutable'
      );
    }

    // Validate version is a number
    if (typeof version !== 'number') {
      throw ResponseHandler.validationError(
        'Version must be a number',
        'metadata.update.error.invalidVersion'
      );
    }

    // Feature 009: Extract email parameters before updating
    const sendEmail = updates.sendEmail === true;
    const clientLanguage = updates.clientLanguage;
    const statusChanged = updates.hasOwnProperty('status');

    // Get current case data before update (for oldStatus)
    const currentCase = SheetsService.getCaseById(caseId);
    if (!currentCase) {
      throw ResponseHandler.notFoundError(
        'Case not found',
        'metadata.update.error.notfound'
      );
    }

    // Remove email parameters from updates (not stored in sheet)
    const caseUpdates = Object.assign({}, updates);
    delete caseUpdates.sendEmail;
    delete caseUpdates.clientLanguage;

    // Update case (will also validate clientId immutability)
    const updatedCase = SheetsService.updateCase(
      caseId,
      caseUpdates,
      version,
      context.user.email
    );

    // Feature 009: Send email notification if requested
    let emailResult = null;
    if (sendEmail && statusChanged) {
      // Get client information
      const client = SheetsService.getClientById(updatedCase.clientId);

      if (client && client.email) {
        emailResult = EmailService.sendCaseStatusEmail({
          clientEmail: client.email,
          clientFirstName: client.firstName,
          caseId: updatedCase.caseId,
          oldStatus: currentCase.status,
          newStatus: updatedCase.status,
          notes: updatedCase.notes || '',
          language: clientLanguage || 'en'
        });
      } else {
        emailResult = {
          success: false,
          error: 'Client email not found'
        };
      }
    }

    // Generate new token to extend session
    const newToken = TokenManager.generateToken(context.user.email);

    // Prepare response data
    const responseData = {
      case: updatedCase  // Includes clientId (unchanged)
    };

    // Include email result if email was attempted
    if (emailResult !== null) {
      responseData.emailSent = emailResult.success;
      if (!emailResult.success) {
        responseData.emailError = emailResult.error;
      }
    }

    return ResponseHandler.successWithToken(
      'metadata.update.success',
      'Case updated successfully',
      responseData,
      context.user,
      newToken.value
    );
  },

  /**
   * Create case metadata (Admin only)
   * Creates a new case metadata entry
   *
   * Feature 006: Now requires clientId (UUID) to establish proper foreign key relationship
   *
   * @param {Object} context - Request context
   * @param {Object} context.data - Case data object
   * @param {Object} context.user - Authenticated user object (must be admin)
   * @returns {Object} Response with created case data
   */
  createCaseMetadata: function(context) {
    // Check admin role
    if (context.user.role !== 'ROLE_ADMIN') {
      throw ResponseHandler.forbiddenError(
        'Admin role required',
        'metadata.create.error.forbidden'
      );
    }

    const caseData = context.data;

    // ========================================
    // VALIDATION: Required fields including clientId
    // ========================================
    SecurityInterceptor.validateRequiredFields(caseData, [
      'caseId',
      'clientId',           // ← NEW: Required field (Feature 006)
      'clientFirstName',
      'clientLastName',
      'folderName',
      'folderPath'
    ]);

    // ========================================
    // VALIDATION: clientId format (UUID)
    // ========================================
    if (!this._isValidUUID(caseData.clientId)) {
      throw ResponseHandler.validationError(
        'clientId must be a valid UUID',
        'metadata.create.error.invalidClientId'
      );
    }

    // ========================================
    // VALIDATION: clientId exists in clients sheet
    // ========================================
    // Note: SheetsService.createCase() will also validate this,
    // but we check here for better error messaging
    const client = SheetsService.getClientById(caseData.clientId);
    if (!client) {
      throw ResponseHandler.validationError(
        `Client with ID ${caseData.clientId} not found`,
        'metadata.create.error.clientNotFound'
      );
    }

    // Create case (will perform additional validation)
    const createdCase = SheetsService.createCase(caseData, context.user.email);

    // Generate new token to extend session
    const newToken = TokenManager.generateToken(context.user.email);

    return ResponseHandler.successWithToken(
      'metadata.create.success',
      'Case created successfully',
      {
        case: createdCase  // Includes clientId
      },
      context.user,
      newToken.value
    );
  },

  // ==================== HELPER METHODS ====================

  /**
   * Helper: Validate UUID format
   * @param {string} uuid - UUID to validate
   * @returns {boolean} True if valid
   * @private
   */
  _isValidUUID: function(uuid) {
    if (!uuid || typeof uuid !== 'string') {
      return false;
    }
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  }
};
