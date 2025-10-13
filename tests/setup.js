import { config } from '@vue/test-utils'
import { Quasar, Notify, Loading, Dialog } from 'quasar'

// Configure Vue Test Utils
config.global.plugins = [
  [Quasar, {
    plugins: { Notify, Loading, Dialog }
  }]
]

// Mock Quasar composables
config.global.mocks = {
  $t: (key) => key, // Mock i18n
  $q: {
    notify: vi.fn(),
    loading: {
      show: vi.fn(),
      hide: vi.fn()
    },
    dialog: vi.fn()
  }
}
