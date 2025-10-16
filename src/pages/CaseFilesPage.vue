<template>
  <q-page padding>
    <div class="case-files-page">
      <!-- Page Header -->
      <div class="page-header q-mb-lg">
        <q-btn
          flat
          icon="arrow_back"
          :label="$t('common.back')"
          @click="handleBack"
          class="q-mb-md"
        />
        <h1 class="text-h4 q-mb-xs">{{ pageTitle }}</h1>
        <p class="text-body2 text-grey-7">{{ pageSubtitle }}</p>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="row justify-center q-py-xl">
        <q-spinner-dots color="primary" size="50px" />
        <div class="text-body2 text-grey-7 q-mt-md full-width text-center">
          {{ $t('common.loading') }}
        </div>
      </div>

      <!-- Error State -->
      <q-banner v-else-if="error" dense rounded class="bg-negative text-white q-mb-md">
        <template v-slot:avatar>
          <q-icon name="error" color="white" />
        </template>
        {{ error }}
        <template v-slot:action>
          <q-btn
            flat
            :label="$t('common.retry')"
            @click="loadCaseFolder"
          />
        </template>
      </q-banner>

      <!-- File Management Content -->
      <div v-else-if="caseFolderId" class="q-gutter-lg">
        <!-- File Upload Section -->
        <q-card flat bordered>
          <q-card-section>
            <div class="text-h6 q-mb-md">
              <q-icon name="cloud_upload" class="q-mr-sm" />
              {{ $t('files.upload.title') }}
            </div>
            <FileUploader
              :folder-id="caseFolderId"
              @upload-success="handleUploadSuccess"
              @upload-conflict="handleUploadConflict"
            />
          </q-card-section>
        </q-card>

        <!-- File Browser Section -->
        <q-card flat bordered>
          <q-card-section>
            <div class="row items-center q-mb-md">
              <div class="col">
                <div class="text-h6">
                  <q-icon name="folder_open" class="q-mr-sm" />
                  {{ $t('files.browse.title') }}
                </div>
              </div>
              <div class="col-auto">
                <q-btn
                  flat
                  dense
                  icon="refresh"
                  :loading="refreshing"
                  @click="refreshFiles"
                >
                  <q-tooltip>{{ $t('files.navigate.reload') }}</q-tooltip>
                </q-btn>
              </div>
            </div>

            <!-- Loading State -->
            <div v-if="loadingFiles" class="text-center q-py-lg">
              <q-spinner color="primary" size="40px" />
              <div class="text-caption text-grey-7 q-mt-sm">{{ $t('common.loading') }}</div>
            </div>

            <!-- File List -->
            <div v-else-if="folderContents">
              <div class="q-mb-md text-body2 text-grey-7">
                {{ $t('files.navigate.summary', {
                  folders: folderContents.folders?.length || 0,
                  files: folderContents.files?.length || 0
                }) }}
              </div>

              <FolderBrowser
                :folders="folderContents.folders || []"
                :files="folderContents.files || []"
                :loading="loadingFiles"
                @folder-click="handleFolderClick"
                @download="handleDownloadFile"
                @rename="handleRenameFile"
                @delete="handleDeleteFile"
              />
            </div>

            <!-- Empty State -->
            <div v-else class="text-center q-py-lg text-grey-7">
              <q-icon name="folder_open" size="64px" />
              <div class="text-h6 q-mt-md">{{ $t('files.browse.empty') }}</div>
              <div class="text-caption q-mt-sm">{{ $t('files.browse.emptyHint') }}</div>
            </div>
          </q-card-section>
        </q-card>
      </div>

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

      <!-- File Delete Confirmation Dialog -->
      <q-dialog v-model="showDeleteDialog" persistent>
        <q-card>
          <q-card-section>
            <div class="text-h6">{{ $t('files.delete.title') }}</div>
          </q-card-section>

          <q-card-section class="q-pt-none">
            {{ $t('files.delete.confirm') }}
            <div v-if="fileToDelete" class="q-mt-sm text-caption text-grey-7">
              <strong>{{ $t('files.upload.fileName') }}:</strong> {{ fileToDelete.name || fileToDelete.fileName }}
            </div>
          </q-card-section>

          <q-card-actions align="right">
            <q-btn flat :label="$t('common.cancel')" color="grey-7" @click="showDeleteDialog = false" />
            <q-btn
              unelevated
              :label="$t('files.delete.title')"
              color="negative"
              :loading="isDeleting"
              @click="confirmDeleteFile"
            />
          </q-card-actions>
        </q-card>
      </q-dialog>

      <!-- File Rename Dialog -->
      <FileRenameDialog
        v-model="showRenameDialog"
        :file="fileToRename"
        :renaming="isRenaming"
        @rename="confirmRenameFile"
        @cancel="showRenameDialog = false"
      />
    </div>
  </q-page>
</template>

<script setup>
/**
 * CaseFilesPage.vue
 *
 * Page for managing files within a specific case folder.
 * Allows users to upload, download, rename, and delete files.
 * Accessible to all authenticated users (not admin-only).
 *
 * Per constitution: Vue 3 Composition API with <script setup>
 */

import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useFileOperations } from 'src/composables/useFileOperations'
import { useFilesStore } from 'src/stores/files'
import { useNotifications } from 'src/composables/useNotifications'
import FileUploader from 'src/components/files/FileUploader.vue'
import FolderBrowser from 'src/components/files/FolderBrowser.vue'
import FileConflictDialog from 'src/components/files/FileConflictDialog.vue'
import FileRenameDialog from 'src/components/files/FileRenameDialog.vue'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const { listFolderContents } = useFileOperations()
const filesStore = useFilesStore()
const { notifySuccess, notifyError } = useNotifications()

// State
const loading = ref(false)
const loadingFiles = ref(false)
const refreshing = ref(false)
const error = ref(null)
const caseFolderId = ref(null)
const clientName = ref('')
const caseId = ref('')
const folderContents = ref(null)
const showConflictDialog = ref(false)
const conflictData = ref({
  folderId: '',
  file: null,
  fileName: '',
  existingFileId: null
})
const showDeleteDialog = ref(false)
const fileToDelete = ref(null)
const isDeleting = ref(false)
const showRenameDialog = ref(false)
const fileToRename = ref(null)
const isRenaming = ref(false)

// Computed
const pageTitle = computed(() => {
  if (caseId.value && clientName.value) {
    return `${caseId.value} - ${clientName.value}`
  }
  return t('files.case.title')
})

const pageSubtitle = computed(() => {
  return t('files.case.subtitle')
})

// Methods
async function loadCaseFolder() {
  // Extract params from route
  const folderId = route.params.folderId
  const caseName = route.query.caseId
  const client = route.query.clientName

  if (!folderId) {
    error.value = 'Folder ID is missing'
    return
  }

  loading.value = true
  error.value = null

  try {
    caseFolderId.value = folderId
    caseId.value = caseName || 'Case'
    clientName.value = client || ''

    // Load folder contents
    await loadFiles()
  } catch (err) {
    error.value = err.message || 'Failed to load case folder'
    notifyError(error.value)
  } finally {
    loading.value = false
  }
}

async function loadFiles() {
  if (!caseFolderId.value) {
    return
  }

  loadingFiles.value = true

  try {
    const contents = await listFolderContents(caseFolderId.value)
    folderContents.value = contents
  } catch (err) {
    console.error('Load files failed:', err)
    notifyError(err.message || 'Failed to load files')
  } finally {
    loadingFiles.value = false
  }
}

async function refreshFiles() {
  refreshing.value = true
  try {
    await loadFiles()
    notifySuccess('Files refreshed')
  } catch {
    notifyError('Failed to refresh files')
  } finally {
    refreshing.value = false
  }
}

function handleBack() {
  router.back()
}

function handleFolderClick(folder) {
  // Navigate to subfolder
  router.push({
    name: 'case-files',
    params: { folderId: folder.folderId },
    query: {
      caseId: folder.name,
      clientName: clientName.value
    }
  })
}

function handleUploadSuccess() {
  notifySuccess(t('files.upload.success'))
  // Refresh file list to show newly uploaded file
  refreshFiles()
}

function handleUploadConflict(data) {
  conflictData.value = data
  showConflictDialog.value = true
}

function handleConflictResolved(data) {
  if (data.result.file) {
    notifySuccess(t('files.upload.success'))
    refreshFiles()
  }
  showConflictDialog.value = false
}

function handleConflictCancelled() {
  showConflictDialog.value = false
}

async function handleDownloadFile(file) {
  try {
    await filesStore.downloadFile(file.fileId)
    notifySuccess(t('files.download.success', { fileName: file.name }))
  } catch (err) {
    console.error('Download failed:', err)
    notifyError(err.message || t('files.download.error'))
  }
}

function handleRenameFile(file) {
  fileToRename.value = file
  showRenameDialog.value = true
}

async function confirmRenameFile(data) {
  // data is an object with { fileId, newName }
  if (!data || !data.newName) {
    return
  }

  isRenaming.value = true

  try {
    await filesStore.renameFile(data.fileId, data.newName)
    notifySuccess(t('files.rename.success'))
    showRenameDialog.value = false
    fileToRename.value = null
    // Refresh file list
    await refreshFiles()
  } catch (err) {
    console.error('Rename failed:', err)
    notifyError(err.message || t('files.rename.error'))
  } finally {
    isRenaming.value = false
  }
}

function handleDeleteFile(file) {
  fileToDelete.value = file
  showDeleteDialog.value = true
}

async function confirmDeleteFile() {
  if (!fileToDelete.value) {
    return
  }

  isDeleting.value = true

  try {
    await filesStore.deleteFile(fileToDelete.value.fileId)
    notifySuccess(t('files.delete.success'))
    showDeleteDialog.value = false
    fileToDelete.value = null
    // Refresh file list
    await refreshFiles()
  } catch (err) {
    console.error('Delete failed:', err)
    notifyError(err.message || t('files.delete.error'))
  } finally {
    isDeleting.value = false
  }
}

// Lifecycle
onMounted(() => {
  loadCaseFolder()
})
</script>

<style scoped lang="scss">
.case-files-page {
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  border-bottom: 2px solid var(--q-color-grey-3);
  padding-bottom: 1rem;
}
</style>
