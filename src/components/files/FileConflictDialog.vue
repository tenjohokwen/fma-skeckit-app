<template>
  <q-dialog v-model="showDialog" persistent>
    <q-card style="min-width: 400px">
      <q-card-section>
        <div class="text-h6">
          <q-icon name="warning" color="warning" class="q-mr-sm" />
          {{ $t('files.conflict.title') }}
        </div>
      </q-card-section>

      <q-card-section class="q-pt-none">
        <p>{{ $t('files.conflict.message') }}</p>
        <div class="text-caption text-grey-7 q-mb-md">
          <strong>{{ $t('files.conflict.fileName') }}:</strong> {{ fileName }}
        </div>

        <div class="conflict-options">
          <q-list bordered separator>
            <q-item
              clickable
              v-ripple
              :active="selectedOption === 'overwrite'"
              active-class="bg-blue-1"
              @click="selectedOption = 'overwrite'"
            >
              <q-item-section avatar>
                <q-radio v-model="selectedOption" val="overwrite" color="primary" />
              </q-item-section>
              <q-item-section>
                <q-item-label>{{ $t('files.conflict.options.overwrite.title') }}</q-item-label>
                <q-item-label caption>
                  {{ $t('files.conflict.options.overwrite.description') }}
                </q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-icon name="sync" color="warning" />
              </q-item-section>
            </q-item>

            <q-item
              clickable
              v-ripple
              :active="selectedOption === 'rename'"
              active-class="bg-blue-1"
              @click="selectedOption = 'rename'"
            >
              <q-item-section avatar>
                <q-radio v-model="selectedOption" val="rename" color="primary" />
              </q-item-section>
              <q-item-section>
                <q-item-label>{{ $t('files.conflict.options.rename.title') }}</q-item-label>
                <q-item-label caption>
                  {{ $t('files.conflict.options.rename.description') }}
                </q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-icon name="drive_file_rename_outline" color="primary" />
              </q-item-section>
            </q-item>

            <q-item
              clickable
              v-ripple
              :active="selectedOption === 'cancel'"
              active-class="bg-blue-1"
              @click="selectedOption = 'cancel'"
            >
              <q-item-section avatar>
                <q-radio v-model="selectedOption" val="cancel" color="primary" />
              </q-item-section>
              <q-item-section>
                <q-item-label>{{ $t('files.conflict.options.cancel.title') }}</q-item-label>
                <q-item-label caption>
                  {{ $t('files.conflict.options.cancel.description') }}
                </q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-icon name="cancel" color="negative" />
              </q-item-section>
            </q-item>
          </q-list>
        </div>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn
          flat
          :label="$t('common.cancel')"
          color="grey-7"
          @click="handleCancel"
        />
        <q-btn
          unelevated
          :label="$t('common.continue')"
          color="primary"
          :disable="!selectedOption"
          :loading="isResolving"
          @click="handleContinue"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useQuasar } from 'quasar'
import { useFileOperations } from 'src/composables/useFileOperations'

const { t } = useI18n()
const $q = useQuasar()
const { resolveFileConflict } = useFileOperations()

// Props
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  folderId: {
    type: String,
    required: true
  },
  file: {
    type: File,
    default: null
  },
  fileName: {
    type: String,
    required: true
  },
  existingFileId: {
    type: String,
    default: null
  }
})

// Emit events
const emit = defineEmits(['update:modelValue', 'resolved', 'cancelled'])

// State
const showDialog = ref(props.modelValue)
const selectedOption = ref('rename') // Default to rename (safest option)
const isResolving = ref(false)

// Watch modelValue prop
watch(() => props.modelValue, (newVal) => {
  showDialog.value = newVal
  if (newVal) {
    // Reset selection when dialog opens
    selectedOption.value = 'rename'
  }
})

// Watch showDialog to update modelValue
watch(showDialog, (newVal) => {
  emit('update:modelValue', newVal)
})

/**
 * Handles cancel button
 */
function handleCancel() {
  showDialog.value = false
  emit('cancelled')
}

/**
 * Handles continue button
 */
async function handleContinue() {
  if (!selectedOption.value) {
    return
  }

  // If user chose to cancel the upload
  if (selectedOption.value === 'cancel') {
    showDialog.value = false
    emit('cancelled')
    $q.notify({
      type: 'info',
      message: t('files.conflict.cancelled'),
      position: 'top'
    })
    return
  }

  // Resolve the conflict
  isResolving.value = true

  try {
    const result = await resolveFileConflict(
      props.folderId,
      props.file,
      selectedOption.value
    )

    // Success
    showDialog.value = false
    emit('resolved', {
      resolution: selectedOption.value,
      result: result
    })

    // Show success message
    if (selectedOption.value === 'overwrite') {
      $q.notify({
        type: 'positive',
        message: t('files.conflict.overwriteSuccess'),
        position: 'top'
      })
    } else if (selectedOption.value === 'rename') {
      $q.notify({
        type: 'positive',
        message: t('files.conflict.renameSuccess', { fileName: result.file.fileName }),
        position: 'top'
      })
    }
  } catch (error) {
    console.error('Resolve conflict failed:', error)
    $q.notify({
      type: 'negative',
      message: error.message || t('files.conflict.error'),
      position: 'top'
    })
  } finally {
    isResolving.value = false
  }
}
</script>

<style scoped lang="scss">
.conflict-options {
  margin-top: 16px;
}
</style>
