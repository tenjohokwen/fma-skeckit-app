<template>
  <div class="file-uploader">
    <q-card flat bordered>
      <q-card-section>
        <div class="text-h6 q-mb-md">
          {{ $t('files.upload.title') }}
        </div>

        <q-separator class="q-mb-md" />

        <!-- Folder ID Input (only show if not provided as prop) -->
        <div v-if="!folderId" class="q-mb-md">
          <FieldInput v-model="folderIdInput" type="text" :label="$t('files.upload.folderId')" icon="folder" required
            :disable="isUploading" />
        </div>

        <!-- File Upload Area -->
        <div class="upload-area" :class="{ 'drag-over': isDragging, 'disabled': isUploading || !effectiveFolderId }"
          @dragover.prevent="handleDragOver" @dragleave.prevent="handleDragLeave" @drop.prevent="handleDrop"
          @click="!isUploading && effectiveFolderId && triggerFileInput()">
          <input ref="fileInput" type="file" class="hidden-input" @change="handleFileSelect" />

          <div v-if="!selectedFile" class="upload-prompt">
            <q-icon name="cloud_upload" size="64px" color="grey-5" />
            <div class="text-h6 text-grey-7 q-mt-md">
              {{ $t('files.upload.dragDrop') }}
            </div>
            <div class="text-caption text-grey-6">
              {{ $t('files.upload.or') }}
            </div>
            <q-btn flat color="primary" icon="attach_file" :label="$t('files.upload.selectFile')"
              :disable="isUploading || !effectiveFolderId" class="q-mt-sm" />
            <div class="text-caption text-grey-6 q-mt-md">
              {{ $t('files.upload.maxSize') }}
            </div>
          </div>

          <div v-else class="file-selected">
            <q-icon name="insert_drive_file" size="48px" color="primary" />
            <div class="text-body1 q-mt-sm">{{ selectedFile.name }}</div>
            <div class="text-caption text-grey-7">
              {{ formatFileSize(selectedFile.size) }}
            </div>
            <q-btn v-if="!isUploading" flat round dense icon="close" color="negative" class="remove-btn"
              @click.stop="clearFile" />
          </div>
        </div>

        <!-- Upload Progress -->
        <div v-if="isUploading" class="q-mt-md">
          <q-linear-progress indeterminate color="primary" class="q-mb-sm" />
          <div class="text-center text-caption text-grey-7">
            {{ $t('files.upload.uploading') }}
          </div>
        </div>

        <!-- Upload Button -->
        <div v-if="selectedFile && !isUploading" class="q-mt-md">
          <q-btn color="primary" icon="cloud_upload" :label="$t('files.upload.uploadButton')" :disable="!effectiveFolderId"
            @click="handleUpload" />
        </div>
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useQuasar } from 'quasar'
import { useFileOperations } from 'src/composables/useFileOperations'
import FieldInput from 'src/components/metadata/FieldInput.vue'

const { t } = useI18n()
const $q = useQuasar()
const { uploadFile, isLoading: isUploading } = useFileOperations()

// Props
const props = defineProps({
  folderId: {
    type: String,
    default: ''
  }
})

// Emit events
const emit = defineEmits(['upload-success', 'upload-conflict'])

// State
const folderIdInput = ref('')
const selectedFile = ref(null)
const isDragging = ref(false)
const fileInput = ref(null)

// Computed - use prop if provided, otherwise use input
const effectiveFolderId = computed(() => {
  return props.folderId || folderIdInput.value
})

/**
 * Triggers the hidden file input
 */
function triggerFileInput() {
  if (fileInput.value) {
    fileInput.value.click()
  }
}

/**
 * Handles file selection from input
 */
function handleFileSelect(event) {
  const file = event.target.files[0]
  if (file) {
    validateAndSetFile(file)
  }
}

/**
 * Handles drag over event
 */
function handleDragOver() {
  if (!isUploading.value && effectiveFolderId.value) {
    isDragging.value = true
  }
}

/**
 * Handles drag leave event
 */
function handleDragLeave() {
  isDragging.value = false
}

/**
 * Handles file drop
 */
function handleDrop(event) {
  isDragging.value = false

  if (isUploading.value || !effectiveFolderId.value) {
    return
  }

  const files = event.dataTransfer.files
  if (files.length > 0) {
    validateAndSetFile(files[0])
  }
}

/**
 * Validates and sets the selected file
 */
function validateAndSetFile(file) {
  // Check file size (10MB max)
  const maxSize = 10 * 1024 * 1024 // 10MB
  if (file.size > maxSize) {
    $q.notify({
      type: 'negative',
      message: t('files.upload.error.size'),
      position: 'top'
    })
    return
  }

  // Check file name for invalid characters
  const invalidChars = /[<>:"/\\|?*]/g
  if (invalidChars.test(file.name)) {
    $q.notify({
      type: 'negative',
      message: t('files.upload.error.filename'),
      position: 'top'
    })
    return
  }

  selectedFile.value = file
}

/**
 * Clears the selected file
 */
function clearFile() {
  selectedFile.value = null
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

/**
 * Handles file upload
 */
async function handleUpload() {
  if (!effectiveFolderId.value || !selectedFile.value) {
    return
  }

  try {
    const result = await uploadFile({
      caseFolderId: effectiveFolderId.value.trim(),
      file: selectedFile.value
    })

    // Check if conflict detected
    if (result.conflict) {
      emit('upload-conflict', {
        folderId: effectiveFolderId.value.trim(),
        file: selectedFile.value,
        existingFileId: result.existingFileId,
        fileName: result.fileName
      })
    } else {
      // Success - no conflict
      emit('upload-success', result.file)
      $q.notify({
        type: 'positive',
        message: t('files.upload.success'),
        position: 'top'
      })

      // Clear file after successful upload
      clearFile()
    }
  } catch (error) {
    console.error('Upload failed:', error)
    $q.notify({
      type: 'negative',
      message: error.message || t('files.upload.error.generic'),
      position: 'top'
    })
  }
}

/**
 * Formats file size in human-readable format
 */
function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}
</script>

<style scoped lang="scss">
.file-uploader {
  max-width: 600px;
  margin: 0 auto;
}

.upload-area {
  border: 2px dashed #ccc;
  border-radius: 8px;
  padding: 40px 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background-color: #fafafa;

  &:hover:not(.disabled) {
    border-color: #1976d2;
    background-color: #f0f7ff;
  }

  &.drag-over {
    border-color: #1976d2;
    background-color: #e3f2fd;
    transform: scale(1.02);
  }

  &.disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }
}

.hidden-input {
  display: none;
}

.upload-prompt {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.file-selected {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;

  .remove-btn {
    position: absolute;
    top: 0;
    right: 0;
  }
}
</style>
