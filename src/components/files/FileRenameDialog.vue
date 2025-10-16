<template>
  <q-dialog v-model="isOpen" persistent>
    <q-card style="min-width: 400px">
      <q-card-section>
        <div class="text-h6">
          <q-icon name="edit" class="q-mr-sm" />
          {{ $t('fileRename.title') }}
        </div>
      </q-card-section>

      <q-card-section class="q-pt-none">
        <div v-if="file" class="q-mb-md">
          <p class="text-body2 text-grey-8">
            <strong>{{ $t('files.upload.fileName') }}:</strong> {{ file.name }}
          </p>
        </div>

        <q-input
          v-model="newFileName"
          :label="$t('fileRename.newName')"
          outlined
          dense
          :error="showError"
          :error-message="errorMessage"
          @keyup.enter="handleRename"
          autofocus
          :rules="[validateFileName]"
        >
          <template v-slot:prepend>
            <q-icon name="description" />
          </template>
        </q-input>

        <div class="text-caption text-grey-7 q-mt-sm">
          {{ $t('fileRename.hint') }}
        </div>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn
          flat
          :label="$t('common.cancel')"
          color="grey-7"
          @click="handleCancel"
          :disable="renaming"
        />
        <q-btn
          unelevated
          :label="$t('fileRename.renameButton')"
          color="primary"
          :loading="renaming"
          :disable="!isValid"
          @click="handleRename"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'

// Props
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  file: {
    type: Object,
    default: null
  },
  renaming: {
    type: Boolean,
    default: false
  }
})

// Emits
const emit = defineEmits(['update:modelValue', 'rename', 'cancel'])

// Composables
const { t } = useI18n()

// State
const newFileName = ref('')
const showError = ref(false)
const errorMessage = ref('')

// Computed
const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const isValid = computed(() => {
  return newFileName.value.trim() !== '' &&
         newFileName.value !== props.file?.name &&
         !hasInvalidChars(newFileName.value)
})

// Watchers
watch(() => props.modelValue, (newValue) => {
  if (newValue && props.file) {
    // Initialize with current file name when dialog opens
    newFileName.value = props.file.name || ''
    showError.value = false
    errorMessage.value = ''
  }
})

// Methods
function hasInvalidChars(filename) {
  const invalidChars = /[<>:"/\\|?*]/g
  return invalidChars.test(filename)
}

function validateFileName(value) {
  if (!value || value.trim() === '') {
    return t('fileRename.error.required')
  }

  if (hasInvalidChars(value)) {
    return t('fileRename.error.invalidChars')
  }

  if (value === props.file?.name) {
    return t('fileRename.error.sameAsOld')
  }

  return true
}

function handleRename() {
  const trimmedName = newFileName.value.trim()

  if (!trimmedName) {
    showError.value = true
    errorMessage.value = t('fileRename.error.required')
    return
  }

  if (hasInvalidChars(trimmedName)) {
    showError.value = true
    errorMessage.value = t('fileRename.error.invalidChars')
    return
  }

  if (trimmedName === props.file?.name) {
    showError.value = true
    errorMessage.value = t('fileRename.error.sameAsOld')
    return
  }

  emit('rename', {
    fileId: props.file?.fileId,
    newName: trimmedName
  })
}

function handleCancel() {
  newFileName.value = ''
  showError.value = false
  errorMessage.value = ''
  emit('cancel')
  emit('update:modelValue', false)
}
</script>

<style scoped lang="scss">
// No custom styles needed
</style>
