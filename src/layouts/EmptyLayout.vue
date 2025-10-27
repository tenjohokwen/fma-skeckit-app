<template>
  <q-layout view="lHh Lpr lFf">
    <q-page-container>
      <router-view v-slot="{ Component, route }">
        <component :is="Component" :key="route.path" />
      </router-view>
    </q-page-container>

    <!-- Footer -->
    <q-footer elevated class="bg-grey-2 text-grey-7">
      <div class="row items-center justify-center q-pa-sm">
        <span class="text-caption">
          Powered by Virtues Cafe | Copyright © {{ currentYear }}
        </span>
      </div>
    </q-footer>
  </q-layout>
</template>

<script setup>
/**
 * EmptyLayout.vue
 *
 * Minimal layout for authentication pages (signup, login, verification).
 * No header, no navigation - just the content.
 *
 * Per constitution: Vue 3 Composition API with <script setup>
 */

import { computed } from 'vue'

// Footer - current year for copyright
const currentYear = computed(() => new Date().getFullYear())
</script>

<style scoped>
/* Empty layout has no additional styling */
</style>
