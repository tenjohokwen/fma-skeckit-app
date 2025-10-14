<template>
  <q-card flat bordered class="case-card">
    <q-card-section>
      <!-- Header with Case ID -->
      <div class="row items-center q-mb-sm">
        <div class="col">
          <div class="text-h6 text-primary">
            {{ caseData.caseId }}
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
          <div class="case-info-item">
            <span class="info-label">{{ $t('case.clientName') }}:</span>
            <span class="info-value">
              {{ caseData.clientFirstName }} {{ caseData.clientLastName }}
            </span>
          </div>
          <div v-if="caseData.clientEmail" class="case-info-item">
            <span class="info-label">{{ $t('case.clientEmail') }}:</span>
            <span class="info-value">{{ caseData.clientEmail }}</span>
          </div>
          <div v-if="caseData.clientPhoneNumber" class="case-info-item">
            <span class="info-label">{{ $t('case.clientPhone') }}:</span>
            <span class="info-value">{{ caseData.clientPhoneNumber }}</span>
          </div>
        </div>
      </div>

      <!-- Payment Information -->
      <div v-if="showPaymentInfo" class="case-section q-mb-md">
        <div class="section-title">
          <q-icon name="payments" size="sm" class="q-mr-xs" />
          {{ $t('case.paymentInfo') }}
        </div>
        <div class="case-info-grid">
          <div v-if="caseData.amountPaid !== null && caseData.amountPaid !== undefined" class="case-info-item">
            <span class="info-label">{{ $t('case.amountPaid') }}:</span>
            <span class="info-value">{{ formatCurrency(caseData.amountPaid) }}</span>
          </div>
          <div v-if="caseData.paymentStatus" class="case-info-item">
            <span class="info-label">{{ $t('case.paymentStatus') }}:</span>
            <span class="info-value">{{ caseData.paymentStatus }}</span>
          </div>
        </div>
      </div>

      <!-- Case Management -->
      <div v-if="showManagementInfo" class="case-section q-mb-md">
        <div class="section-title">
          <q-icon name="assignment" size="sm" class="q-mr-xs" />
          {{ $t('case.managementInfo') }}
        </div>
        <div class="case-info-grid">
          <div v-if="caseData.assignedTo" class="case-info-item">
            <span class="info-label">{{ $t('case.assignedTo') }}:</span>
            <span class="info-value">{{ caseData.assignedTo }}</span>
          </div>
          <div v-if="caseData.dueDate" class="case-info-item">
            <span class="info-label">{{ $t('case.dueDate') }}:</span>
            <span class="info-value">{{ formatDate(caseData.dueDate) }}</span>
          </div>
          <div v-if="caseData.tasksRemaining" class="case-info-item full-width">
            <span class="info-label">{{ $t('case.tasksRemaining') }}:</span>
            <span class="info-value">{{ caseData.tasksRemaining }}</span>
          </div>
          <div v-if="caseData.nextAction" class="case-info-item full-width">
            <span class="info-label">{{ $t('case.nextAction') }}:</span>
            <span class="info-value">{{ caseData.nextAction }}</span>
          </div>
        </div>
      </div>

      <!-- Comments -->
      <div v-if="caseData.comment" class="case-section">
        <div class="section-title">
          <q-icon name="comment" size="sm" class="q-mr-xs" />
          {{ $t('case.comments') }}
        </div>
        <div class="comment-text">
          {{ caseData.comment }}
        </div>
      </div>

      <!-- Folder Information -->
      <div v-if="caseData.folderPath" class="case-section q-mt-md">
        <div class="folder-info">
          <q-icon name="folder" size="sm" class="q-mr-xs text-grey-6" />
          <span class="text-caption text-grey-7">{{ caseData.folderPath }}</span>
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

const showPaymentInfo = computed(() => {
  return props.caseData.amountPaid !== null &&
         props.caseData.amountPaid !== undefined ||
         props.caseData.paymentStatus
})

const showManagementInfo = computed(() => {
  return props.caseData.assignedTo ||
         props.caseData.dueDate ||
         props.caseData.tasksRemaining ||
         props.caseData.nextAction
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

function formatCurrency(amount) {
  if (amount === null || amount === undefined) return ''
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount)
}

function formatDate(dateString) {
  if (!dateString) return ''
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  } catch {
    return dateString
  }
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

.comment-text {
  font-size: 14px;
  color: var(--color-dark-text);
  padding: 0.5rem;
  background-color: rgba(0, 0, 0, 0.02);
  border-radius: 4px;
}

.folder-info {
  display: flex;
  align-items: center;
  padding: 0.5rem;
  background-color: rgba(0, 0, 0, 0.02);
  border-radius: 4px;
}
</style>
