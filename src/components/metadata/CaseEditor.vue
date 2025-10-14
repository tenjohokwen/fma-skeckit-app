<template>
  <div class="case-editor">
    <q-card flat bordered>
      <q-card-section>
        <div class="text-h6 q-mb-md">
          {{ $t('edit.title') }}
          <q-badge v-if="caseData" color="primary" class="q-ml-sm">
            {{ caseData.caseId }}
          </q-badge>
        </div>

        <q-separator class="q-mb-md" />

        <!-- Client Information Section -->
        <div class="section q-mb-lg">
          <div class="section-title">
            <q-icon name="person" size="sm" class="q-mr-xs" />
            {{ $t('edit.sections.clientInfo') }}
          </div>

          <div class="row q-col-gutter-md">
            <div class="col-12 col-sm-6">
              <FieldInput
                v-model="formData.clientFirstName"
                type="text"
                :label="$t('edit.fields.firstName')"
                icon="person"
                required
                :disable="isSaving"
              />
            </div>
            <div class="col-12 col-sm-6">
              <FieldInput
                v-model="formData.clientLastName"
                type="text"
                :label="$t('edit.fields.lastName')"
                icon="person"
                required
                :disable="isSaving"
              />
            </div>
            <div class="col-12 col-sm-6">
              <FieldInput
                v-model="formData.clientEmail"
                type="email"
                :label="$t('edit.fields.email')"
                icon="email"
                :disable="isSaving"
              />
            </div>
            <div class="col-12 col-sm-6">
              <FieldInput
                v-model="formData.clientPhoneNumber"
                type="tel"
                :label="$t('edit.fields.phone')"
                icon="phone"
                :disable="isSaving"
              />
            </div>
          </div>
        </div>

        <!-- Payment Information Section -->
        <div class="section q-mb-lg">
          <div class="section-title">
            <q-icon name="payments" size="sm" class="q-mr-xs" />
            {{ $t('edit.sections.paymentInfo') }}
          </div>

          <div class="row q-col-gutter-md">
            <div class="col-12 col-sm-6">
              <FieldInput
                v-model="formData.amountPaid"
                type="number"
                :label="$t('edit.fields.amountPaid')"
                icon="attach_money"
                :disable="isSaving"
              />
            </div>
            <div class="col-12 col-sm-6">
              <FieldInput
                v-model="formData.paymentStatus"
                type="text"
                :label="$t('edit.fields.paymentStatus')"
                icon="payment"
                :disable="isSaving"
              />
            </div>
          </div>
        </div>

        <!-- Case Management Section -->
        <div class="section q-mb-lg">
          <div class="section-title">
            <q-icon name="assignment" size="sm" class="q-mr-xs" />
            {{ $t('edit.sections.caseManagement') }}
          </div>

          <div class="row q-col-gutter-md">
            <div class="col-12 col-sm-6">
              <FieldInput
                v-model="formData.assignedTo"
                type="text"
                :label="$t('edit.fields.assignedTo')"
                icon="person_pin"
                :disable="isSaving"
              />
            </div>
            <div class="col-12 col-sm-6">
              <FieldInput
                v-model="formData.dueDate"
                type="date"
                :label="$t('edit.fields.dueDate')"
                :disable="isSaving"
              />
            </div>
            <div class="col-12 col-sm-6">
              <FieldInput
                v-model="formData.status"
                type="text"
                :label="$t('edit.fields.status')"
                icon="flag"
                :disable="isSaving"
              />
            </div>
            <div class="col-12">
              <FieldInput
                v-model="formData.tasksRemaining"
                type="textarea"
                :label="$t('edit.fields.tasksRemaining')"
                :rows="2"
                :disable="isSaving"
              />
            </div>
            <div class="col-12">
              <FieldInput
                v-model="formData.nextAction"
                type="textarea"
                :label="$t('edit.fields.nextAction')"
                :rows="2"
                :disable="isSaving"
              />
            </div>
          </div>
        </div>

        <!-- Comments Section -->
        <div class="section q-mb-lg">
          <div class="section-title">
            <q-icon name="comment" size="sm" class="q-mr-xs" />
            {{ $t('edit.sections.comments') }}
          </div>

          <FieldInput
            v-model="formData.comment"
            type="textarea"
            :label="$t('edit.fields.comment')"
            :rows="4"
            :disable="isSaving"
          />
        </div>

        <!-- Folder Information (Readonly) -->
        <div class="section">
          <div class="section-title">
            <q-icon name="folder" size="sm" class="q-mr-xs" />
            {{ $t('edit.sections.folderInfo') }}
          </div>

          <div class="row q-col-gutter-md">
            <div class="col-12 col-sm-6">
              <FieldInput
                v-model="formData.folderName"
                type="text"
                :label="$t('edit.fields.folderName')"
                icon="folder"
                readonly
                :disable="isSaving"
              />
            </div>
            <div class="col-12 col-sm-6">
              <FieldInput
                v-model="formData.folderPath"
                type="text"
                :label="$t('edit.fields.folderPath')"
                icon="folder_open"
                readonly
                :disable="isSaving"
              />
            </div>
          </div>
        </div>
      </q-card-section>

      <!-- Actions -->
      <q-card-actions align="right" class="q-px-md q-pb-md">
        <q-btn
          flat
          color="grey"
          :label="$t('common.cancel')"
          :disable="isSaving"
          @click="$emit('cancel')"
        />
        <q-btn
          color="primary"
          :label="$t('common.save')"
          icon="save"
          :loading="isSaving"
          :disable="!hasChanges"
          @click="handleSave"
        />
      </q-card-actions>
    </q-card>

    <!-- Version Conflict Dialog -->
    <q-dialog v-model="showConflictDialog" persistent>
      <q-card>
        <q-card-section class="row items-center">
          <q-icon name="warning" color="warning" size="3em" class="q-mr-md" />
          <div>
            <div class="text-h6">{{ $t('edit.conflict.title') }}</div>
            <div class="text-body2 text-grey-7 q-mt-sm">
              {{ $t('edit.conflict.message') }}
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn
            flat
            :label="$t('edit.conflict.cancel')"
            color="grey"
            @click="handleConflictCancel"
          />
          <q-btn
            :label="$t('edit.conflict.refresh')"
            color="primary"
            @click="handleConflictRefresh"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
/**
 * CaseEditor.vue
 *
 * Case metadata editor component with form validation and version conflict handling.
 * Used by admin users to edit case information.
 *
 * Per constitution: Vue 3 Composition API with <script setup>
 */

import { ref, computed, watch } from 'vue'
import FieldInput from './FieldInput.vue'

const props = defineProps({
  /**
   * Case data to edit
   */
  caseData: {
    type: Object,
    required: true
  },
  /**
   * Whether save is in progress
   */
  isSaving: {
    type: Boolean,
    default: false
  },
  /**
   * Version conflict flag
   */
  versionConflict: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['save', 'cancel', 'refresh'])

// Local state
const formData = ref({})
const originalData = ref({})
const showConflictDialog = ref(false)

// Initialize form data
function initializeForm() {
  formData.value = {
    clientFirstName: props.caseData.clientFirstName || '',
    clientLastName: props.caseData.clientLastName || '',
    clientEmail: props.caseData.clientEmail || '',
    clientPhoneNumber: props.caseData.clientPhoneNumber || '',
    amountPaid: props.caseData.amountPaid || 0,
    paymentStatus: props.caseData.paymentStatus || '',
    folderName: props.caseData.folderName || '',
    folderPath: props.caseData.folderPath || '',
    assignedTo: props.caseData.assignedTo || '',
    dueDate: props.caseData.dueDate || '',
    status: props.caseData.status || '',
    tasksRemaining: props.caseData.tasksRemaining || '',
    nextAction: props.caseData.nextAction || '',
    comment: props.caseData.comment || ''
  }

  // Store original for change detection
  originalData.value = { ...formData.value }
}

// Initialize on mount and when caseData changes
watch(
  () => props.caseData,
  () => {
    if (props.caseData) {
      initializeForm()
    }
  },
  { immediate: true }
)

// Watch for version conflict
watch(
  () => props.versionConflict,
  (newValue) => {
    showConflictDialog.value = newValue
  }
)

// Computed
const hasChanges = computed(() => {
  return JSON.stringify(formData.value) !== JSON.stringify(originalData.value)
})

// Methods
function handleSave() {
  // Only send changed fields
  const updates = {}
  for (const key in formData.value) {
    if (formData.value[key] !== originalData.value[key]) {
      updates[key] = formData.value[key]
    }
  }

  emit('save', updates)
}

function handleConflictCancel() {
  showConflictDialog.value = false
  emit('cancel')
}

function handleConflictRefresh() {
  showConflictDialog.value = false
  emit('refresh')
}
</script>

<style scoped>
.case-editor {
  max-width: 1000px;
  margin: 0 auto;
}

.section {
  padding: 1rem 0;
}

.section-title {
  display: flex;
  align-items: center;
  font-weight: 600;
  font-size: 16px;
  color: var(--color-dark-text);
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid var(--color-light-grey);
}
</style>
