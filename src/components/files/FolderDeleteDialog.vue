<template>
  <q-dialog v-model="isOpen" persistent>
    <q-card style="min-width: 400px">
      <q-card-section>
        <div class="text-h6 text-negative">
          <q-icon name="warning" class="q-mr-sm" />
          {{ $t('folderDelete.confirmTitle') }}
        </div>
      </q-card-section>

      <q-card-section class="q-pt-none">
        <p class="text-body2">
          {{ $t('folderDelete.confirmMessage') }}
        </p>

        <div v-if="folder" class="q-my-md q-pa-md bg-grey-2 rounded-borders">
          <div class="text-caption text-grey-8">
            <strong>{{ $t('files.caseFolder.folderName') }}:</strong> {{ folder.name }}
          </div>
          <div v-if="folder.itemCount !== undefined" class="text-caption text-grey-8 q-mt-xs">
            <strong>{{ $t('fileList.itemCount', { count: folder.itemCount }) }}</strong>
          </div>
        </div>

        <div class="q-mt-md">
          <p class="text-body2 text-weight-medium">
            {{ $t('folderDelete.typeDelete') }}
          </p>
          <q-input
            v-model="confirmationText"
            outlined
            dense
            :placeholder="$t('folderDelete.confirm')"
            :error="showError"
            :error-message="errorMessage"
            @keyup.enter="handleConfirm"
            autofocus
            class="q-mt-sm"
          >
            <template v-slot:prepend>
              <q-icon name="keyboard" />
            </template>
          </q-input>
        </div>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn
          flat
          :label="$t('common.cancel')"
          color="grey-7"
          @click="handleCancel"
          :disable="deleting"
        />
        <q-btn
          unelevated
          :label="$t('folderDelete.button')"
          color="negative"
          :loading="deleting"
          :disable="!isConfirmationValid"
          @click="handleConfirm"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'

// Props
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  folder: {
    type: Object,
    default: null
  },
  deleting: {
    type: Boolean,
    default: false
  }
})

// Emits
const emit = defineEmits(['update:modelValue', 'confirm', 'cancel'])

// Composables
const { t } = useI18n()

// State
const confirmationText = ref('')
const showError = ref(false)
const errorMessage = ref('')

// Computed
const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const isConfirmationValid = computed(() => {
  return confirmationText.value === 'DELETE'
})

// Watchers
watch(() => props.modelValue, (newValue) => {
  if (newValue) {
    // Reset state when dialog opens
    confirmationText.value = ''
    showError.value = false
    errorMessage.value = ''
  }
})

// Methods
function handleConfirm() {
  if (!isConfirmationValid.value) {
    showError.value = true
    errorMessage.value = t('folderDelete.invalidConfirmation')
    return
  }

  emit('confirm', {
    folderId: props.folder?.folderId,
    confirmation: confirmationText.value
  })
}

function handleCancel() {
  confirmationText.value = ''
  showError.value = false
  errorMessage.value = ''
  emit('cancel')
  emit('update:modelValue', false)
}
</script>

<style scoped lang="scss">
.rounded-borders {
  border-radius: 4px;
}
</style>
