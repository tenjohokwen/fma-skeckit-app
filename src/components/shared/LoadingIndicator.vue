<template>
  <div class="loading-indicator" :class="{ 'full-screen': fullScreen }">
    <q-spinner
      :color="color"
      :size="size"
      :thickness="thickness"
    />
    <div v-if="message" class="loading-message q-mt-md">
      {{ message }}
    </div>
  </div>
</template>

<script setup>
/**
 * LoadingIndicator.vue
 *
 * Reusable loading spinner component.
 * Can be inline or full-screen overlay.
 *
 * Per constitution: Vue 3 Composition API with <script setup>
 */

defineProps({
  /**
   * Display as full-screen overlay
   */
  fullScreen: {
    type: Boolean,
    default: false
  },
  /**
   * Spinner color (Quasar color)
   */
  color: {
    type: String,
    default: 'primary'
  },
  /**
   * Spinner size (CSS value)
   */
  size: {
    type: String,
    default: '50px'
  },
  /**
   * Spinner thickness (1-10)
   */
  thickness: {
    type: Number,
    default: 5
  },
  /**
   * Optional loading message
   */
  message: {
    type: String,
    default: ''
  }
})
</script>

<style scoped>
.loading-indicator {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.loading-indicator.full-screen {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.9);
  z-index: 9999;
}

.loading-message {
  color: var(--color-dark-text);
  font-size: 14px;
  text-align: center;
}
</style>
