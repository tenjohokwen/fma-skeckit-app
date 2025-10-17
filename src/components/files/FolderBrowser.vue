<template>
  <div class="folder-browser">
    <!-- Loading State -->
    <div v-if="loading" class="loading-state text-center q-py-xl">
      <q-spinner-dots color="primary" size="50px" />
      <div class="text-body2 text-grey-7 q-mt-md">{{ $t('fileList.loading') }}</div>
    </div>

    <!-- Content -->
    <div v-else>
      <!-- Folders Section -->
      <div v-if="folders.length > 0" class="folders-section q-mb-md">
      <div class="section-header q-mb-sm">
        <q-icon name="folder" color="amber" size="sm" class="q-mr-xs" />
        <span class="text-subtitle2">{{ $t('fileList.foldersLabel') }}</span>
        <q-chip dense class="q-ml-xs" size="sm">{{ folders.length }}</q-chip>
      </div>

      <q-list bordered separator>
        <q-item
          v-for="folder in folders"
          :key="folder.folderId"
          clickable
          v-ripple
          @click="handleFolderClick(folder)"
          class="folder-item"
        >
          <q-item-section avatar>
            <q-icon :name="folderIcon" color="amber" size="md" />
          </q-item-section>

          <q-item-section>
            <q-item-label class="text-weight-medium">{{ folder.name }}</q-item-label>
            <q-item-label caption class="text-grey-7">
              <q-icon name="schedule" size="xs" class="q-mr-xs" />
              {{ formatDate(folder.lastModified) }}
            </q-item-label>
          </q-item-section>

          <q-item-section side>
            <div class="row items-center q-gutter-sm">
              <q-chip dense size="sm" color="grey-3" text-color="grey-8">
                {{ $t('fileList.itemCount', { count: folder.itemCount }) }}
              </q-chip>

              <q-btn
                v-if="canDelete"
                flat
                dense
                round
                icon="delete"
                color="negative"
                size="sm"
                @click.stop="handleFolderDelete(folder)"
              >
                <q-tooltip>{{ $t('folderDelete.button') }}</q-tooltip>
              </q-btn>

              <q-icon name="chevron_right" color="grey-5" />
            </div>
          </q-item-section>
        </q-item>
      </q-list>
    </div>

    <!-- Files Section -->
    <div v-if="files.length > 0" class="files-section">
      <div class="section-header q-mb-sm">
        <q-icon name="insert_drive_file" color="blue" size="sm" class="q-mr-xs" />
        <span class="text-subtitle2">{{ $t('fileList.filesLabel') }}</span>
        <q-chip dense class="q-ml-xs" size="sm">{{ files.length }}</q-chip>
      </div>

      <q-list bordered separator>
        <q-item
          v-for="file in files"
          :key="file.fileId"
          class="file-item"
        >
          <q-item-section avatar>
            <q-icon
              :name="getFileIcon(file.mimeType).icon"
              :color="getFileIcon(file.mimeType).color"
              size="md"
            />
          </q-item-section>

          <q-item-section>
            <q-item-label class="text-weight-medium">{{ file.name }}</q-item-label>
            <q-item-label caption class="text-grey-7">
              <span class="q-mr-md">
                <q-icon name="data_usage" size="xs" class="q-mr-xs" />
                {{ formatFileSize(file.size) }}
              </span>
              <span>
                <q-icon name="schedule" size="xs" class="q-mr-xs" />
                {{ formatDate(file.lastModified) }}
              </span>
            </q-item-label>
          </q-item-section>

          <q-item-section side>
            <div class="row q-gutter-xs">
              <q-btn
                v-if="canDownload"
                flat
                dense
                round
                icon="download"
                color="primary"
                size="sm"
                @click="handleDownload(file)"
              >
                <q-tooltip>{{ $t('fileDownload.button') }}</q-tooltip>
              </q-btn>

              <q-btn
                v-if="canRename"
                flat
                dense
                round
                icon="edit"
                color="grey-7"
                size="sm"
                @click="handleRename(file)"
              >
                <q-tooltip>{{ $t('fileRename.button') }}</q-tooltip>
              </q-btn>

              <q-btn
                v-if="canDelete"
                flat
                dense
                round
                icon="delete"
                color="negative"
                size="sm"
                @click="handleDelete(file)"
              >
                <q-tooltip>{{ $t('fileDelete.button') }}</q-tooltip>
              </q-btn>
            </div>
          </q-item-section>
        </q-item>
      </q-list>
    </div>

      <!-- Empty State -->
      <div
        v-if="folders.length === 0 && files.length === 0"
        class="empty-state text-center q-py-xl"
      >
        <q-icon name="folder_open" size="4rem" color="grey-4" />
        <div class="text-h6 text-grey-6 q-mt-md">{{ $t('fileList.empty') }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useFileIcons } from 'src/composables/useFileIcons'
import { useRoleAccess } from 'src/composables/useRoleAccess'

// Props
// eslint-disable-next-line no-unused-vars
const props = defineProps({
  folders: {
    type: Array,
    default: () => []
  },
  files: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  }
})

// Emits
const emit = defineEmits(['folderClick', 'fileClick', 'download', 'rename', 'delete', 'deleteFolder'])

// Composables
const { getIconForFile } = useFileIcons()
const { canDelete, canDownload, canRename } = useRoleAccess()

// Computed
const folderIcon = computed(() => 'folder')

// Methods

/**
 * Get icon and color for file type
 */
function getFileIcon(mimeType) {
  return getIconForFile(mimeType)
}

/**
 * Format file size to human-readable format
 */
function formatFileSize(bytes) {
  if (!bytes || bytes === 0) return '0 B'

  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

/**
 * Format date to localized string
 */
function formatDate(dateString) {
  if (!dateString) return ''

  try {
    const date = new Date(dateString)
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch {
    return dateString
  }
}

/**
 * Handle folder click
 */
function handleFolderClick(folder) {
  emit('folderClick', folder)
}

/**
 * Handle file download
 */
function handleDownload(file) {
  emit('download', file)
}

/**
 * Handle file rename
 */
function handleRename(file) {
  emit('rename', file)
}

/**
 * Handle file delete
 */
function handleDelete(file) {
  emit('delete', file)
}

/**
 * Handle folder delete
 */
function handleFolderDelete(folder) {
  emit('deleteFolder', folder)
}
</script>

<style scoped lang="scss">
.folder-browser {
  width: 100%;
}

.section-header {
  display: flex;
  align-items: center;
  padding: 8px 0;
}

.folder-item {
  transition: background-color 0.2s;

  &:hover {
    background-color: rgba(0, 0, 0, 0.03);
  }
}

.file-item {
  &:hover {
    background-color: rgba(0, 0, 0, 0.02);
  }
}

.empty-state {
  padding: 48px 16px;
}

// Mobile responsiveness
@media (max-width: 600px) {
  .file-item,
  .folder-item {
    :deep(.q-item__section--side) {
      padding-left: 8px;
    }
  }

  .section-header {
    font-size: 0.9rem;
  }
}
</style>
