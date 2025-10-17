<template>
  <q-card flat bordered class="client-details">
    <q-card-section>
      <div class="row items-center">
        <div class="col">
          <div class="text-h6">{{ $t('client.details.personalInfo') }}</div>
        </div>
        <div class="col-auto">
          <q-btn
            v-if="!isEditing && canEdit"
            flat
            dense
            round
            icon="edit"
            color="primary"
            @click="startEditing"
          >
            <q-tooltip>Edit Personal Information</q-tooltip>
          </q-btn>
        </div>
      </div>
    </q-card-section>

    <q-separator />

    <q-card-section>
      <div class="row q-col-gutter-md">
        <!-- First Name -->
        <div class="col-12 col-md-6">
          <q-input
            v-if="isEditing"
            v-model="editForm.firstName"
            :label="$t('client.details.firstName')"
            outlined
            dense
            :disable="isSaving"
            :rules="[val => !!val || 'First name is required']"
          />
          <q-field
            v-else
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
          <q-input
            v-if="isEditing"
            v-model="editForm.lastName"
            :label="$t('client.details.lastName')"
            outlined
            dense
            :disable="isSaving"
            :rules="[val => !!val || 'Last name is required']"
          />
          <q-field
            v-else
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

        <!-- National ID (not editable) -->
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
          <q-input
            v-if="isEditing"
            v-model="editForm.telephone"
            :label="$t('client.details.telephone')"
            outlined
            dense
            :disable="isSaving"
          >
            <template v-slot:prepend>
              <q-icon name="phone" />
            </template>
          </q-input>
          <q-field
            v-else-if="client.telephone"
            :label="$t('client.details.telephone')"
            stack-label
            borderless
            readonly
          >
            <template v-slot:control>
              <div class="text-body1">
                <q-icon name="phone" size="xs" class="q-mr-xs" />
                {{ client.telephone }}
              </div>
            </template>
          </q-field>
        </div>

        <!-- Email -->
        <div class="col-12 col-md-6">
          <q-input
            v-if="isEditing"
            v-model="editForm.email"
            type="email"
            :label="$t('client.details.email')"
            outlined
            dense
            :disable="isSaving"
          >
            <template v-slot:prepend>
              <q-icon name="email" />
            </template>
          </q-input>
          <q-field
            v-else-if="client.email"
            :label="$t('client.details.email')"
            stack-label
            borderless
            readonly
          >
            <template v-slot:control>
              <div class="text-body1">
                <q-icon name="email" size="xs" class="q-mr-xs" />
                {{ client.email }}
              </div>
            </template>
          </q-field>
        </div>

        <!-- Created At -->
        <div class="col-12 col-md-6" v-if="client.createdAt && !isEditing">
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
      </div>
    </q-card-section>

    <!-- Edit Actions -->
    <q-card-actions v-if="isEditing" align="right" class="q-px-md q-pb-md">
      <q-btn
        flat
        label="Cancel"
        color="grey"
        :disable="isSaving"
        @click="cancelEditing"
      />
      <q-btn
        unelevated
        label="Save Changes"
        color="primary"
        icon="save"
        :loading="isSaving"
        @click="saveChanges"
      />
    </q-card-actions>
  </q-card>
</template>

<script setup>
import { ref, computed } from 'vue'
import { date } from 'quasar'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from 'src/stores/authStore'
import { useNotifications } from 'src/composables/useNotifications'
import { api } from 'src/services/api'

// Props
const props = defineProps({
  client: {
    type: Object,
    required: true
  }
})

// Emits
const emit = defineEmits(['updated'])

const { t } = useI18n()
const authStore = useAuthStore()
const { notifySuccess, notifyError } = useNotifications()

// State
const isEditing = ref(false)
const isSaving = ref(false)
const editForm = ref({
  firstName: '',
  lastName: '',
  telephone: '',
  email: ''
})

// Computed
const canEdit = computed(() => {
  return authStore.isAdmin
})

// Methods
function startEditing() {
  // Populate form with current values
  editForm.value = {
    firstName: props.client.firstName || '',
    lastName: props.client.lastName || '',
    telephone: props.client.telephone || '',
    email: props.client.email || ''
  }
  isEditing.value = true
}

function cancelEditing() {
  isEditing.value = false
  editForm.value = {
    firstName: '',
    lastName: '',
    telephone: '',
    email: ''
  }
}

async function saveChanges() {
  // Validate required fields
  if (!editForm.value.firstName || !editForm.value.lastName) {
    notifyError('First name and last name are required')
    return
  }

  isSaving.value = true

  try {
    // Call API to update client information
    const response = await api.post('client.update', {
      clientId: props.client.clientId,
      updates: {
        firstName: editForm.value.firstName,
        lastName: editForm.value.lastName,
        telephone: editForm.value.telephone,
        email: editForm.value.email
      }
    })

    notifySuccess(t('success.clientUpdated'))

    // Exit edit mode
    isEditing.value = false

    // Emit update event so parent can refresh data
    emit('updated', response.data.client)

  } catch (err) {
    console.error('Failed to update client:', err)
    notifyError(err.message || 'Failed to update client information')
  } finally {
    isSaving.value = false
  }
}

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
