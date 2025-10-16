<template>
  <q-form @submit.prevent="handleSubmit" class="q-gutter-md">
    <!-- First Name -->
    <q-input
      v-model="formData.firstName"
      :label="t('client.details.firstName')"
      :error="!!getErrorMessage('firstName')"
      :error-message="getErrorMessage('firstName')"
      :disable="isSaving"
      filled
      dense
      @blur="v$.firstName.$touch()"
    >
      <template v-slot:prepend>
        <q-icon name="person" />
      </template>
    </q-input>

    <!-- Last Name -->
    <q-input
      v-model="formData.lastName"
      :label="t('client.details.lastName')"
      :error="!!getErrorMessage('lastName')"
      :error-message="getErrorMessage('lastName')"
      :disable="isSaving"
      filled
      dense
      @blur="v$.lastName.$touch()"
    >
      <template v-slot:prepend>
        <q-icon name="person" />
      </template>
    </q-input>

    <!-- National ID -->
    <q-input
      v-model="formData.nationalId"
      :label="t('client.details.nationalId')"
      :error="!!getErrorMessage('nationalId')"
      :error-message="getErrorMessage('nationalId')"
      :disable="isSaving"
      filled
      dense
      @blur="v$.nationalId.$touch()"
    >
      <template v-slot:prepend>
        <q-icon name="badge" />
      </template>
    </q-input>

    <!-- Telephone -->
    <q-input
      v-model="formData.telephone"
      :label="t('client.details.telephone')"
      :error="!!getErrorMessage('telephone')"
      :error-message="getErrorMessage('telephone')"
      :disable="isSaving"
      filled
      dense
      @blur="v$.telephone.$touch()"
    >
      <template v-slot:prepend>
        <q-icon name="phone" />
      </template>
    </q-input>

    <!-- Email -->
    <q-input
      v-model="formData.email"
      :label="t('client.details.email')"
      :error="!!getErrorMessage('email')"
      :error-message="getErrorMessage('email')"
      :disable="isSaving"
      type="email"
      filled
      dense
      @blur="v$.email.$touch()"
    >
      <template v-slot:prepend>
        <q-icon name="email" />
      </template>
    </q-input>

    <!-- Action Buttons -->
    <div class="row q-gutter-sm q-mt-md">
      <q-btn
        type="submit"
        :label="t('client.edit.saveButton')"
        :loading="isSaving"
        :disable="isSaving"
        color="primary"
        icon="save"
      />
      <q-btn
        :label="t('client.edit.cancelButton')"
        :disable="isSaving"
        color="grey"
        flat
        icon="cancel"
        @click="handleCancel"
      />
    </div>
  </q-form>
</template>

<script setup>
import { reactive, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useQuasar } from 'quasar'
import { useClientValidation } from 'src/composables/useClientValidation'

const props = defineProps({
  client: {
    type: Object,
    required: true
  },
  isSaving: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['submit', 'cancel'])

const { t } = useI18n()
const $q = useQuasar()

// Form data (reactive copy of client data)
const formData = reactive({
  firstName: props.client.firstName || '',
  lastName: props.client.lastName || '',
  nationalId: props.client.nationalId || '',
  telephone: props.client.telephone || '',
  email: props.client.email || ''
})

// Validation
const { v$, getErrorMessage, validateAll } = useClientValidation(formData)

// Check if form has changes
const hasChanges = computed(() => {
  return (
    formData.firstName !== props.client.firstName ||
    formData.lastName !== props.client.lastName ||
    formData.nationalId !== props.client.nationalId ||
    formData.telephone !== (props.client.telephone || '') ||
    formData.email !== (props.client.email || '')
  )
})

/**
 * Handle form submission
 */
async function handleSubmit() {
  const isValid = await validateAll()

  if (!isValid) {
    $q.notify({
      type: 'negative',
      message: t('client.edit.error.validation'),
      position: 'top'
    })
    return
  }

  emit('submit', {
    firstName: String(formData.firstName || '').trim(),
    lastName: String(formData.lastName || '').trim(),
    nationalId: String(formData.nationalId || '').trim(),
    telephone: String(formData.telephone || '').trim(),
    email: String(formData.email || '').trim()
  })
}

/**
 * Handle cancel with unsaved changes warning
 */
function handleCancel() {
  if (hasChanges.value) {
    $q.dialog({
      title: t('common.confirm'),
      message: t('client.edit.unsavedChanges'),
      cancel: true,
      persistent: true
    }).onOk(() => {
      emit('cancel')
    })
  } else {
    emit('cancel')
  }
}

// Expose hasChanges for parent component
defineExpose({
  hasChanges
})
</script>

<style scoped>
.q-form {
  max-width: 600px;
}
</style>
