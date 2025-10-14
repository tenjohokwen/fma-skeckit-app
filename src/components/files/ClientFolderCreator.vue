<template>
  <div class="client-folder-creator">
    <q-card flat bordered>
      <q-card-section>
        <div class="text-h6 q-mb-md">
          {{ $t('files.client.title') }}
        </div>

        <q-separator class="q-mb-md" />

        <!-- Search Section -->
        <div class="section q-mb-lg">
          <div class="section-title">
            <q-icon name="search" size="sm" class="q-mr-xs" />
            {{ $t('files.client.searchSection') }}
          </div>

          <div class="q-mb-sm text-caption text-grey-7">
            {{ $t('files.client.searchHint') }}
          </div>

          <div class="row q-col-gutter-md">
            <div class="col-12 col-sm-4">
              <FieldInput
                v-model="searchData.firstName"
                type="text"
                :label="$t('files.client.firstName')"
                icon="person"
                required
                :disable="isSearching || isCreating"
              />
            </div>
            <div class="col-12 col-sm-4">
              <FieldInput
                v-model="searchData.lastName"
                type="text"
                :label="$t('files.client.lastName')"
                icon="person"
                required
                :disable="isSearching || isCreating"
              />
            </div>
            <div class="col-12 col-sm-4">
              <FieldInput
                v-model="searchData.idCardNo"
                type="text"
                :label="$t('files.client.idCardNo')"
                icon="badge"
                required
                :disable="isSearching || isCreating"
              />
            </div>
          </div>

          <div class="q-mt-md">
            <q-btn
              color="primary"
              icon="search"
              :label="$t('files.client.searchButton')"
              :loading="isSearching"
              :disable="!canSearch || isCreating"
              @click="handleSearch"
            />
          </div>

          <!-- Search Results -->
          <div v-if="searchResults !== null" class="q-mt-md">
            <q-banner v-if="searchResults" rounded class="bg-positive text-white">
              <template #avatar>
                <q-icon name="check_circle" />
              </template>
              <div class="text-subtitle1">{{ $t('files.client.folderFound') }}</div>
              <div class="text-caption">
                {{ $t('files.client.folderPath') }}: {{ searchResults.folderPath }}
              </div>
              <div class="text-caption">
                {{ $t('files.client.createdAt') }}: {{ searchResults.createdAt }}
              </div>
            </q-banner>

            <q-banner v-else rounded class="bg-info text-white">
              <template #avatar>
                <q-icon name="info" />
              </template>
              <div class="text-subtitle1">{{ $t('files.client.folderNotFound') }}</div>
              <div class="text-caption">
                {{ $t('files.client.canCreate') }}
              </div>
            </q-banner>
          </div>
        </div>

        <!-- Create Section (only show if folder not found) -->
        <div v-if="searchResults === null || searchResults === undefined || !searchResults" class="section q-mb-lg">
          <div class="section-title">
            <q-icon name="create_new_folder" size="sm" class="q-mr-xs" />
            {{ $t('files.client.createSection') }}
          </div>

          <div class="q-mb-sm text-caption text-grey-7">
            {{ $t('files.client.createHint') }}
          </div>

          <div class="row q-col-gutter-md">
            <div class="col-12 col-sm-4">
              <FieldInput
                v-model="formData.firstName"
                type="text"
                :label="$t('files.client.firstName')"
                icon="person"
                required
                :disable="isCreating"
              />
            </div>
            <div class="col-12 col-sm-4">
              <FieldInput
                v-model="formData.lastName"
                type="text"
                :label="$t('files.client.lastName')"
                icon="person"
                required
                :disable="isCreating"
              />
            </div>
            <div class="col-12 col-sm-4">
              <FieldInput
                v-model="formData.idCardNo"
                type="text"
                :label="$t('files.client.idCardNo')"
                icon="badge"
                required
                :disable="isCreating"
              />
            </div>
            <div class="col-12 col-sm-6">
              <FieldInput
                v-model="formData.telephone"
                type="tel"
                :label="$t('files.client.telephone')"
                icon="phone"
                :disable="isCreating"
              />
            </div>
            <div class="col-12 col-sm-6">
              <FieldInput
                v-model="formData.email"
                type="email"
                :label="$t('files.client.email')"
                icon="email"
                :disable="isCreating"
              />
            </div>
          </div>

          <div class="q-mt-md row q-gutter-sm">
            <q-btn
              color="primary"
              icon="create_new_folder"
              :label="$t('files.client.createButton')"
              :loading="isCreating"
              :disable="!canCreate"
              @click="handleCreate"
            />
            <q-btn
              flat
              color="grey-7"
              icon="clear"
              :label="$t('common.cancel')"
              :disable="isCreating"
              @click="handleReset"
            />
          </div>
        </div>

        <!-- Folder Already Exists Dialog -->
        <q-dialog v-model="showExistsDialog" persistent>
          <q-card>
            <q-card-section>
              <div class="text-h6">{{ $t('files.client.existsDialog.title') }}</div>
            </q-card-section>

            <q-card-section class="q-pt-none">
              {{ $t('files.client.existsDialog.message') }}
            </q-card-section>

            <q-card-actions align="right">
              <q-btn
                flat
                :label="$t('common.close')"
                color="primary"
                @click="showExistsDialog = false"
              />
            </q-card-actions>
          </q-card>
        </q-dialog>
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
const { searchClientFolder, createClientFolder, searchResults, isSearching, isCreating, folderExists, reset } = useFileOperations()

// Emit events
const emit = defineEmits(['folder-created', 'folder-found'])

// Search form data
const searchData = ref({
  firstName: '',
  lastName: '',
  idCardNo: ''
})

// Create form data
const formData = ref({
  firstName: '',
  lastName: '',
  idCardNo: '',
  telephone: '',
  email: ''
})

// Dialog state
const showExistsDialog = ref(false)

// Computed properties
const canSearch = computed(() => {
  return searchData.value.firstName.trim() !== '' &&
         searchData.value.lastName.trim() !== '' &&
         searchData.value.idCardNo.trim() !== ''
})

const canCreate = computed(() => {
  return formData.value.firstName.trim() !== '' &&
         formData.value.lastName.trim() !== '' &&
         formData.value.idCardNo.trim() !== ''
})

/**
 * Handles search for client folder
 */
async function handleSearch() {
  try {
    const result = await searchClientFolder(
      searchData.value.firstName.trim(),
      searchData.value.lastName.trim(),
      searchData.value.idCardNo.trim()
    )

    if (result) {
      // Folder found
      emit('folder-found', result)
      $q.notify({
        type: 'positive',
        message: t('files.client.searchSuccess'),
        position: 'top'
      })

      // Pre-fill create form if folder not found (in case user wants to create)
      formData.value = {
        firstName: searchData.value.firstName,
        lastName: searchData.value.lastName,
        idCardNo: searchData.value.idCardNo,
        telephone: '',
        email: ''
      }
    } else {
      // Folder not found - pre-fill create form
      formData.value = {
        firstName: searchData.value.firstName,
        lastName: searchData.value.lastName,
        idCardNo: searchData.value.idCardNo,
        telephone: '',
        email: ''
      }
    }
  } catch (error) {
    console.error('Search failed:', error)
    $q.notify({
      type: 'negative',
      message: error.message || t('files.client.searchError'),
      position: 'top'
    })
  }
}

/**
 * Handles create client folder
 */
async function handleCreate() {
  try {
    const result = await createClientFolder(formData.value)

    // Success
    emit('folder-created', result)
    $q.notify({
      type: 'positive',
      message: t('files.client.createSuccess'),
      position: 'top'
    })

    // Reset form
    handleReset()
  } catch (error) {
    console.error('Create failed:', error)

    // Check if folder already exists
    if (folderExists.value) {
      showExistsDialog.value = true
    } else {
      $q.notify({
        type: 'negative',
        message: error.message || t('files.client.createError'),
        position: 'top'
      })
    }
  }
}

/**
 * Resets all forms
 */
function handleReset() {
  searchData.value = {
    firstName: '',
    lastName: '',
    idCardNo: ''
  }

  formData.value = {
    firstName: '',
    lastName: '',
    idCardNo: '',
    telephone: '',
    email: ''
  }

  reset()
}
</script>

<style scoped lang="scss">
.client-folder-creator {
  max-width: 900px;
  margin: 0 auto;
}

.section {
  padding: 16px;
  background-color: rgba(0, 0, 0, 0.02);
  border-radius: 8px;
}

.section-title {
  font-size: 16px;
  font-weight: 500;
  color: #1976d2;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
}
</style>
