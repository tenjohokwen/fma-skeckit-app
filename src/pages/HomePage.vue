<template>
  <q-page class="flex flex-center bg-grey-1">
    <div class="home-page-container q-pa-md text-center">
      <!-- App logo/icon -->
      <q-icon name="folder_open" size="80px" color="primary" class="q-mb-md" />

      <!-- Welcome message -->
      <h3 class="text-h3 text-weight-bold q-mb-sm">
        {{ $t('common.appName') }}
      </h3>
      <p class="text-h6 text-grey-7 q-mb-xl">
        {{ $t('auth.signup.subtitle') }}
      </p>

      <!-- Action buttons -->
      <div class="q-gutter-md">
        <q-btn
          :label="$t('auth.signup.title')"
          color="primary"
          size="lg"
          :to="{ name: 'signup' }"
          class="q-px-xl"
        />
        <q-btn
          :label="$t('auth.login.title')"
          color="primary"
          outline
          size="lg"
          :to="{ name: 'login' }"
          class="q-px-xl"
        />
      </div>

      <!-- Language switcher at bottom -->
      <div class="q-mt-xl">
        <language-switcher />
      </div>
    </div>
  </q-page>
</template>

<script setup>
/**
 * HomePage.vue
 *
 * Landing page for unauthenticated users.
 * Provides links to sign up or log in.
 *
 * Per constitution: Vue 3 Composition API with <script setup>
 */

import { useI18n } from 'vue-i18n'
import LanguageSwitcher from 'src/components/LanguageSwitcher.vue'

const { t: $t } = useI18n()
</script>

<style scoped>
.home-page-container {
  width: 100%;
  max-width: 600px;
}
</style>
