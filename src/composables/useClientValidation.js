import { computed } from 'vue'
import { useVuelidate } from '@vuelidate/core'
import { required, maxLength, minLength, email, helpers } from '@vuelidate/validators'
import { useI18n } from 'vue-i18n'

/**
 * Composable for client information validation
 * Uses Vuelidate for form validation with i18n error messages
 *
 * @param {Object} formData - Reactive form data object
 * @returns {Object} Validation object with v$ and helper functions
 */
export function useClientValidation(formData) {
  const { t } = useI18n()

  // Validation rules
  const rules = computed(() => ({
    firstName: {
      required: helpers.withMessage(
        t('client.edit.validation.firstNameRequired'),
        required
      ),
      maxLength: helpers.withMessage(
        t('client.edit.validation.firstNameMaxLength'),
        maxLength(50)
      )
    },
    lastName: {
      required: helpers.withMessage(
        t('client.edit.validation.lastNameRequired'),
        required
      ),
      maxLength: helpers.withMessage(
        t('client.edit.validation.lastNameMaxLength'),
        maxLength(50)
      )
    },
    nationalId: {
      required: helpers.withMessage(
        t('client.edit.validation.nationalIdRequired'),
        required
      ),
      minLength: helpers.withMessage(
        t('client.edit.validation.nationalIdMinLength'),
        minLength(5)
      ),
      maxLength: helpers.withMessage(
        t('client.edit.validation.nationalIdMaxLength'),
        maxLength(20)
      )
    },
    telephone: {
      minLength: helpers.withMessage(
        t('client.edit.validation.telephoneMinLength'),
        (value) => !value || value.length >= 10
      ),
      maxLength: helpers.withMessage(
        t('client.edit.validation.telephoneMaxLength'),
        maxLength(15)
      )
    },
    email: {
      email: helpers.withMessage(
        t('client.edit.validation.emailInvalid'),
        (value) => !value || email.$validator(value)
      ),
      maxLength: helpers.withMessage(
        t('client.edit.validation.emailMaxLength'),
        maxLength(100)
      )
    }
  }))

  const v$ = useVuelidate(rules, formData)

  /**
   * Get error message for a specific field
   * @param {string} field - Field name
   * @returns {string} Error message or empty string
   */
  function getErrorMessage(field) {
    const fieldValidation = v$.value[field]
    if (!fieldValidation) return ''

    if (fieldValidation.$error && fieldValidation.$errors.length > 0) {
      return fieldValidation.$errors[0].$message
    }

    return ''
  }

  /**
   * Check if form has any errors
   * @returns {boolean} True if form has errors
   */
  function hasErrors() {
    return v$.value.$error
  }

  /**
   * Validate all fields
   * @returns {Promise<boolean>} True if validation passes
   */
  async function validateAll() {
    const result = await v$.value.$validate()
    return result
  }

  /**
   * Reset validation state
   */
  function resetValidation() {
    v$.value.$reset()
  }

  return {
    v$,
    getErrorMessage,
    hasErrors,
    validateAll,
    resetValidation
  }
}
