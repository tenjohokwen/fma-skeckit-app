<template>
  <q-page class="q-pa-md">
    <div class="q-pa-md" style="max-width: 600px; margin: 0 auto;">
      <h4 class="text-h4 text-weight-bold q-mb-lg">
        {{ $t('navigation.profile') }}
      </h4>

      <q-card>
        <q-card-section>
          <div class="q-gutter-md">
            <div>
              <div class="text-caption text-grey-7">Email</div>
              <div class="text-body1">{{ authStore.user?.email }}</div>
            </div>

            <q-separator />

            <div>
              <div class="text-caption text-grey-7">Role</div>
              <div class="text-body1">{{ authStore.user?.role }}</div>
            </div>

            <q-separator />

            <div>
              <div class="text-caption text-grey-7">Status</div>
              <div class="text-body1">{{ authStore.user?.status }}</div>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script setup>
/**
 * ProfilePage.vue
 *
 * User profile page - placeholder.
 *
 * Per constitution: Vue 3 Composition API with <script setup>
 */

import { useI18n } from 'vue-i18n'
import { useAuthStore } from 'src/stores/authStore'

const { t: $t } = useI18n()
const authStore = useAuthStore()
</script>
