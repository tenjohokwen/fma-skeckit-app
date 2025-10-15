<template>
  <q-btn-dropdown flat dense :label="currentLanguage" icon="language" aria-label="Switch language">
    <q-list>
      <q-item v-for="lang in languages" :key="lang.value" clickable :active="locale === lang.value"
        @click="changeLanguage(lang.value)">
        <q-item-section>
          <q-item-label>{{ lang.label }}</q-item-label>
        </q-item-section>
      </q-item>
    </q-list>
  </q-btn-dropdown>
</template>

<script setup>
/**
 * LanguageSwitcher.vue
 *
 * Language switcher component for English/French toggle.
 * Persists language selection to localStorage.
 *
 * Per constitution: Vue 3 Composition API with <script setup>, i18n support
 */

import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { locale } = useI18n()

const languages = [
  { value: 'en-US', label: 'English' },
  { value: 'fr-FR', label: 'Français' }
]

const currentLanguage = computed(() => {
  const lang = languages.find(l => l.value === locale.value)
  return lang ? lang.label : 'EN'
})

function changeLanguage(newLocale) {
  locale.value = newLocale
  localStorage.setItem('user-language', newLocale)
}
</script>

<style scoped>
/* Language switcher styles */
</style>
