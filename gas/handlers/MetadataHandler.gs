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

    return {
      status: 200,
      msgKey: 'metadata.search.success',
      message: 'Search completed successfully',
      data: {
        cases: cases,
        count: cases.length
      }
    };
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

    return {
      status: 200,
      msgKey: 'metadata.search.success',
      message: 'Case found',
      data: {
        case: caseData
      }
    };
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

    return {
      status: 200,
      msgKey: 'metadata.edit.fetch.success',
      message: 'Case retrieved for editing',
      data: {
        case: caseData
      }
    };
  },

  /**
   * Update case metadata (Admin only - US4)
   * Updates case fields with automatic metadata tracking
   *
   * @param {Object} context - Request context
   * @param {Object} context.data - { caseId, version, updates }
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

    // Validate version is a number
    if (typeof version !== 'number') {
      throw ResponseHandler.validationError(
        'Version must be a number',
        'metadata.update.error.invalidVersion'
      );
    }

    // Update case
    const updatedCase = SheetsService.updateCase(
      caseId,
      updates,
      version,
      context.user.email
    );

    return {
      status: 200,
      msgKey: 'metadata.update.success',
      message: 'Case updated successfully',
      data: {
        case: updatedCase
      }
    };
  },

  /**
   * Create case metadata (Admin only)
   * Creates a new case metadata entry
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

    SecurityInterceptor.validateRequiredFields(caseData, [
      'caseId',
      'clientFirstName',
      'clientLastName',
      'folderName',
      'folderPath'
    ]);

    // Create case
    const createdCase = SheetsService.createCase(caseData, context.user.email);

    return {
      status: 200,
      msgKey: 'metadata.create.success',
      message: 'Case created successfully',
      data: {
        case: createdCase
      }
    };
  }
};
