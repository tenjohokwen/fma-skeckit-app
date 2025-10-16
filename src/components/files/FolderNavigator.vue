<template>
  <div class="folder-navigator">
    <q-card flat bordered>
      <q-card-section>
        <!-- Breadcrumb Navigation -->
        <BreadcrumbNav
          class="q-mb-md"
          @navigate="handleBreadcrumbNavigate"
        />

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
            <template v-slot:action>
              <q-btn
                flat
                color="white"
                :label="$t('common.retry')"
                @click="loadFolderContents"
                icon="refresh"
              />
            </template>
          </q-banner>
        </div>

        <!-- Folder Contents -->
        <div v-else-if="folderContents">
          <!-- Summary -->
          <div class="q-mb-md text-body2 text-grey-7">
            {{ $t('files.navigate.summary', { folders: folderContents.folders?.length || 0, files: folderContents.files?.length || 0 }) }}
          </div>

          <!-- Folder Browser Component -->
          <FolderBrowser
            :folders="folderContents.folders || []"
            :files="folderContents.files || []"
            :loading="isLoading"
            @folder-click="handleFolderClick"
            @download="handleDownloadFile"
            @rename="handleRenameFile"
            @delete="handleDeleteFile"
            @delete-folder="handleDeleteFolder"
          />
        </div>
      </q-card-section>
    </q-card>

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

    <!-- Folder Delete Confirmation Dialog -->
    <FolderDeleteDialog
      v-model="showFolderDeleteDialog"
      :folder="folderToDelete"
      :deleting="isDeletingFolder"
      @confirm="confirmDeleteFolder"
      @cancel="showFolderDeleteDialog = false"
    />

    <!-- File Rename Dialog -->
    <FileRenameDialog
      v-model="showRenameDialog"
      :file="fileToRename"
      :renaming="isRenaming"
      @rename="confirmRenameFile"
      @cancel="showRenameDialog = false"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useQuasar } from 'quasar'
import { useFileOperations } from 'src/composables/useFileOperations'
import { useNavigation } from 'src/composables/useNavigation'
import { useFilesStore } from 'src/stores/files'
import BreadcrumbNav from 'src/components/files/BreadcrumbNav.vue'
import FolderBrowser from 'src/components/files/FolderBrowser.vue'
import FolderDeleteDialog from 'src/components/files/FolderDeleteDialog.vue'
import FileRenameDialog from 'src/components/files/FileRenameDialog.vue'

const { t } = useI18n()
const $q = useQuasar()
const { listFolderContents } = useFileOperations()
const { pushFolder } = useNavigation()
const filesStore = useFilesStore()

// Emit events
const emit = defineEmits(['file-deleted', 'folder-deleted', 'file-renamed'])

// State
const currentFolderId = ref('')
const folderContents = ref(null)
const error = ref(null)
const showDeleteDialog = ref(false)
const fileToDelete = ref(null)
const isDeleting = ref(false)
const showFolderDeleteDialog = ref(false)
const folderToDelete = ref(null)
const isDeletingFolder = ref(false)
const showRenameDialog = ref(false)
const fileToRename = ref(null)
const isRenaming = ref(false)
const isLoading = ref(false)

/**
 * Loads folder contents
 */
async function loadFolderContents() {
  if (!currentFolderId.value) {
    return
  }

  error.value = null
  folderContents.value = null
  isLoading.value = true

  try {
    const contents = await listFolderContents(currentFolderId.value.trim())
    folderContents.value = contents
  } catch (err) {
    console.error('Load folder contents failed:', err)
    error.value = err
  } finally {
    isLoading.value = false
  }
}

/**
 * Navigates to a subfolder
 */
function navigateToFolder(folderId, folderName = 'Folder') {
  currentFolderId.value = folderId

  // Update breadcrumb trail
  pushFolder({
    folderId: folderId,
    folderName: folderName,
    type: 'folder'
  })

  loadFolderContents()
}

/**
 * Handles breadcrumb navigation
 */
function handleBreadcrumbNavigate(breadcrumb) {
  currentFolderId.value = breadcrumb.folderId
  loadFolderContents()
}

/**
 * Handles folder click from FolderBrowser
 */
function handleFolderClick(folder) {
  navigateToFolder(folder.folderId, folder.name)
}

/**
 * Handles file download from FolderBrowser
 */
async function handleDownloadFile(file) {
  try {
    await filesStore.downloadFile(file.fileId)

    $q.notify({
      type: 'positive',
      message: t('files.download.success', { fileName: file.name }),
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
 * Handles file rename from FolderBrowser
 */
function handleRenameFile(file) {
  fileToRename.value = file
  showRenameDialog.value = true
}

/**
 * Confirms file rename with new name
 */
async function confirmRenameFile(data) {
  if (!fileToRename.value) {
    return
  }

  isRenaming.value = true

  try {
    await filesStore.renameFile(data.fileId, data.newName)

    $q.notify({
      type: 'positive',
      message: t('fileRename.success'),
      position: 'top'
    })

    // Close dialog
    showRenameDialog.value = false
    fileToRename.value = null

    // Reload folder contents to show new name
    loadFolderContents()

    // Emit event
    emit('file-renamed')
  } catch (err) {
    console.error('Rename failed:', err)
    $q.notify({
      type: 'negative',
      message: err.message || t('fileRename.error.generic'),
      position: 'top'
    })
  } finally {
    isRenaming.value = false
  }
}

/**
 * Handles file delete from FolderBrowser
 */
function handleDeleteFile(file) {
  fileToDelete.value = file
  showDeleteDialog.value = true
}

/**
 * Confirms file deletion
 */
async function confirmDeleteFile() {
  if (!fileToDelete.value) {
    return
  }

  isDeleting.value = true

  try {
    await filesStore.deleteFile(fileToDelete.value.fileId)

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
 * Handles folder delete from FolderBrowser
 */
function handleDeleteFolder(folder) {
  folderToDelete.value = folder
  showFolderDeleteDialog.value = true
}

/**
 * Confirms folder deletion with typed confirmation
 */
async function confirmDeleteFolder(data) {
  if (!folderToDelete.value) {
    return
  }

  isDeletingFolder.value = true

  try {
    await filesStore.deleteFolder(data.folderId, data.confirmation)

    $q.notify({
      type: 'positive',
      message: t('folderDelete.success'),
      position: 'top'
    })

    // Close dialog
    showFolderDeleteDialog.value = false
    folderToDelete.value = null

    // Reload folder contents
    loadFolderContents()

    // Emit event
    emit('folder-deleted')
  } catch (err) {
    console.error('Folder delete failed:', err)
    $q.notify({
      type: 'negative',
      message: err.message || t('folderDelete.error'),
      position: 'top'
    })
  } finally {
    isDeletingFolder.value = false
  }
}
</script>

<style scoped lang="scss">
.folder-navigator {
  max-width: 900px;
  margin: 0 auto;
}
</style>
