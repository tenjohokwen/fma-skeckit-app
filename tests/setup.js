import { config } from '@vue/test-utils'
import { vi } from 'vitest'

// Mock vue-i18n globally
vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: (key) => key,
    locale: { value: 'en' }
  })
}))

// DON'T install Quasar globally - let each test configure it as needed
// This prevents conflicts with test-specific configurations

// Mock Quasar composables and i18n (these can still be global defaults)
config.global.mocks = {
  $t: (key) => key,
  $q: {
    notify: vi.fn(),
    loading: {
      show: vi.fn(),
      hide: vi.fn()
    },
    dialog: vi.fn(),
    platform: {
      is: {
        mobile: false,
        desktop: true
      }
    },
    screen: {
      xs: false,
      sm: false,
      md: true,
      lg: false,
      xl: false
    }
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
