<template>
  <q-form @submit.prevent="handleSubmit" class="case-form">
    <div class="q-gutter-md">
      <!-- Case ID Input -->
      <q-input
        v-model="formData.caseId"
        :label="$t('case.create.caseId') + ' *'"
        outlined
        dense
        :rules="[requiredRule, caseIdFormatRule]"
        lazy-rules
        :error="!!error"
        :error-message="error"
        @update:model-value="clearError"
      >
        <template v-slot:hint>
          {{ $t('case.create.caseIdHint') }}
        </template>
      </q-input>

      <!-- Form Actions -->
      <div class="row q-gutter-sm justify-end">
        <q-btn
          flat
          :label="$t('common.cancel')"
          color="grey-7"
          @click="handleCancel"
          :disable="loading"
        />
        <q-btn
          type="submit"
          :label="$t('case.create.createButton')"
          color="primary"
          :loading="loading"
          :disable="!isFormValid"
        />
      </div>
    </div>
  </q-form>
</template>

<script setup>
/**
 * CaseForm.vue
 *
 * Form component for creating new case folders.
 * Validates case ID format (alphanumeric, hyphens, underscores, 1-100 chars).
 *
 * Per constitution: Vue 3 Composition API with <script setup>
 */

import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'

// Props
const props = defineProps({
  loading: {
    type: Boolean,
    default: false
  }
})

// Emits
const emit = defineEmits(['submit', 'cancel'])

// Composables
const { t } = useI18n()

// State
const formData = ref({
  caseId: ''
})

const error = ref(null)

// Validation rules
const requiredRule = (val) => {
  if (!val || val.trim() === '') {
    return t('validation.required', { field: t('case.create.caseId') })
  }
  return true
}

const caseIdFormatRule = (val) => {
  if (!val) return true // Skip if empty (handled by required rule)

  // Check length
  if (val.length < 1 || val.length > 100) {
    return t('case.create.validation.length')
  }

  // Check format: alphanumeric + underscore/hyphen only
  const regex = /^[a-zA-Z0-9_-]+$/
  if (!regex.test(val)) {
    return t('case.create.validation.format')
  }

  return true
}

// Computed
const isFormValid = computed(() => {
  const caseId = formData.value.caseId.trim()
  if (!caseId || caseId.length < 1 || caseId.length > 100) {
    return false
  }
  const regex = /^[a-zA-Z0-9_-]+$/
  return regex.test(caseId)
})

// Methods
function handleSubmit() {
  // Clear any previous errors
  error.value = null

  // Validate form
  if (!isFormValid.value) {
    return
  }

  // Emit submit event with form data
  const submitData = {
    caseId: formData.value.caseId.trim()
  }

  emit('submit', submitData)
}

function handleCancel() {
  emit('cancel')
}

function clearError() {
  error.value = null
}

function resetForm() {
  formData.value.caseId = ''
  error.value = null
}

function setError(errorMessage) {
  error.value = errorMessage
}

// Expose methods for parent components
defineExpose({
  resetForm,
  setError
})
</script>

<style scoped lang="scss">
.case-form {
  width: 100%;
  max-width: 600px;
}
</style>
