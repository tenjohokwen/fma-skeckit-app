import { config } from '@vue/test-utils'
import { Quasar } from 'quasar'
import { vi } from 'vitest'

// Mock vue-i18n globally
vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: (key) => key,
    locale: { value: 'en' }
  })
}))

// Configure Vue Test Utils with Quasar
config.global.plugins = [[Quasar, {}]]

// Mock Quasar composables and i18n
config.global.mocks = {
  $t: (key) => key,
  $q: {
    notify: vi.fn(),
    loading: {
      show: vi.fn(),
      hide: vi.fn()
    },
    dialog: vi.fn()
  }
}

// Provide global stubs for commonly used Quasar components
config.global.stubs = {
  QPage: {
    template: '<div class="q-page"><slot /></div>'
  },
  QBanner: {
    template: '<div class="q-banner"><slot /></div>'
  }
}
