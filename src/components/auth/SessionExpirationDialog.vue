<template>
  <q-dialog
    :model-value="show"
    persistent
    no-esc-dismiss
    no-backdrop-dismiss
    transition-show="scale"
    transition-hide="scale"
  >
    <q-card style="min-width: 400px; max-width: 500px">
      <!-- Header -->
      <q-card-section class="row items-center bg-warning text-white">
        <q-icon name="warning" size="md" class="q-mr-sm" />
        <div class="text-h6">{{ $t('session.expiring.title') }}</div>
      </q-card-section>

      <!-- Content -->
      <q-card-section>
        <div class="text-body1 q-mb-md">
          {{ $t('session.expiring.message', { time: formattedTime }) }}
        </div>

        <!-- Countdown Timer -->
        <div class="text-center q-pa-md bg-grey-2 rounded-borders">
          <div class="text-caption text-grey-7 q-mb-xs">
            {{ $t('session.expiring.countdown') }}
          </div>
          <div class="text-h3 text-negative" :aria-live="'polite'" :aria-atomic="'true'">
            {{ formattedTime }}
          </div>
        </div>

        <!-- Error Message -->
        <q-banner
          v-if="errorMessage"
          dense
          rounded
          class="bg-negative text-white q-mt-md"
        >
          <template #avatar>
            <q-icon name="error" color="white" />
          </template>
          {{ errorMessage }}
          <template #action>
            <q-btn
              flat
              dense
              label="Retry"
              color="white"
              @click="handleRetry"
            />
          </template>
        </q-banner>
      </q-card-section>

      <!-- Actions -->
      <q-card-actions align="right" class="q-pa-md">
        <q-btn
          flat
          :label="$t('session.expiring.logoutButton')"
          color="grey-7"
          icon="logout"
          @click="handleLogout"
          :disable="isExtending"
        />
        <q-btn
          unelevated
          :label="$t('session.expiring.extendButton')"
          color="primary"
          icon="refresh"
          :loading="isExtending"
          @click="handleExtend"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

// Props
const props = defineProps({
  show: {
    type: Boolean,
    required: true
  },
  timeRemaining: {
    type: Number,
    required: true,
    default: 0
  },
  isExtending: {
    type: Boolean,
    default: false
  }
})

// Emits
const emit = defineEmits(['extend', 'logout', 'update:show'])

// State
const errorMessage = ref(null)

// Computed
const formattedTime = computed(() => {
  const minutes = Math.floor(props.timeRemaining / 60)
  const seconds = props.timeRemaining % 60
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
})

// Methods
function handleExtend() {
  errorMessage.value = null
  emit('extend')
}

function handleRetry() {
  errorMessage.value = null
  emit('extend')
}

function handleLogout() {
  emit('logout')
}

// Show error if extend fails
defineExpose({
  showError: (message) => {
    errorMessage.value = message || t('token.refresh.error')
  }
})
</script>

<style scoped lang="scss">
.q-dialog__backdrop {
  background: rgba(0, 0, 0, 0.7) !important;
}

.rounded-borders {
  border-radius: 8px;
}
</style>
