<template>
  <q-form @submit.prevent="handleSubmit" class="client-form">
    <div class="q-gutter-md">
      <!-- First Name -->
      <q-input
        v-model="formData.firstName"
        :label="$t('client.create.firstName') + ' *'"
        outlined
        dense
        :rules="[requiredRule, maxLengthRule(100)]"
        lazy-rules
        @blur="v$.firstName.$touch"
      >
        <template v-slot:prepend>
          <q-icon name="person" />
        </template>
      </q-input>

      <!-- Last Name -->
      <q-input
        v-model="formData.lastName"
        :label="$t('client.create.lastName') + ' *'"
        outlined
        dense
        :rules="[requiredRule, maxLengthRule(100)]"
        lazy-rules
        @blur="v$.lastName.$touch"
      >
        <template v-slot:prepend>
          <q-icon name="person" />
        </template>
      </q-input>

      <!-- National ID -->
      <q-input
        v-model="formData.nationalId"
        :label="$t('client.create.nationalId') + ' *'"
        outlined
        dense
        :rules="[requiredRule, maxLengthRule(50)]"
        lazy-rules
        @blur="v$.nationalId.$touch"
      >
        <template v-slot:prepend>
          <q-icon name="badge" />
        </template>
      </q-input>

      <!-- Telephone -->
      <q-input
        v-model="formData.telephone"
        :label="$t('client.create.telephone')"
        outlined
        dense
        :rules="[maxLengthRule(20)]"
        lazy-rules
        type="tel"
      >
        <template v-slot:prepend>
          <q-icon name="phone" />
        </template>
      </q-input>

      <!-- Email -->
      <q-input
        v-model="formData.email"
        :label="$t('client.create.email')"
        outlined
        dense
        :rules="[emailRule, maxLengthRule(100)]"
        lazy-rules
        type="email"
      >
        <template v-slot:prepend>
          <q-icon name="email" />
        </template>
      </q-input>

      <!-- Form Buttons -->
      <div class="row q-gutter-sm justify-end">
        <q-btn
          flat
          :label="$t('common.cancel')"
          color="grey-7"
          @click="handleCancel"
          :disable="loading"
        />
        <q-btn
          type="submit"
          :label="$t('client.create.createButton')"
          color="primary"
          unelevated
          :loading="loading"
          :disable="!isFormValid"
        >
          <template v-slot:loading>
            <q-spinner-dots />
          </template>
        </q-btn>
      </div>

      <!-- Error Display -->
      <q-banner
        v-if="errorMessage"
        dense
        rounded
        class="bg-negative text-white"
      >
        <template v-slot:avatar>
          <q-icon name="error" color="white" />
        </template>
        {{ errorMessage }}
      </q-banner>
    </div>
  </q-form>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useVuelidate } from '@vuelidate/core'
import { required, email, maxLength } from '@vuelidate/validators'

// Props
defineProps({
  loading: {
    type: Boolean,
    default: false
  }
})

// Emits
const emit = defineEmits(['submit', 'cancel'])

// Composables
const { t } = useI18n()

// State
const formData = ref({
  firstName: '',
  lastName: '',
  nationalId: '',
  telephone: '',
  email: ''
})

const errorMessage = ref('')

// Validation rules
const rules = {
  firstName: { required, maxLength: maxLength(100) },
  lastName: { required, maxLength: maxLength(100) },
  nationalId: { required, maxLength: maxLength(50) },
  telephone: { maxLength: maxLength(20) },
  email: { email, maxLength: maxLength(100) }
}

const v$ = useVuelidate(rules, formData)

// Computed
const isFormValid = computed(() => {
  return formData.value.firstName.trim() &&
         formData.value.lastName.trim() &&
         formData.value.nationalId.trim()
})

// Quasar validation rule functions
function requiredRule(val) {
  return (val && val.trim().length > 0) || t('validation.required')
}

function maxLengthRule(max) {
  return (val) => {
    if (!val) return true
    return val.length <= max || t('validation.maxLength', { max })
  }
}

function emailRule(val) {
  if (!val) return true
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(val) || t('validation.email.invalid')
}

// Methods
async function handleSubmit() {
  errorMessage.value = ''

  // Validate form
  const isValid = await v$.value.$validate()
  if (!isValid) {
    errorMessage.value = t('client.create.error.missingFields')
    return
  }

  // Emit submit event with form data
  const submitData = {
    firstName: formData.value.firstName.trim(),
    lastName: formData.value.lastName.trim(),
    nationalId: formData.value.nationalId.trim(),
    telephone: formData.value.telephone.trim(),
    email: formData.value.email.trim()
  }

  emit('submit', submitData)
}

function handleCancel() {
  resetForm()
  emit('cancel')
}

function resetForm() {
  formData.value = {
    firstName: '',
    lastName: '',
    nationalId: '',
    telephone: '',
    email: ''
  }
  v$.value.$reset()
  errorMessage.value = ''
}

// Expose methods for parent component
defineExpose({
  resetForm
})
</script>

<style scoped lang="scss">
.client-form {
  max-width: 600px;
}
</style>
