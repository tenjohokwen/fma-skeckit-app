<template>
  <q-dialog v-model="showDialog" persistent>
    <q-card style="min-width: 400px; max-width: 600px">
      <q-card-section>
        <div class="text-h6">{{ t('emailDialog.title') }}</div>
      </q-card-section>

      <q-card-section>
        <p>{{ t('emailDialog.message') }}</p>

        <!-- Send Email Toggle -->
        <q-checkbox
          v-model="sendEmail"
          :label="t('emailDialog.btnYes')"
          color="primary"
          class="q-mt-md"
        />

        <!-- Language Selection (shown if sendEmail=true) -->
        <div v-if="sendEmail" class="q-mt-md">
          <div class="text-subtitle2 q-mb-sm">{{ t('emailDialog.languageLabel') }}</div>
          <div class="q-gutter-sm">
            <q-radio
              v-model="selectedLanguage"
              val="en"
              :label="t('emailDialog.languageEnglish')"
              color="primary"
            />
            <q-radio
              v-model="selectedLanguage"
              val="fr"
              :label="t('emailDialog.languageFrench')"
              color="primary"
            />
          </div>
        </div>

        <!-- Notes Validation Error (shown if validation fails) -->
        <div v-if="showNotesError" class="q-mt-md text-negative">
          <q-icon name="warning" size="sm" class="q-mr-xs" />
          {{ t('emailDialog.notesRequired') }}
        </div>
      </q-card-section>

      <q-card-actions align="right" class="q-px-md q-pb-md">
        <q-btn
          flat
          :label="t('emailDialog.btnCancel')"
          color="primary"
          @click="handleCancel"
        />
        <q-btn
          unelevated
          color="primary"
          :label="t('common.confirm')"
          :disable="!isValid"
          @click="handleConfirm"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'

// i18n
const { t } = useI18n()

// Props
const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true
  },
  originalNotes: {
    type: String,
    default: ''
  },
  currentNotes: {
    type: String,
    default: ''
  }
})

// Emits
const emit = defineEmits(['update:modelValue', 'confirm', 'cancel'])

// Reactive state
const sendEmail = ref(false)
const selectedLanguage = ref('en')

// Computed property for v-model sync
const showDialog = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

// T050: Computed property to check if notes have changed
const notesChanged = computed(() => {
  const original = props.originalNotes.trim()
  const current = props.currentNotes.trim()

  // Notes are considered changed if:
  // 1. They are different from the original
  // 2. The current notes are not empty
  return current !== original && current !== ''
})

// T051: Computed property to show notes error
const showNotesError = computed(() => {
  // Only show error if user wants to send email AND notes haven't changed
  return sendEmail.value && !notesChanged.value
})

// T052: Computed property to check if form is valid
const isValid = computed(() => {
  // If not sending email, always valid
  if (!sendEmail.value) {
    return true
  }

  // If sending email, notes must have changed
  return notesChanged.value
})

// Event handlers
function handleConfirm() {
  // T052: Prevent confirmation if validation fails
  if (!isValid.value) {
    return
  }

  const payload = {
    sendEmail: sendEmail.value
  }

  // Only include clientLanguage if sendEmail is true
  if (sendEmail.value) {
    payload.clientLanguage = selectedLanguage.value
  }

  emit('confirm', payload)
  showDialog.value = false
}

function handleCancel() {
  emit('cancel')
  showDialog.value = false
}
</script>

<style scoped>
/* Component-specific styles if needed */
</style>
