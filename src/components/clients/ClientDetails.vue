<template>
  <q-card flat bordered class="client-details">
    <q-card-section>
      <div class="row items-center justify-between">
        <div class="text-h6">{{ $t('client.details.personalInfo') }}</div>
        <!-- Edit Button (Admin Only) -->
        <q-btn
          v-if="isAdmin && !isEditMode"
          :label="$t('client.edit.editButton')"
          color="primary"
          flat
          dense
          icon="edit"
          @click="enterEditMode"
        />
      </div>
    </q-card-section>

    <q-separator />

    <q-card-section>
      <!-- View Mode -->
      <div v-if="!isEditMode" class="row q-col-gutter-md">
        <!-- First Name -->
        <div class="col-12 col-md-6">
          <q-field
            :label="$t('client.details.firstName')"
            stack-label
            borderless
            readonly
          >
            <template v-slot:control>
              <div class="text-body1">{{ client.firstName }}</div>
            </template>
          </q-field>
        </div>

        <!-- Last Name -->
        <div class="col-12 col-md-6">
          <q-field
            :label="$t('client.details.lastName')"
            stack-label
            borderless
            readonly
          >
            <template v-slot:control>
              <div class="text-body1">{{ client.lastName }}</div>
            </template>
          </q-field>
        </div>

        <!-- National ID -->
        <div class="col-12 col-md-6">
          <q-field
            :label="$t('client.details.nationalId')"
            stack-label
            borderless
            readonly
          >
            <template v-slot:control>
              <div class="text-body1">{{ client.nationalId }}</div>
            </template>
          </q-field>
        </div>

        <!-- Telephone -->
        <div class="col-12 col-md-6">
          <q-field
            :label="$t('client.details.telephone')"
            stack-label
            borderless
            readonly
          >
            <template v-slot:control>
              <div class="text-body1">
                <q-icon v-if="client.telephone" name="phone" size="xs" class="q-mr-xs" />
                {{ client.telephone || '-' }}
              </div>
            </template>
          </q-field>
        </div>

        <!-- Email -->
        <div class="col-12 col-md-6">
          <q-field
            :label="$t('client.details.email')"
            stack-label
            borderless
            readonly
          >
            <template v-slot:control>
              <div class="text-body1">
                <q-icon v-if="client.email" name="email" size="xs" class="q-mr-xs" />
                {{ client.email || '-' }}
              </div>
            </template>
          </q-field>
        </div>

        <!-- Created At -->
        <div class="col-12 col-md-6" v-if="client.createdAt">
          <q-field
            :label="$t('common.createdAt')"
            stack-label
            borderless
            readonly
          >
            <template v-slot:control>
              <div class="text-body2 text-grey-7">
                {{ formatDate(client.createdAt) }}
              </div>
            </template>
          </q-field>
        </div>

        <!-- Updated At -->
        <div class="col-12 col-md-6" v-if="client.updatedAt">
          <q-field
            :label="$t('common.updatedAt')"
            stack-label
            borderless
            readonly
          >
            <template v-slot:control>
              <div class="text-body2 text-grey-7">
                {{ formatDate(client.updatedAt) }}
              </div>
            </template>
          </q-field>
        </div>
      </div>

      <!-- Edit Mode -->
      <div v-else>
        <ClientEditForm
          :client="client"
          :is-saving="isSaving"
          @submit="handleSave"
          @cancel="exitEditMode"
        />
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup>
import { ref, computed, onBeforeUnmount } from 'vue'
import { date, useQuasar } from 'quasar'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from 'src/stores/authStore'
import { useClientStore } from 'src/stores/client'
import ClientEditForm from './ClientEditForm.vue'

// Props
const props = defineProps({
  client: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['client-updated'])

const $q = useQuasar()
const { t } = useI18n()
const authStore = useAuthStore()
const clientStore = useClientStore()

// State
const isEditMode = ref(false)
const isSaving = ref(false)

// Computed
const isAdmin = computed(() => {
  return authStore.user?.role === 'ROLE_ADMIN'
})

// Methods
function formatDate(timestamp) {
  if (!timestamp) return ''

  try {
    // Handle different timestamp formats
    let dateObj
    if (typeof timestamp === 'string') {
      dateObj = new Date(timestamp)
    } else if (typeof timestamp === 'number') {
      dateObj = new Date(timestamp)
    } else {
      dateObj = timestamp
    }

    return date.formatDate(dateObj, 'YYYY-MM-DD HH:mm')
  } catch {
    return timestamp
  }
}

function enterEditMode() {
  isEditMode.value = true
}

function exitEditMode() {
  isEditMode.value = false
}

async function handleSave(clientData) {
  isSaving.value = true

  try {
    const updatedClient = await clientStore.updateClient(props.client.clientId, clientData)

    $q.notify({
      type: 'positive',
      message: t('client.edit.success'),
      position: 'top'
    })

    // Exit edit mode
    isEditMode.value = false

    // Emit event to notify parent that client was updated
    emit('client-updated', updatedClient)
  } catch (err) {
    console.error('Failed to update client:', err)

    // Handle specific error types
    let errorMessage = t('client.edit.error.generic')

    if (err.msgKey === 'client.update.error.duplicateNationalId') {
      errorMessage = t('client.edit.error.duplicateNationalId')
    } else if (err.msgKey === 'client.update.error.validation') {
      errorMessage = t('client.edit.error.validation')
    } else if (err.msgKey === 'client.update.error.invalidEmail') {
      errorMessage = t('client.edit.error.invalidEmail')
    } else if (err.message) {
      errorMessage = err.message
    }

    $q.notify({
      type: 'negative',
      message: errorMessage,
      position: 'top'
    })
  } finally {
    isSaving.value = false
  }
}

// Warn user about unsaved changes when navigating away
onBeforeUnmount(() => {
  if (isEditMode.value) {
    // Note: Browser's beforeunload event should be handled in the page component
    // This is just for cleanup
  }
})
</script>

<style scoped lang="scss">
.client-details {
  .q-field {
    padding-bottom: 8px;
  }

  .text-body1 {
    font-weight: 500;
  }
}
</style>
