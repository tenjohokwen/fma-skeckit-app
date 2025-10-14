<template>
  <div class="folder-navigator">
    <q-card flat bordered>
      <q-card-section>
        <!-- Folder ID Input -->
        <div class="q-mb-md">
          <q-input
            v-model="currentFolderId"
            :label="$t('files.navigate.folderId')"
            outlined
            dense
            :disable="isLoading"
          >
            <template #prepend>
              <q-icon name="folder" />
            </template>
            <template #append>
              <q-btn
                flat
                dense
                icon="refresh"
                :loading="isLoading"
                :disable="!currentFolderId"
                @click="loadFolderContents"
              >
                <q-tooltip>{{ $t('files.navigate.reload') }}</q-tooltip>
              </q-btn>
            </template>
          </q-input>
        </div>

        <!-- Loading State -->
        <div v-if="isLoading && !folderContents" class="text-center q-my-md">
          <q-spinner color="primary" size="40px" />
          <div class="text-caption text-grey-7 q-mt-sm">{{ $t('common.loading') }}</div>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="q-my-md">
          <q-banner rounded class="bg-negative text-white">
            <template #avatar>
              <q-icon name="error" />
            </template>
            {{ error.message || $t('files.navigate.error') }}
          </q-banner>
        </div>

        <!-- Folder Contents -->
        <div v-else-if="folderContents">
          <!-- Summary -->
          <div class="q-mb-md text-body2 text-grey-7">
            {{ $t('files.navigate.summary', { folders: folderContents.folderCount, files: folderContents.fileCount }) }}
          </div>

          <!-- Folders List -->
          <div v-if="folderContents.folders.length > 0" class="q-mb-md">
            <div class="text-subtitle2 q-mb-sm">
              <q-icon name="folder" class="q-mr-xs" />
              {{ $t('files.navigate.folders') }}
            </div>
            <q-list bordered separator>
              <q-item
                v-for="folder in folderContents.folders"
                :key="folder.folderId"
                clickable
                v-ripple
                @click="navigateToFolder(folder.folderId)"
              >
                <q-item-section avatar>
                  <q-icon name="folder" color="amber" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{ folder.folderName }}</q-item-label>
                  <q-item-label caption>{{ folder.createdAt }}</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-icon name="chevron_right" />
                </q-item-section>
              </q-item>
            </q-list>
          </div>

          <!-- Files List -->
          <div v-if="folderContents.files.length > 0">
            <div class="text-subtitle2 q-mb-sm">
              <q-icon name="insert_drive_file" class="q-mr-xs" />
              {{ $t('files.navigate.files') }}
            </div>
            <q-list bordered separator>
              <q-item
                v-for="file in folderContents.files"
                :key="file.fileId"
              >
                <q-item-section avatar>
                  <q-icon :name="getFileIcon(file.mimeType)" color="blue" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{ file.fileName }}</q-item-label>
                  <q-item-label caption>
                    {{ formatFileSize(file.size) }} • {{ file.createdAt }}
                  </q-item-label>
                </q-item-section>
                <q-item-section side>
                  <div class="row q-gutter-xs">
                    <q-btn
                      flat
                      dense
                      round
                      icon="download"
                      color="primary"
                      @click="handleDownload(file)"
                    >
                      <q-tooltip>{{ $t('files.download') }}</q-tooltip>
                    </q-btn>
                    <q-btn
                      flat
                      dense
                      round
                      icon="delete"
                      color="negative"
                      @click="handleDelete(file)"
                    >
                      <q-tooltip>{{ $t('files.delete.title') }}</q-tooltip>
                    </q-btn>
                  </div>
                </q-item-section>
              </q-item>
            </q-list>
          </div>

          <!-- Empty State -->
          <div v-if="folderContents.folders.length === 0 && folderContents.files.length === 0" class="text-center q-my-lg">
            <q-icon name="folder_open" size="64px" color="grey-5" />
            <div class="text-h6 text-grey-7 q-mt-md">{{ $t('files.navigate.empty') }}</div>
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- Delete Confirmation Dialog -->
    <q-dialog v-model="showDeleteDialog" persistent>
      <q-card>
        <q-card-section>
          <div class="text-h6">{{ $t('files.delete.title') }}</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          {{ $t('files.delete.confirm') }}
          <div v-if="fileToDelete" class="q-mt-sm text-caption text-grey-7">
            <strong>{{ $t('files.upload.fileName') }}:</strong> {{ fileToDelete.fileName }}
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat :label="$t('common.cancel')" color="grey-7" @click="showDeleteDialog = false" />
          <q-btn
            unelevated
            :label="$t('files.delete.title')"
            color="negative"
            :loading="isDeleting"
            @click="confirmDelete"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useQuasar } from 'quasar'
import { useFileOperations } from 'src/composables/useFileOperations'

const { t } = useI18n()
const $q = useQuasar()
const { listFolderContents, getDownloadUrl, deleteFile, isLoading } = useFileOperations()

// Emit events
const emit = defineEmits(['file-deleted'])

// State
const currentFolderId = ref('')
const folderContents = ref(null)
const error = ref(null)
const showDeleteDialog = ref(false)
const fileToDelete = ref(null)
const isDeleting = ref(false)

/**
 * Loads folder contents
 */
async function loadFolderContents() {
  if (!currentFolderId.value) {
    return
  }

  error.value = null
  folderContents.value = null

  try {
    const contents = await listFolderContents(currentFolderId.value.trim())
    folderContents.value = contents
  } catch (err) {
    console.error('Load folder contents failed:', err)
    error.value = err
  }
}

/**
 * Navigates to a subfolder
 */
function navigateToFolder(folderId) {
  currentFolderId.value = folderId
  loadFolderContents()
}

/**
 * Handles file download
 */
async function handleDownload(file) {
  try {
    const downloadData = await getDownloadUrl(file.fileId)
    window.open(downloadData.downloadUrl, '_blank')

    $q.notify({
      type: 'positive',
      message: t('files.download.success', { fileName: file.fileName }),
      position: 'top'
    })
  } catch (err) {
    console.error('Download failed:', err)
    $q.notify({
      type: 'negative',
      message: err.message || t('files.download.error'),
      position: 'top'
    })
  }
}

/**
 * Shows delete confirmation dialog
 */
function handleDelete(file) {
  fileToDelete.value = file
  showDeleteDialog.value = true
}

/**
 * Confirms file deletion
 */
async function confirmDelete() {
  if (!fileToDelete.value) {
    return
  }

  isDeleting.value = true

  try {
    await deleteFile(fileToDelete.value.fileId)

    $q.notify({
      type: 'positive',
      message: t('files.delete.success'),
      position: 'top'
    })

    // Close dialog
    showDeleteDialog.value = false
    fileToDelete.value = null

    // Reload folder contents
    loadFolderContents()

    // Emit event
    emit('file-deleted')
  } catch (err) {
    console.error('Delete failed:', err)
    $q.notify({
      type: 'negative',
      message: err.message || t('files.delete.error'),
      position: 'top'
    })
  } finally {
    isDeleting.value = false
  }
}

/**
 * Gets icon for file type
 */
function getFileIcon(mimeType) {
  if (!mimeType) return 'insert_drive_file'

  if (mimeType.startsWith('image/')) return 'image'
  if (mimeType.startsWith('video/')) return 'videocam'
  if (mimeType.startsWith('audio/')) return 'audiotrack'
  if (mimeType.includes('pdf')) return 'picture_as_pdf'
  if (mimeType.includes('word')) return 'description'
  if (mimeType.includes('sheet') || mimeType.includes('excel')) return 'table_chart'
  if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) return 'slideshow'
  if (mimeType.includes('zip') || mimeType.includes('rar')) return 'folder_zip'

  return 'insert_drive_file'
}

/**
 * Formats file size
 */
function formatFileSize(bytes) {
  if (!bytes || bytes === 0) return '0 Bytes'

  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}
</script>

<style scoped lang="scss">
.folder-navigator {
  max-width: 900px;
  margin: 0 auto;
}
</style>
