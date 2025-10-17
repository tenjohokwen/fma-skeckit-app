<template>
  <div class="case-viewer">
    <q-card flat bordered>
      <q-card-section>
        <div class="text-h6 q-mb-md">
          Case Details
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

          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">Case ID:</span>
              <span class="info-value">{{ caseData.caseId }}</span>
            </div>
            <div v-if="caseData.caseName" class="info-item">
              <span class="info-label">Case Name:</span>
              <span class="info-value">{{ caseData.caseName }}</span>
            </div>
            <div v-if="caseData.clientName" class="info-item">
              <span class="info-label">Client Name:</span>
              <span class="info-value">{{ caseData.clientName }}</span>
            </div>
            <div v-if="caseData.caseType" class="info-item">
              <span class="info-label">Case Type:</span>
              <span class="info-value">{{ caseData.caseType }}</span>
            </div>
            <div v-if="caseData.status" class="info-item">
              <span class="info-label">Status:</span>
              <q-badge :color="getStatusColor(caseData.status)">
                {{ caseData.status }}
              </q-badge>
            </div>
          </div>
        </div>

        <!-- Assignment Section -->
        <div v-if="caseData.assignedTo" class="section q-mb-lg">
          <div class="section-title">
            <q-icon name="assignment" size="sm" class="q-mr-xs" />
            Assignment
          </div>

          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">Assigned To:</span>
              <span class="info-value">{{ caseData.assignedTo }}</span>
            </div>
            <div v-if="caseData.assignedAt" class="info-item">
              <span class="info-label">Assigned At:</span>
              <span class="info-value">{{ formatDate(caseData.assignedAt) }}</span>
            </div>
          </div>
        </div>

        <!-- Notes Section -->
        <div v-if="caseData.notes" class="section q-mb-lg">
          <div class="section-title">
            <q-icon name="notes" size="sm" class="q-mr-xs" />
            Notes
          </div>

          <div class="notes-display">
            {{ caseData.notes }}
          </div>
        </div>

        <!-- System Information -->
        <div v-if="showSystemInfo" class="section">
          <div class="section-title">
            <q-icon name="info" size="sm" class="q-mr-xs" />
            System Information
          </div>

          <div class="info-grid">
            <div v-if="caseData.createdBy" class="info-item">
              <span class="info-label">Created By:</span>
              <span class="info-value">{{ caseData.createdBy }}</span>
            </div>
            <div v-if="caseData.createdAt" class="info-item">
              <span class="info-label">Created At:</span>
              <span class="info-value">{{ formatDate(caseData.createdAt) }}</span>
            </div>
            <div v-if="caseData.lastUpdatedBy" class="info-item">
              <span class="info-label">Last Updated By:</span>
              <span class="info-value">{{ caseData.lastUpdatedBy }}</span>
            </div>
            <div v-if="caseData.lastUpdatedAt" class="info-item">
              <span class="info-label">Last Updated At:</span>
              <span class="info-value">{{ formatDate(caseData.lastUpdatedAt) }}</span>
            </div>
            <div v-if="caseData.version !== undefined" class="info-item">
              <span class="info-label">Version:</span>
              <span class="info-value">{{ caseData.version }}</span>
            </div>
          </div>
        </div>
      </q-card-section>

      <!-- Actions -->
      <q-card-actions align="right" class="q-px-md q-pb-md">
        <q-btn
          flat
          color="grey"
          label="Back"
          icon="arrow_back"
          @click="$emit('back')"
        />
        <q-btn
          v-if="canEdit"
          color="primary"
          label="Edit"
          icon="edit"
          @click="$emit('edit')"
        />
      </q-card-actions>
    </q-card>
  </div>
</template>

<script setup>
/**
 * CaseViewer.vue
 *
 * Read-only case details viewer component.
 * Displays case information without editing capabilities.
 *
 * Per constitution: Vue 3 Composition API with <script setup>
 */

import { computed } from 'vue'
import { useAuthStore } from 'src/stores/authStore'

const props = defineProps({
  /**
   * Case data to display
   */
  caseData: {
    type: Object,
    required: true
  }
})

defineEmits(['back', 'edit'])

const authStore = useAuthStore()

// Computed
const canEdit = computed(() => {
  return authStore.isAdmin
})

const showSystemInfo = computed(() => {
  return props.caseData.createdBy ||
         props.caseData.createdAt ||
         props.caseData.lastUpdatedBy ||
         props.caseData.lastUpdatedAt ||
         props.caseData.version !== undefined
})

// Methods
function getStatusColor(status) {
  const statusLower = status.toLowerCase()
  if (statusLower.includes('complete') || statusLower.includes('done')) {
    return 'positive'
  } else if (statusLower.includes('progress') || statusLower.includes('active')) {
    return 'primary'
  } else if (statusLower.includes('pending') || statusLower.includes('new')) {
    return 'warning'
  } else if (statusLower.includes('blocked') || statusLower.includes('cancel')) {
    return 'negative'
  }
  return 'grey'
}

function formatDate(dateString) {
  if (!dateString) return ''
  try {
    const date = new Date(dateString)
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch {
    return dateString
  }
}
</script>

<style scoped>
.case-viewer {
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

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1rem;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.info-label {
  font-size: 12px;
  font-weight: 500;
  color: var(--color-dark-text);
  opacity: 0.7;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.info-value {
  font-size: 15px;
  color: var(--color-dark-text);
  font-weight: 500;
}

.notes-display {
  font-size: 14px;
  color: var(--color-dark-text);
  padding: 1rem;
  background-color: rgba(0, 0, 0, 0.02);
  border-radius: 4px;
  white-space: pre-wrap;
  line-height: 1.6;
  border-left: 3px solid var(--q-primary);
}
</style>
