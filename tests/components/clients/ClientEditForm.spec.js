import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { Quasar } from 'quasar'
import ClientEditForm from 'src/components/clients/ClientEditForm.vue'

// Mock Quasar's dialog
const mockDialog = vi.fn()

vi.mock('quasar', async () => {
  const actual = await vi.importActual('quasar')
  return {
    ...actual,
    useQuasar: () => ({
      notify: vi.fn(),
      dialog: mockDialog
    })
  }
})

describe('ClientEditForm', () => {
  let wrapper
  const mockClient = {
    clientId: 'test-123',
    firstName: 'John',
    lastName: 'Doe',
    nationalId: '12345-67890',
    telephone: '+237612345678',
    email: 'john.doe@example.com'
  }

  beforeEach(() => {
    wrapper = mount(ClientEditForm, {
      props: {
        client: mockClient,
        isSaving: false
      },
      global: {
        plugins: [[Quasar, {}]]
      }
    })
  })

  it('renders form with client data', () => {
    expect(wrapper.find('input[type="text"]').exists()).toBe(true)
  })

  it('emits submit event with valid data', async () => {
    // Fill form with valid data
    const inputs = wrapper.findAll('input')

    // Submit form
    await wrapper.find('form').trigger('submit.prevent')

    // Check if submit event was emitted
    expect(wrapper.emitted()).toHaveProperty('submit')
  })

  it('shows validation errors for required fields', async () => {
    // Clear required field
    const firstNameInput = wrapper.findAll('input')[0]
    await firstNameInput.setValue('')
    await firstNameInput.trigger('blur')

    // Validation should show error after blur
    await wrapper.vm.$nextTick()

    // Component should have validation state
    expect(wrapper.vm.v$.firstName.$error).toBe(true)
  })

  it('emits cancel event when cancel button is clicked', async () => {
    // Click cancel button (no changes made)
    const cancelButton = wrapper.findAll('button')[1]
    await cancelButton.trigger('click')

    // Check if cancel event was emitted
    expect(wrapper.emitted()).toHaveProperty('cancel')
  })

  it('validates email format', async () => {
    const emailInput = wrapper.findAll('input')[4]

    // Set invalid email
    await emailInput.setValue('invalid-email')
    await emailInput.trigger('blur')

    await wrapper.vm.$nextTick()

    // Validation should detect invalid email
    expect(wrapper.vm.v$.email.$error).toBe(true)
  })

  it('disables form inputs when saving', async () => {
    await wrapper.setProps({ isSaving: true })

    const inputs = wrapper.findAll('input')
    inputs.forEach(input => {
      expect(input.attributes('disabled')).toBeDefined()
    })
  })

  it('shows loading state on save button when saving', async () => {
    await wrapper.setProps({ isSaving: true })

    const saveButton = wrapper.findAll('button')[0]
    expect(saveButton.attributes('disabled')).toBeDefined()
  })

  it('detects changes in form data', async () => {
    const firstNameInput = wrapper.findAll('input')[0]

    // Change first name
    await firstNameInput.setValue('Jane')
    await wrapper.vm.$nextTick()

    // hasChanges should be true
    expect(wrapper.vm.hasChanges).toBe(true)
  })
})
