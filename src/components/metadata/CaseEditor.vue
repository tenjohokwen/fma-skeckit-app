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

        <!-- Case Information Section -->
        <div class="section q-mb-lg">
          <div class="section-title">
            <q-icon name="folder" size="sm" class="q-mr-xs" />
            Case Information
          </div>

          <div class="row q-col-gutter-md">
            <div class="col-12">
              <FieldInput
                v-model="formData.caseName"
                type="text"
                label="Case Name"
                icon="label"
                :disable="isSaving"
              />
            </div>
            <div class="col-12">
              <FieldInput
                v-model="formData.clientName"
                type="text"
                label="Client Name"
                icon="person"
                :disable="isSaving"
              />
            </div>
            <div class="col-12 col-sm-6">
              <FieldInput
                v-model="formData.caseType"
                type="text"
                label="Case Type"
                icon="category"
                :disable="isSaving"
              />
            </div>
            <div class="col-12 col-sm-6">
              <FieldInput
                v-model="formData.status"
                type="text"
                label="Status"
                icon="flag"
                :disable="isSaving"
              />
            </div>
          </div>
        </div>

        <!-- Assignment Section -->
        <div class="section q-mb-lg">
          <div class="section-title">
            <q-icon name="assignment" size="sm" class="q-mr-xs" />
            Assignment
          </div>

          <div class="row q-col-gutter-md">
            <div class="col-12">
              <FieldInput
                v-model="formData.assignedTo"
                type="text"
                label="Assigned To"
                icon="person_pin"
                :disable="isSaving"
              />
            </div>
          </div>
        </div>

        <!-- Notes Section -->
        <div class="section q-mb-lg">
          <div class="section-title">
            <q-icon name="notes" size="sm" class="q-mr-xs" />
            Notes
          </div>

          <FieldInput
            v-model="formData.notes"
            type="textarea"
            label="Notes"
            :rows="6"
            :disable="isSaving"
          />
        </div>
      </q-card-section>

      <!-- Actions -->
      <q-card-actions align="right" class="q-px-md q-pb-md">
        <q-btn
          flat
          color="grey"
          label="Cancel"
          :disable="isSaving"
          @click="$emit('cancel')"
        />
        <q-btn
          color="primary"
          label="Save"
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
            <div class="text-h6">Version Conflict</div>
            <div class="text-body2 text-grey-7 q-mt-sm">
              This case was modified by another user. Please refresh and try again.
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn
            flat
            label="Cancel"
            color="grey"
            @click="handleConflictCancel"
          />
          <q-btn
            label="Refresh"
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
    caseName: props.caseData.caseName || '',
    clientName: props.caseData.clientName || '',
    assignedTo: props.caseData.assignedTo || '',
    caseType: props.caseData.caseType || '',
    status: props.caseData.status || '',
    notes: props.caseData.notes || ''
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
