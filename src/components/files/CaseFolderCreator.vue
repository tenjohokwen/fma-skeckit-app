<template>
  <div class="case-folder-creator">
    <q-card flat bordered>
      <q-card-section>
        <div class="text-h6 q-mb-md">
          {{ $t('files.caseFolder.title') }}
        </div>

        <q-separator class="q-mb-md" />

        <div class="q-mb-sm text-caption text-grey-7">
          {{ $t('files.caseFolder.hint') }}
        </div>

        <div class="row q-col-gutter-md">
          <div class="col-12 col-sm-6">
            <FieldInput
              v-model="formData.clientFolderId"
              type="text"
              :label="$t('files.caseFolder.clientFolderId')"
              icon="folder"
              required
              :disable="isCreating"
            />
          </div>
          <div class="col-12 col-sm-6">
            <FieldInput
              v-model="formData.caseId"
              type="text"
              :label="$t('files.caseFolder.caseId')"
              icon="assignment"
              required
              :disable="isCreating"
            />
          </div>
        </div>

        <div class="q-mt-md row q-gutter-sm">
          <q-btn
            color="primary"
            icon="create_new_folder"
            :label="$t('files.caseFolder.createButton')"
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

        <!-- Folder Already Exists Dialog -->
        <q-dialog v-model="showExistsDialog" persistent>
          <q-card>
            <q-card-section>
              <div class="text-h6">{{ $t('files.caseFolder.existsDialog.title') }}</div>
            </q-card-section>

            <q-card-section class="q-pt-none">
              {{ $t('files.caseFolder.existsDialog.message') }}
              <div v-if="existingFolderId" class="q-mt-sm text-caption text-grey-7">
                {{ $t('files.caseFolder.existingFolderId') }}: {{ existingFolderId }}
              </div>
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
const { createCaseFolder, isCreating } = useFileOperations()

// Emit events
const emit = defineEmits(['folder-created'])

// Form data
const formData = ref({
  clientFolderId: '',
  caseId: ''
})

// Dialog state
const showExistsDialog = ref(false)
const existingFolderId = ref(null)

// Computed properties
const canCreate = computed(() => {
  return formData.value.clientFolderId.trim() !== '' &&
         formData.value.caseId.trim() !== ''
})

/**
 * Handles create case folder
 */
async function handleCreate() {
  try {
    const result = await createCaseFolder(
      formData.value.clientFolderId.trim(),
      formData.value.caseId.trim()
    )

    // Success
    emit('folder-created', result)
    $q.notify({
      type: 'positive',
      message: t('files.caseFolder.createSuccess'),
      position: 'top'
    })

    // Reset form
    handleReset()
  } catch (error) {
    console.error('Create case folder failed:', error)

    // Check if folder already exists
    if (error.status === 400 && error.msgKey === 'file.casefolder.create.error.exists') {
      existingFolderId.value = error.data?.existingFolderId || null
      showExistsDialog.value = true
    } else {
      $q.notify({
        type: 'negative',
        message: error.message || t('files.caseFolder.createError'),
        position: 'top'
      })
    }
  }
}

/**
 * Resets the form
 */
function handleReset() {
  formData.value = {
    clientFolderId: '',
    caseId: ''
  }
  existingFolderId.value = null
}
</script>

<style scoped lang="scss">
.case-folder-creator {
  max-width: 700px;
  margin: 0 auto;
}
</style>
