<template>
  <q-page padding>
    <div class="client-management-page">
      <!-- Page Header -->
      <div class="page-header q-mb-lg">
        <div class="row items-center">
          <div class="col">
            <h1 class="text-h4 q-mb-xs">{{ $t('files.client.pageTitle') }}</h1>
            <p class="text-body2 text-grey-7">{{ $t('files.client.pageSubtitle') }}</p>
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

      <!-- Client Folder Creator Component -->
      <ClientFolderCreator
        @folder-created="handleFolderCreated"
        @folder-found="handleFolderFound"
      />

      <!-- Recent Folders Section (optional - shows last created/found folder) -->
      <div v-if="recentFolder" class="recent-folder q-mt-lg">
        <q-card flat bordered>
          <q-card-section>
            <div class="text-h6 q-mb-md">
              <q-icon name="folder" size="sm" class="q-mr-xs" />
              {{ $t('files.client.recentFolder') }}
            </div>

            <q-separator class="q-mb-md" />

            <div class="row q-col-gutter-md">
              <div class="col-12 col-sm-6">
                <div class="text-caption text-grey-7">{{ $t('files.client.folderName') }}</div>
                <div class="text-body1">{{ recentFolder.folderName }}</div>
              </div>
              <div class="col-12 col-sm-6">
                <div class="text-caption text-grey-7">{{ $t('files.client.folderPath') }}</div>
                <div class="text-body1">{{ recentFolder.folderPath }}</div>
              </div>
              <div class="col-12 col-sm-6">
                <div class="text-caption text-grey-7">{{ $t('files.client.folderId') }}</div>
                <div class="text-body1 text-grey-8" style="word-break: break-all;">
                  {{ recentFolder.folderId }}
                </div>
              </div>
              <div class="col-12 col-sm-6">
                <div class="text-caption text-grey-7">{{ $t('files.client.createdAt') }}</div>
                <div class="text-body1">{{ recentFolder.createdAt }}</div>
              </div>
              <div v-if="recentFolder.createdBy" class="col-12 col-sm-6">
                <div class="text-caption text-grey-7">{{ $t('files.client.createdBy') }}</div>
                <div class="text-body1">{{ recentFolder.createdBy }}</div>
              </div>
            </div>

            <!-- Action buttons for recent folder -->
            <div class="q-mt-md row q-gutter-sm">
              <q-btn
                flat
                color="primary"
                icon="folder_open"
                :label="$t('files.client.openFolder')"
                @click="handleOpenFolder(recentFolder.folderId)"
              />
              <q-btn
                flat
                color="grey-7"
                icon="link"
                :label="$t('files.client.copyFolderId')"
                @click="handleCopyFolderId(recentFolder.folderId)"
              />
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup>
/**
 * ClientManagementPage.vue
 *
 * Page for managing client folders (admin only).
 * Integrates ClientFolderCreator component.
 *
 * Per constitution: Vue 3 Composition API with <script setup>
 */

import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from 'src/stores/authStore'
import { useNotifications } from 'src/composables/useNotifications'
import { copyToClipboard } from 'quasar'
import ClientFolderCreator from 'src/components/files/ClientFolderCreator.vue'

const router = useRouter()
const authStore = useAuthStore()
const { notifySuccess, notifyError } = useNotifications()

// State
const recentFolder = ref(null)

// Check admin permission
if (!authStore.isAdmin) {
  notifyError('Admin role required')
  router.push({ name: 'search' })
}

/**
 * Handles folder created event
 */
function handleFolderCreated(folderData) {
  recentFolder.value = folderData
  notifySuccess('Client folder created successfully')
}

/**
 * Handles folder found event
 */
function handleFolderFound(folderData) {
  recentFolder.value = folderData
}

/**
 * Opens folder in Google Drive (new tab)
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
 * Navigates back to search page
 */
function handleBack() {
  router.push({ name: 'search' })
}

// Lifecycle
onMounted(() => {
  // Could load recent folders from localStorage or API if needed
})
</script>

<style scoped>
.client-management-page {
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  border-bottom: 2px solid var(--color-light-grey);
  padding-bottom: 1rem;
}

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
