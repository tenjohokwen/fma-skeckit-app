<template>
  <div class="error-display" :class="[`error-${type}`, { dismissible }]">
    <q-banner
      :class="`bg-${color} text-white`"
      rounded
    >
      <template #avatar>
        <q-icon :name="icon" size="md" />
      </template>

      <div class="error-content">
        <div v-if="title" class="error-title text-weight-bold q-mb-xs">
          {{ title }}
        </div>
        <div class="error-message">
          {{ message }}
        </div>
        <div v-if="details" class="error-details q-mt-sm text-caption">
          {{ details }}
        </div>
      </div>

      <template v-if="dismissible" #action>
        <q-btn
          flat
          round
          dense
          icon="close"
          color="white"
          @click="$emit('dismiss')"
        />
      </template>
    </q-banner>
  </div>
</template>

<script setup>
/**
 * ErrorDisplay.vue
 *
 * Reusable error display component with different severity levels.
 * Supports dismissible errors and detailed error messages.
 *
 * Per constitution: Vue 3 Composition API with <script setup>
 */

import { computed } from 'vue'

const props = defineProps({
  /**
   * Error type: error, warning, info
   */
  type: {
    type: String,
    default: 'error',
    validator: (value) => ['error', 'warning', 'info'].includes(value)
  },
  /**
   * Error title (optional)
   */
  title: {
    type: String,
    default: ''
  },
  /**
   * Error message (required)
   */
  message: {
    type: String,
    required: true
  },
  /**
   * Additional error details (optional)
   */
  details: {
    type: String,
    default: ''
  },
  /**
   * Can user dismiss the error?
   */
  dismissible: {
    type: Boolean,
    default: true
  }
})

defineEmits(['dismiss'])

const color = computed(() => {
  switch (props.type) {
    case 'error':
      return 'negative'
    case 'warning':
      return 'warning'
    case 'info':
      return 'info'
    default:
      return 'negative'
  }
})

const icon = computed(() => {
  switch (props.type) {
    case 'error':
      return 'error'
    case 'warning':
      return 'warning'
    case 'info':
      return 'info'
    default:
      return 'error'
  }
})
</script>

<style scoped>
.error-display {
  margin: 1rem 0;
}

.error-content {
  flex: 1;
}

.error-title {
  font-size: 16px;
}

.error-message {
  font-size: 14px;
  line-height: 1.5;
}

.error-details {
  opacity: 0.9;
  font-size: 12px;
}
</style>
