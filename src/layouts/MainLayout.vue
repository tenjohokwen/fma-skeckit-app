<template>
  <q-layout view="lHh Lpr lFf">
    <!-- Header -->
    <q-header elevated class="bg-primary">
      <q-toolbar>
        <!-- Mobile menu button -->
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          class="q-mr-sm"
          @click="toggleLeftDrawer"
        />

        <!-- App title -->
        <q-toolbar-title>
          {{ $t('common.appName') }}
        </q-toolbar-title>

        <!-- Language Switcher -->
        <language-switcher />

        <!-- User menu -->
        <q-btn flat round dense icon="account_circle" aria-label="User menu">
          <q-menu>
            <q-list style="min-width: 200px">
              <q-item>
                <q-item-section>
                  <q-item-label>{{ authStore.user?.email }}</q-item-label>
                  <q-item-label caption>
                    {{ authStore.isAdmin ? $t('navigation.admin') : $t('navigation.profile') }}
                  </q-item-label>
                </q-item-section>
              </q-item>

              <q-separator />

              <q-item clickable @click="router.push({ name: 'profile' })">
                <q-item-section avatar>
                  <q-icon name="person" />
                </q-item-section>
                <q-item-section>{{ $t('navigation.profile') }}</q-item-section>
              </q-item>

              <q-item clickable @click="handleLogout">
                <q-item-section avatar>
                  <q-icon name="logout" />
                </q-item-section>
                <q-item-section>{{ $t('auth.logout') }}</q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>
      </q-toolbar>
    </q-header>

    <!-- Side drawer navigation -->
    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      bordered
      class="bg-grey-1"
    >
      <q-list>
        <q-item-label header class="text-grey-8">
          {{ $t('navigation.home') }}
        </q-item-label>

        <q-item
          clickable
          :to="{ name: 'dashboard' }"
          exact
        >
          <q-item-section avatar>
            <q-icon name="dashboard" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Dashboard</q-item-label>
          </q-item-section>
        </q-item>

        <q-item
          clickable
          :to="{ name: 'search' }"
        >
          <q-item-section avatar>
            <q-icon name="search" />
          </q-item-section>
          <q-item-section>
            <q-item-label>{{ $t('navigation.search') }}</q-item-label>
          </q-item-section>
        </q-item>

        <q-item
          clickable
          :to="{ name: 'files' }"
        >
          <q-item-section avatar>
            <q-icon name="folder" />
          </q-item-section>
          <q-item-section>
            <q-item-label>{{ $t('navigation.files') }}</q-item-label>
          </q-item-section>
        </q-item>

        <!-- Admin only section -->
        <template v-if="authStore.isAdmin">
          <q-separator class="q-my-md" />

          <q-item-label header class="text-grey-8">
            {{ $t('navigation.admin') }}
          </q-item-label>

          <q-item
            clickable
            :to="{ name: 'clients' }"
          >
            <q-item-section avatar>
              <q-icon name="people" />
            </q-item-section>
            <q-item-section>
              <q-item-label>{{ $t('navigation.cases') }}</q-item-label>
            </q-item-section>
          </q-item>
        </template>
      </q-list>
    </q-drawer>

    <!-- Page content -->
    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
/**
 * MainLayout.vue
 *
 * Main application layout for authenticated users.
 * Includes header, navigation drawer, and user menu.
 *
 * Per constitution: Vue 3 Composition API with <script setup>
 */

import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from 'src/stores/authStore'
import { useI18n } from 'vue-i18n'
import LanguageSwitcher from 'components/LanguageSwitcher.vue'

const router = useRouter()
const authStore = useAuthStore()
const { t: $t } = useI18n()

const leftDrawerOpen = ref(false)

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value
}

function handleLogout() {
  authStore.logout()
  router.push({ name: 'login' })
}
</script>

<style scoped>
/* MainLayout styles */
</style>
