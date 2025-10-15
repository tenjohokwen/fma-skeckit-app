<template>
  <q-page padding>
    <div class="file-management-page">
      <!-- Page Header -->
      <div class="page-header q-mb-lg">
        <div class="row items-center">
          <div class="col">
            <h1 class="text-h4 q-mb-xs">{{ $t('files.management.pageTitle') }}</h1>
            <p class="text-body2 text-grey-7">{{ $t('files.management.pageSubtitle') }}</p>
          </div>
          <div class="col-auto">
            <q-btn
              flat
              icon="arrow_back"
              :label="$t('common.back')"
              @click="handleBack"
            />
          </div>
        </div>
      </div>

      <!-- Tabs for different operations -->
      <q-tabs
        v-model="activeTab"
        dense
        class="text-grey"
        active-color="primary"
        indicator-color="primary"
        align="left"
      >
        <q-tab name="upload" icon="cloud_upload" :label="$t('files.management.tabs.upload')" />
        <q-tab name="caseFolder" icon="create_new_folder" :label="$t('files.management.tabs.caseFolder')" />
        <q-tab name="browse" icon="folder_open" :label="$t('files.management.tabs.browse')" />
      </q-tabs>

      <q-separator class="q-mb-lg" />

      <!-- Tab Panels -->
      <q-tab-panels v-model="activeTab" animated>
        <!-- File Upload Tab -->
        <q-tab-panel name="upload">
          <FileUploader
            @upload-success="handleUploadSuccess"
            @upload-conflict="handleUploadConflict"
          />

          <!-- Recent Upload Display -->
          <div v-if="recentUpload" class="recent-upload q-mt-lg">
            <q-card flat bordered>
              <q-card-section>
                <div class="text-h6 q-mb-md">
                  <q-icon name="check_circle" color="positive" class="q-mr-xs" />
                  {{ $t('files.management.recentUpload') }}
                </div>

                <q-separator class="q-mb-md" />

                <div class="row q-col-gutter-md">
                  <div class="col-12 col-sm-6">
                    <div class="text-caption text-grey-7">{{ $t('files.upload.fileName') }}</div>
                    <div class="text-body1">{{ recentUpload.fileName }}</div>
                  </div>
                  <div class="col-12 col-sm-6">
                    <div class="text-caption text-grey-7">{{ $t('files.upload.fileSize') }}</div>
                    <div class="text-body1">{{ formatBytes(recentUpload.size) }}</div>
                  </div>
                  <div class="col-12 col-sm-6">
                    <div class="text-caption text-grey-7">{{ $t('files.upload.uploadedAt') }}</div>
                    <div class="text-body1">{{ recentUpload.uploadedAt }}</div>
                  </div>
                  <div class="col-12 col-sm-6">
                    <div class="text-caption text-grey-7">{{ $t('files.upload.fileId') }}</div>
                    <div class="text-body2 text-grey-8" style="word-break: break-all;">
                      {{ recentUpload.fileId }}
                    </div>
                  </div>
                </div>

                <div class="q-mt-md row q-gutter-sm">
                  <q-btn
                    flat
                    color="primary"
                    icon="download"
                    :label="$t('files.download')"
                    @click="handleDownloadFile(recentUpload.downloadUrl)"
                  />
                </div>
              </q-card-section>
            </q-card>
          </div>
        </q-tab-panel>

        <!-- Case Folder Creation Tab -->
        <q-tab-panel name="caseFolder">
          <CaseFolderCreator @folder-created="handleCaseFolderCreated" />

          <!-- Recent Folder Display -->
          <div v-if="recentCaseFolder" class="recent-folder q-mt-lg">
            <q-card flat bordered>
              <q-card-section>
                <div class="text-h6 q-mb-md">
                  <q-icon name="folder" color="primary" class="q-mr-xs" />
                  {{ $t('files.management.recentCaseFolder') }}
                </div>

                <q-separator class="q-mb-md" />

                <div class="row q-col-gutter-md">
                  <div class="col-12 col-sm-6">
                    <div class="text-caption text-grey-7">{{ $t('files.caseFolder.folderName') }}</div>
                    <div class="text-body1">{{ recentCaseFolder.folderName }}</div>
                  </div>
                  <div class="col-12 col-sm-6">
                    <div class="text-caption text-grey-7">{{ $t('files.caseFolder.folderPath') }}</div>
                    <div class="text-body1">{{ recentCaseFolder.folderPath }}</div>
                  </div>
                  <div class="col-12 col-sm-6">
                    <div class="text-caption text-grey-7">{{ $t('files.caseFolder.createdAt') }}</div>
                    <div class="text-body1">{{ recentCaseFolder.createdAt }}</div>
                  </div>
                  <div class="col-12 col-sm-6">
                    <div class="text-caption text-grey-7">{{ $t('files.caseFolder.folderId') }}</div>
                    <div class="text-body2 text-grey-8" style="word-break: break-all;">
                      {{ recentCaseFolder.folderId }}
                    </div>
                  </div>
                </div>

                <div class="q-mt-md row q-gutter-sm">
                  <q-btn
                    flat
                    color="primary"
                    icon="folder_open"
                    :label="$t('files.client.openFolder')"
                    @click="handleOpenFolder(recentCaseFolder.folderId)"
                  />
                  <q-btn
                    flat
                    color="grey-7"
                    icon="link"
                    :label="$t('files.client.copyFolderId')"
                    @click="handleCopyFolderId(recentCaseFolder.folderId)"
                  />
                </div>
              </q-card-section>
            </q-card>
          </div>
        </q-tab-panel>

        <!-- Browse Files Tab -->
        <q-tab-panel name="browse">
          <FolderNavigator @file-deleted="handleFileDeleted" />
        </q-tab-panel>
      </q-tab-panels>

      <!-- File Conflict Dialog -->
      <FileConflictDialog
        v-model="showConflictDialog"
        :folder-id="conflictData.folderId"
        :file="conflictData.file"
        :file-name="conflictData.fileName"
        :existing-file-id="conflictData.existingFileId"
        @resolved="handleConflictResolved"
        @cancelled="handleConflictCancelled"
      />
    </div>
  </q-page>
</template>

<script setup>
/**
 * FileManagementPage.vue
 *
 * Page for file and folder management (admin only).
 * Integrates FileUploader, CaseFolderCreator, and FileConflictDialog components.
 *
 * Per constitution: Vue 3 Composition API with <script setup>
 */

import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from 'src/stores/authStore'
import { useNotifications } from 'src/composables/useNotifications'
import { copyToClipboard } from 'quasar'
import FileUploader from 'src/components/files/FileUploader.vue'
import CaseFolderCreator from 'src/components/files/CaseFolderCreator.vue'
import FileConflictDialog from 'src/components/files/FileConflictDialog.vue'
import FolderNavigator from 'src/components/files/FolderNavigator.vue'

const router = useRouter()
const authStore = useAuthStore()
const { notifySuccess, notifyError } = useNotifications()

// State
const activeTab = ref('upload')
const recentUpload = ref(null)
const recentCaseFolder = ref(null)
const showConflictDialog = ref(false)
const conflictData = ref({
  folderId: '',
  file: null,
  fileName: '',
  existingFileId: null
})

// Check admin permission
if (!authStore.isAdmin) {
  notifyError('error.forbidden.adminOnly')
  router.push({ name: 'search' })
}

/**
 * Handles successful file upload
 */
function handleUploadSuccess(fileData) {
  recentUpload.value = fileData
  notifySuccess('File uploaded successfully')
}

/**
 * Handles upload conflict
 */
function handleUploadConflict(data) {
  conflictData.value = data
  showConflictDialog.value = true
}

/**
 * Handles conflict resolution
 */
function handleConflictResolved(data) {
  if (data.result.file) {
    recentUpload.value = data.result.file
  }
  showConflictDialog.value = false
}

/**
 * Handles conflict cancellation
 */
function handleConflictCancelled() {
  showConflictDialog.value = false
}

/**
 * Handles case folder creation
 */
function handleCaseFolderCreated(folderData) {
  recentCaseFolder.value = folderData
  notifySuccess('Case folder created successfully')
}

/**
 * Handles file deletion from FolderNavigator
 */
function handleFileDeleted() {
  // File was deleted, notification already shown by FolderNavigator
}

/**
 * Opens folder in Google Drive
 */
function handleOpenFolder(folderId) {
  const driveUrl = `https://drive.google.com/drive/folders/${folderId}`
  window.open(driveUrl, '_blank')
}

/**
 * Copies folder ID to clipboard
 */
function handleCopyFolderId(folderId) {
  copyToClipboard(folderId)
    .then(() => {
      notifySuccess('Folder ID copied to clipboard')
    })
    .catch(() => {
      notifyError('Failed to copy folder ID')
    })
}

/**
 * Downloads a file
 */
function handleDownloadFile(downloadUrl) {
  window.open(downloadUrl, '_blank')
}

/**
 * Formats bytes to human-readable format
 */
function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

/**
 * Navigates back to search page
 */
function handleBack() {
  router.push({ name: 'search' })
}

// Lifecycle
onMounted(() => {
  // Could load recent operations from localStorage if needed
})
</script>

<style scoped>
.file-management-page {
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  border-bottom: 2px solid var(--color-light-grey);
  padding-bottom: 1rem;
}

.recent-upload,
.recent-folder {
  animation: fadeIn 0.3s ease-in;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
