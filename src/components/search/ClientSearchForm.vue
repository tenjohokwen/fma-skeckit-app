<template>
  <q-card flat bordered class="client-search-form">
    <q-card-section>
      <div class="text-h6">{{ $t('client.search.title') }}</div>
      <div class="text-caption text-grey-7">
        {{ $t('client.search.subtitle') }}
      </div>
    </q-card-section>

    <q-separator />

    <q-card-section>
      <q-form @submit.prevent="handleSearch" class="q-gutter-md">
        <!-- First Name -->
        <q-input
          v-model="searchForm.firstName"
          :label="$t('client.search.firstName')"
          outlined
          dense
          clearable
          @update:model-value="onInputChange"
        >
          <template v-slot:prepend>
            <q-icon name="person" />
          </template>
        </q-input>

        <!-- Last Name -->
        <q-input
          v-model="searchForm.lastName"
          :label="$t('client.search.lastName')"
          outlined
          dense
          clearable
          @update:model-value="onInputChange"
        >
          <template v-slot:prepend>
            <q-icon name="person" />
          </template>
        </q-input>

        <!-- National ID -->
        <q-input
          v-model="searchForm.nationalId"
          :label="$t('client.search.nationalId')"
          outlined
          dense
          clearable
          @update:model-value="onInputChange"
        >
          <template v-slot:prepend>
            <q-icon name="badge" />
          </template>
        </q-input>

        <!-- Search Button -->
        <div class="row q-gutter-sm">
          <q-btn
            type="submit"
            color="primary"
            :label="$t('client.search.searchButton')"
            :loading="loading"
            :disable="!isFormValid"
            unelevated
            class="col"
          >
            <template v-slot:loading>
              <q-spinner-dots />
            </template>
          </q-btn>

          <q-btn
            v-if="hasValues"
            flat
            color="grey-7"
            :label="$t('common.clear')"
            @click="clearForm"
            icon="clear"
          />
        </div>

        <!-- Error Message -->
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
      </q-form>
    </q-card-section>
  </q-card>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'

// Props
defineProps({
  loading: {
    type: Boolean,
    default: false
  }
})

// Emits
const emit = defineEmits(['search', 'clear'])

// Composables
const { t } = useI18n()

// State
const searchForm = ref({
  firstName: '',
  lastName: '',
  nationalId: ''
})

const errorMessage = ref('')
let debounceTimer = null

// Computed
const isFormValid = computed(() => {
  const { firstName, lastName, nationalId } = searchForm.value
  return Boolean(
    firstName?.trim() || lastName?.trim() || nationalId?.trim()
  )
})

const hasValues = computed(() => {
  const { firstName, lastName, nationalId } = searchForm.value
  return Boolean(firstName || lastName || nationalId)
})

// Methods
function handleSearch() {
  errorMessage.value = ''

  if (!isFormValid.value) {
    errorMessage.value = t('client.search.error.missingCriteria')
    return
  }

  const searchData = {
    firstName: searchForm.value.firstName?.trim() || '',
    lastName: searchForm.value.lastName?.trim() || '',
    nationalId: searchForm.value.nationalId?.trim() || ''
  }

  emit('search', searchData)
}

function onInputChange() {
  // Clear error on input change
  errorMessage.value = ''

  // Debounce: trigger search after 300ms of no typing
  if (debounceTimer) {
    clearTimeout(debounceTimer)
  }

  if (isFormValid.value) {
    debounceTimer = setTimeout(() => {
      handleSearch()
    }, 300)
  }
}

function clearForm() {
  searchForm.value = {
    firstName: '',
    lastName: '',
    nationalId: ''
  }
  errorMessage.value = ''
  emit('clear')
}

// Expose methods for parent component
defineExpose({
  clearForm
})
</script>

<style scoped lang="scss">
.client-search-form {
  max-width: 600px;
  margin: 0 auto;
}
</style>
