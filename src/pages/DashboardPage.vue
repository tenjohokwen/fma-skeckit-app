<template>
  <q-page class="q-pa-md">
    <div class="text-center q-mt-xl">
      <q-icon name="dashboard" size="80px" color="primary" class="q-mb-md" />
      <h4 class="text-h4 text-weight-bold q-mb-sm">
        Welcome to Dashboard
      </h4>
      <p class="text-body1 text-grey-7 q-mb-lg">
        You are successfully logged in!
      </p>
      <p class="text-body2 text-grey-6">
        User: <strong>{{ authStore.user?.email }}</strong>
      </p>
      <p class="text-body2 text-grey-6">
        Role: <strong>{{ authStore.user?.role }}</strong>
      </p>
    </div>
  </q-page>
</template>

<script setup>
/**
 * DashboardPage.vue
 *
 * Dashboard page - placeholder for future implementation.
 * Shows user info and confirms successful authentication.
 *
 * Per constitution: Vue 3 Composition API with <script setup>
 */

import { useAuthStore } from 'src/stores/authStore'

const authStore = useAuthStore()
</script>
