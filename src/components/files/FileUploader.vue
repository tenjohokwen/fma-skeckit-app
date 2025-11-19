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
          <input ref="fileInput" type="file" multiple class="hidden-input" @change="handleFileSelect" />

          <div v-if="selectedFiles.length === 0" class="upload-prompt">
            <q-icon name="cloud_upload" size="64px" color="grey-5" />
            <div class="text-h6 text-grey-7 q-mt-md">
              {{ $t('files.upload.dragDrop') }}
            </div>
            <div class="text-caption text-grey-6">
              {{ $t('files.upload.or') }}
            </div>
            <q-btn flat color="primary" icon="attach_file" :label="$t('files.upload.selectFiles')"
              :disable="isUploading || !effectiveFolderId" class="q-mt-sm" />
            <div class="text-caption text-grey-6 q-mt-md">
              {{ $t('files.upload.maxSize') }}
            </div>
          </div>

          <div v-else class="files-selected">
            <div class="text-subtitle2 q-mb-sm">
              {{ $t('files.upload.filesSelected', { count: selectedFiles.length }) }}
            </div>
            <q-list bordered separator class="file-list">
              <q-item v-for="(file, index) in selectedFiles" :key="index" class="file-item">
                <q-item-section avatar>
                  <q-icon name="insert_drive_file" color="primary" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{ file.name }}</q-item-label>
                  <q-item-label caption>{{ formatFileSize(file.size) }}</q-item-label>
                </q-item-section>
                <q-item-section side v-if="!isUploading">
                  <q-btn flat round dense icon="close" color="negative" size="sm"
                    @click.stop="removeFile(index)" />
                </q-item-section>
              </q-item>
            </q-list>
            <div class="text-caption text-grey-7 q-mt-sm">
              {{ $t('files.upload.totalSize') }}: {{ formatFileSize(totalSize) }}
            </div>
          </div>
        </div>

        <!-- Upload Button -->
        <div v-if="selectedFiles.length > 0" class="q-mt-md">
          <q-btn
            color="primary"
            :icon="isUploading ? '' : 'cloud_upload'"
            :label="isUploading ? $t('files.upload.uploading') : $t('files.upload.uploadButton', { count: selectedFiles.length })"
            :disable="!effectiveFolderId || isUploading"
            :loading="isUploading"
            @click="handleUpload"
          />
        </div>

        <!-- Upload Progress -->
        <div v-if="isUploading" class="q-mt-md">
          <q-linear-progress indeterminate color="primary" class="q-mb-sm" />
          <div class="text-center text-caption text-grey-7">
            {{ $t('files.upload.uploadingProgress') }}
          </div>
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
import { useFilesStore } from 'src/stores/files'
import FieldInput from 'src/components/metadata/FieldInput.vue'

const { t } = useI18n()
const $q = useQuasar()
const filesStore = useFilesStore()
const { uploadFile, uploadMultipleFiles } = useFileOperations()

// Use loading state from files store
const isUploading = computed(() => filesStore.loading)

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
const selectedFiles = ref([])
const isDragging = ref(false)
const fileInput = ref(null)

// Computed - use prop if provided, otherwise use input
const effectiveFolderId = computed(() => {
  return props.folderId || folderIdInput.value
})

// Computed - total size of all selected files
const totalSize = computed(() => {
  return selectedFiles.value.reduce((sum, file) => sum + file.size, 0)
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
  const files = Array.from(event.target.files)
  if (files.length > 0) {
    validateAndAddFiles(files)
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

  const files = Array.from(event.dataTransfer.files)
  if (files.length > 0) {
    validateAndAddFiles(files)
  }
}

/**
 * Validates and adds files to the selection
 */
function validateAndAddFiles(files) {
  const maxSize = 50 * 1024 * 1024 // 50MB
  const invalidChars = /[<>:"/\\|?*]/g

  for (const file of files) {
    // Check if file already selected
    if (selectedFiles.value.some(f => f.name === file.name && f.size === file.size)) {
      $q.notify({
        type: 'warning',
        message: t('files.upload.error.duplicate', { name: file.name }),
        position: 'top'
      })
      continue
    }

    // Check file size
    if (file.size > maxSize) {
      $q.notify({
        type: 'negative',
        message: t('files.upload.error.size', { name: file.name }),
        position: 'top'
      })
      continue
    }

    // Check file name for invalid characters
    if (invalidChars.test(file.name)) {
      $q.notify({
        type: 'negative',
        message: t('files.upload.error.filename', { name: file.name }),
        position: 'top'
      })
      continue
    }

    // Add valid file
    selectedFiles.value.push(file)
  }
}

/**
 * Removes a file from the selection
 */
function removeFile(index) {
  selectedFiles.value.splice(index, 1)
}

/**
 * Clears all selected files
 */
function clearFiles() {
  selectedFiles.value = []
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

/**
 * Handles file upload
 */
async function handleUpload() {
  if (!effectiveFolderId.value || selectedFiles.value.length === 0) {
    return
  }

  try {
    // If single file, use single upload (for conflict detection)
    if (selectedFiles.value.length === 1) {
      const result = await uploadFile({
        caseFolderId: effectiveFolderId.value.trim(),
        file: selectedFiles.value[0]
      })

      // Check if conflict detected
      if (result.conflict) {
        emit('upload-conflict', {
          folderId: effectiveFolderId.value.trim(),
          file: selectedFiles.value[0],
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

        // Clear files after successful upload
        clearFiles()
      }
    } else {
      // Multiple files - use batch upload
      const filesData = selectedFiles.value.map(file => ({
        file: file,
        displayName: file.name
      }))

      const result = await uploadMultipleFiles({
        caseFolderId: effectiveFolderId.value.trim(),
        files: filesData
      })

      // Notify based on results
      if (result.data && result.data.results) {
        const { successCount, failureCount, totalCount } = result.data

        if (successCount === totalCount) {
          $q.notify({
            type: 'positive',
            message: t('files.upload.multipleSuccess', { count: successCount }),
            position: 'top'
          })
        } else if (successCount > 0) {
          $q.notify({
            type: 'warning',
            message: t('files.upload.partialSuccess', { success: successCount, failed: failureCount }),
            position: 'top'
          })
        } else {
          $q.notify({
            type: 'negative',
            message: t('files.upload.allFailed', { count: totalCount }),
            position: 'top'
          })
        }

        // Emit success for successful uploads
        emit('upload-success', result.data.results)

        // Clear files after upload
        clearFiles()
      }
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

.files-selected {
  text-align: left;

  .file-list {
    max-height: 300px;
    overflow-y: auto;
    border-radius: 4px;
  }

  .file-item {
    min-height: 56px;
  }
}
</style>
