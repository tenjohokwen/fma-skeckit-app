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

        <!-- View Only Badge (for non-admin users) -->
        <q-badge
          v-if="isViewOnly"
          color="blue-grey-6"
          text-color="white"
          class="q-mr-md"
          :label="$t('common.viewOnly')"
        >
          <q-tooltip>{{ $t('common.viewOnlyTooltip') }}</q-tooltip>
        </q-badge>

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

    <!-- Session Expiration Warning Dialog -->
    <SessionExpirationDialog
      :show="isWarningVisible"
      :time-remaining="timeRemaining"
      :is-extending="isExtending"
      @extend="handleExtendSession"
      @logout="handleLogoutFromDialog"
    />

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
 * MainLayout.vue
 *
 * Main application layout for authenticated users.
 * Includes header, navigation drawer, and user menu.
 *
 * Per constitution: Vue 3 Composition API with <script setup>
 */

import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from 'src/stores/authStore'
import { useI18n } from 'vue-i18n'
import { useRoleAccess } from 'src/composables/useRoleAccess'
import { useSessionMonitor } from 'src/composables/useSessionMonitor'
import { useNotifications } from 'src/composables/useNotifications'
import LanguageSwitcher from 'components/LanguageSwitcher.vue'
import SessionExpirationDialog from 'src/components/auth/SessionExpirationDialog.vue'

const router = useRouter()
const authStore = useAuthStore()
const { t: $t } = useI18n()
const { isViewOnly } = useRoleAccess()
const { notifySuccess, notifyError } = useNotifications()

// Footer - current year for copyright
const currentYear = computed(() => new Date().getFullYear())

// Session monitoring
const {
  isWarningVisible,
  timeRemaining,
  isExtending,
  extendSession
} = useSessionMonitor()

const leftDrawerOpen = ref(false)

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value
}

function handleLogout() {
  authStore.logout()
  router.push({ name: 'login' })
}

function handleLogoutFromDialog() {
  handleLogout()
}

async function handleExtendSession() {
  const result = await extendSession()

  if (result.success) {
    notifySuccess($t('session.extended.success'))
  } else {
    notifyError(result.error || $t('token.refresh.error'))
  }
}
</script>

<style scoped>
/* MainLayout styles */
</style>
