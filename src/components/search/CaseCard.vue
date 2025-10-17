<template>
  <q-card flat bordered class="case-card">
    <q-card-section>
      <!-- Header with Case ID and Case Name -->
      <div class="row items-center q-mb-sm">
        <div class="col">
          <div class="text-h6 text-primary">
            {{ caseData.caseId }}
          </div>
          <div v-if="caseData.caseName && caseData.caseName !== caseData.caseId" class="text-caption text-grey-7">
            {{ caseData.caseName }}
          </div>
        </div>
        <div class="col-auto">
          <q-badge
            v-if="caseData.status"
            :color="getStatusColor(caseData.status)"
            :label="caseData.status"
          />
        </div>
      </div>

      <q-separator class="q-mb-md" />

      <!-- Client Information -->
      <div class="case-section q-mb-md">
        <div class="section-title">
          <q-icon name="person" size="sm" class="q-mr-xs" />
          {{ $t('case.clientInfo') }}
        </div>
        <div class="case-info-grid">
          <div v-if="caseData.clientName" class="case-info-item">
            <span class="info-label">{{ $t('case.clientName') }}:</span>
            <span class="info-value">
              {{ caseData.clientName }}
            </span>
          </div>
        </div>
      </div>

      <!-- Case Information -->
      <div v-if="showCaseInfo" class="case-section q-mb-md">
        <div class="section-title">
          <q-icon name="folder" size="sm" class="q-mr-xs" />
          {{ $t('case.caseInfo') }}
        </div>
        <div class="case-info-grid">
          <div v-if="caseData.caseType" class="case-info-item">
            <span class="info-label">{{ $t('case.caseType') }}:</span>
            <span class="info-value">{{ caseData.caseType }}</span>
          </div>
          <div v-if="caseData.assignedTo" class="case-info-item">
            <span class="info-label">{{ $t('case.assignedTo') }}:</span>
            <span class="info-value">{{ caseData.assignedTo }}</span>
          </div>
        </div>
      </div>

      <!-- Notes -->
      <div v-if="caseData.notes" class="case-section">
        <div class="section-title">
          <q-icon name="notes" size="sm" class="q-mr-xs" />
          {{ $t('case.notes') }}
        </div>
        <div class="notes-text">
          {{ caseData.notes }}
        </div>
      </div>
    </q-card-section>

    <!-- Actions -->
    <q-card-actions v-if="showActions" align="right">
      <q-btn
        flat
        color="primary"
        :label="$t('case.viewDetails')"
        icon="visibility"
        @click="$emit('view', caseData.caseId)"
      />
      <q-btn
        v-if="canEdit"
        flat
        color="secondary"
        :label="$t('case.edit')"
        icon="edit"
        @click="$emit('edit', caseData.caseId)"
      />
    </q-card-actions>
  </q-card>
</template>

<script setup>
/**
 * CaseCard.vue
 *
 * Displays case metadata in a card format.
 * Excludes system-generated fields (assignedAt, lastUpdatedBy, lastUpdatedAt, version).
 *
 * Per constitution: Vue 3 Composition API with <script setup>
 */

import { computed } from 'vue'
import { useAuthStore } from 'src/stores/authStore'

const props = defineProps({
  /**
   * Case data object
   */
  caseData: {
    type: Object,
    required: true
  },
  /**
   * Show action buttons
   */
  showActions: {
    type: Boolean,
    default: true
  }
})

defineEmits(['view', 'edit'])

const authStore = useAuthStore()

// Computed
const canEdit = computed(() => {
  return authStore.isAdmin
})

const showCaseInfo = computed(() => {
  return props.caseData.caseType || props.caseData.assignedTo
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
</script>

<style scoped>
.case-card {
  border-radius: 8px;
  transition: box-shadow 0.3s ease;
}

.case-card:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.case-section {
  padding: 0.5rem 0;
}

.section-title {
  display: flex;
  align-items: center;
  font-weight: 600;
  font-size: 14px;
  color: var(--color-dark-text);
  margin-bottom: 0.5rem;
}

.case-info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 0.75rem;
}

.case-info-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.case-info-item.full-width {
  grid-column: 1 / -1;
}

.info-label {
  font-size: 12px;
  font-weight: 500;
  color: var(--color-dark-text);
  opacity: 0.7;
}

.info-value {
  font-size: 14px;
  color: var(--color-dark-text);
}

.notes-text {
  font-size: 14px;
  color: var(--color-dark-text);
  padding: 0.5rem;
  background-color: rgba(0, 0, 0, 0.02);
  border-radius: 4px;
  white-space: pre-wrap;
}
</style>
