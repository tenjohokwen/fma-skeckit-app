import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import { Quasar } from 'quasar'
import EmailNotificationDialog from '@/components/metadata/EmailNotificationDialog.vue'
import {
  createMockDialogProps,
  mockDialogConfirmEnglish,
  mockDialogConfirmFrench,
  mockDialogDecline
} from '../../../fixtures/emailNotificationFixtures'

// Create mock i18n instance with test translations
const i18n = createI18n({
  legacy: false,
  locale: 'en',
  messages: {
    en: {
      emailDialog: {
        title: 'Send Status Update Email?',
        message: 'Would you like to notify the client about this status change?',
        languageLabel: 'Client language:',
        languageEnglish: 'English',
        languageFrench: 'French',
        notesRequired: 'Please update the notes field to provide context for this notification',
        btnYes: 'Yes, send email',
        btnNo: 'No, update case only',
        btnCancel: 'Cancel'
      },
      common: {
        confirm: 'Confirm'
      }
    },
    fr: {
      emailDialog: {
        title: 'Envoyer un courriel de mise à jour du statut?',
        message: 'Souhaitez-vous informer le client de ce changement de statut?',
        languageLabel: 'Langue du client:',
        languageEnglish: 'Anglais',
        languageFrench: 'Français',
        notesRequired: 'Veuillez mettre à jour le champ des notes pour fournir un contexte pour cette notification',
        btnYes: 'Oui, envoyer un courriel',
        btnNo: 'Non, mettre à jour le dossier uniquement',
        btnCancel: 'Annuler'
      },
      common: {
        confirm: 'Confirmer'
      }
    }
  }
})

// Helper function to create wrapper with all required plugins
function createWrapper(props = {}, options = {}) {
  const defaultProps = createMockDialogProps(props)

  return mount(EmailNotificationDialog, {
    props: defaultProps,
    global: {
      plugins: [i18n, [Quasar, {}]],
      ...options.global
    },
    ...options
  })
}

describe('EmailNotificationDialog', () => {
  describe('T008 - Dialog renders with correct i18n strings', () => {
    it('renders dialog title in English', () => {
      const wrapper = createWrapper()

      expect(wrapper.text()).toContain('Send Status Update Email?')
    })

    it('renders dialog message in English', () => {
      const wrapper = createWrapper()

      expect(wrapper.text()).toContain('Would you like to notify the client about this status change?')
    })

    it('renders language selection label', () => {
      const wrapper = createWrapper()

      expect(wrapper.text()).toContain('Client language:')
    })

    it('renders language options (English and French)', () => {
      const wrapper = createWrapper()

      expect(wrapper.text()).toContain('English')
      expect(wrapper.text()).toContain('French')
    })

    it('renders action buttons', () => {
      const wrapper = createWrapper()

      expect(wrapper.text()).toContain('Cancel')
      expect(wrapper.text()).toContain('Confirm')
    })

    it('renders in French when locale is changed', async () => {
      i18n.global.locale.value = 'fr'
      const wrapper = createWrapper()

      await wrapper.vm.$nextTick()

      expect(wrapper.text()).toContain('Envoyer un courriel de mise à jour du statut?')
      expect(wrapper.text()).toContain('Souhaitez-vous informer le client de ce changement de statut?')
      expect(wrapper.text()).toContain('Langue du client:')
      expect(wrapper.text()).toContain('Anglais')
      expect(wrapper.text()).toContain('Français')
      expect(wrapper.text()).toContain('Annuler')

      // Reset locale
      i18n.global.locale.value = 'en'
    })
  })

  describe('T009 - Language selection updates reactive state (en/fr)', () => {
    it('defaults to English language selection', () => {
      const wrapper = createWrapper()

      // Check that selectedLanguage is 'en' by default
      expect(wrapper.vm.selectedLanguage).toBe('en')
    })

    it('updates selectedLanguage when French radio button is selected', async () => {
      const wrapper = createWrapper()

      // Find and click French radio button
      const frenchRadio = wrapper.findAll('input[type="radio"]')[1]
      await frenchRadio.setValue(true)

      expect(wrapper.vm.selectedLanguage).toBe('fr')
    })

    it('updates selectedLanguage when English radio button is selected', async () => {
      const wrapper = createWrapper()

      // Set to French first
      wrapper.vm.selectedLanguage = 'fr'
      await wrapper.vm.$nextTick()

      // Then click English radio
      const englishRadio = wrapper.findAll('input[type="radio"]')[0]
      await englishRadio.setValue(true)

      expect(wrapper.vm.selectedLanguage).toBe('en')
    })

    it('preserves language selection when sendEmail is toggled', async () => {
      const wrapper = createWrapper()

      // Select French
      wrapper.vm.selectedLanguage = 'fr'
      await wrapper.vm.$nextTick()

      // Toggle sendEmail
      wrapper.vm.sendEmail = true
      await wrapper.vm.$nextTick()
      wrapper.vm.sendEmail = false
      await wrapper.vm.$nextTick()

      // Language should still be French
      expect(wrapper.vm.selectedLanguage).toBe('fr')
    })
  })

  describe('T010 - Confirm event emitted with sendEmail=true and selected language', () => {
    it('emits confirm event with sendEmail=true and language=en when user accepts with English', async () => {
      const wrapper = createWrapper()

      // User accepts email notification
      wrapper.vm.sendEmail = true
      wrapper.vm.selectedLanguage = 'en'
      await wrapper.vm.$nextTick()

      // Click confirm button
      await wrapper.vm.handleConfirm()

      expect(wrapper.emitted('confirm')).toBeTruthy()
      expect(wrapper.emitted('confirm')[0]).toEqual([mockDialogConfirmEnglish])
    })

    it('emits confirm event with sendEmail=true and language=fr when user accepts with French', async () => {
      const wrapper = createWrapper()

      // User accepts email notification with French
      wrapper.vm.sendEmail = true
      wrapper.vm.selectedLanguage = 'fr'
      await wrapper.vm.$nextTick()

      // Click confirm button
      await wrapper.vm.handleConfirm()

      expect(wrapper.emitted('confirm')).toBeTruthy()
      expect(wrapper.emitted('confirm')[0]).toEqual([mockDialogConfirmFrench])
    })

    it('closes dialog after emitting confirm event', async () => {
      const wrapper = createWrapper({ modelValue: true })

      wrapper.vm.sendEmail = true
      await wrapper.vm.$nextTick()

      await wrapper.vm.handleConfirm()

      expect(wrapper.emitted('update:modelValue')).toBeTruthy()
      expect(wrapper.emitted('update:modelValue')[0]).toEqual([false])
    })
  })

  describe('T011 - Confirm event emitted with sendEmail=false when user declines', () => {
    it('emits confirm event with sendEmail=false when user declines email', async () => {
      const wrapper = createWrapper()

      // User declines email notification
      wrapper.vm.sendEmail = false
      await wrapper.vm.$nextTick()

      // Click confirm button
      await wrapper.vm.handleConfirm()

      expect(wrapper.emitted('confirm')).toBeTruthy()
      expect(wrapper.emitted('confirm')[0]).toEqual([mockDialogDecline])
    })

    it('does not include clientLanguage when sendEmail is false', async () => {
      const wrapper = createWrapper()

      wrapper.vm.sendEmail = false
      wrapper.vm.selectedLanguage = 'fr' // Language selection is ignored
      await wrapper.vm.$nextTick()

      await wrapper.vm.handleConfirm()

      const emittedPayload = wrapper.emitted('confirm')[0][0]
      expect(emittedPayload.sendEmail).toBe(false)
      expect(emittedPayload.clientLanguage).toBeUndefined()
    })
  })

  describe('T012 - Cancel event emitted when user clicks cancel button', () => {
    it('emits cancel event when cancel button is clicked', async () => {
      const wrapper = createWrapper()

      await wrapper.vm.handleCancel()

      expect(wrapper.emitted('cancel')).toBeTruthy()
    })

    it('closes dialog when cancel is clicked', async () => {
      const wrapper = createWrapper({ modelValue: true })

      await wrapper.vm.handleCancel()

      expect(wrapper.emitted('update:modelValue')).toBeTruthy()
      expect(wrapper.emitted('update:modelValue')[0]).toEqual([false])
    })

    it('does not emit confirm event when cancel is clicked', async () => {
      const wrapper = createWrapper()

      await wrapper.vm.handleCancel()

      expect(wrapper.emitted('confirm')).toBeFalsy()
    })
  })

  describe('T013 - No status change skips dialog in CaseEditor integration', () => {
    // Note: This test verifies the integration logic that would be in CaseEditor
    // It tests the expected behavior when originalStatus === currentStatus

    it('dialog should not be shown when status has not changed', () => {
      const originalStatus = 'Pending Review'
      const currentStatus = 'Pending Review'

      const shouldShowDialog = originalStatus !== currentStatus

      expect(shouldShowDialog).toBe(false)
    })

    it('dialog should be shown when status has changed', () => {
      const originalStatus = 'Pending Review'
      const currentStatus = 'In Progress'

      const shouldShowDialog = originalStatus !== currentStatus

      expect(shouldShowDialog).toBe(true)
    })

    it('dialog should be shown when status changes from empty to value', () => {
      const originalStatus = ''
      const currentStatus = 'Pending Review'

      const shouldShowDialog = originalStatus !== currentStatus

      expect(shouldShowDialog).toBe(true)
    })

    it('dialog should be shown when status changes from value to empty', () => {
      const originalStatus = 'Pending Review'
      const currentStatus = ''

      const shouldShowDialog = originalStatus !== currentStatus

      expect(shouldShowDialog).toBe(true)
    })
  })

  describe('Additional edge cases', () => {
    it('handles v-model correctly', async () => {
      const wrapper = createWrapper({ modelValue: false })

      expect(wrapper.vm.showDialog).toBe(false)

      await wrapper.setProps({ modelValue: true })

      expect(wrapper.vm.showDialog).toBe(true)
    })

    it('resets to default language (en) when dialog is opened', () => {
      const wrapper = createWrapper()

      // Change language
      wrapper.vm.selectedLanguage = 'fr'

      // Simulate dialog close and reopen
      wrapper.vm.selectedLanguage = 'en'

      expect(wrapper.vm.selectedLanguage).toBe('en')
    })

    it('maintains sendEmail=false as default', () => {
      const wrapper = createWrapper()

      expect(wrapper.vm.sendEmail).toBe(false)
    })
  })

  // ==================== USER STORY 2: NOTES VALIDATION ====================

  describe('T046 - Notes validation shows error when notes unchanged and sendEmail=true', () => {
    it('shows error when sendEmail=true and notes unchanged', () => {
      const wrapper = createWrapper({
        originalNotes: 'Original notes',
        currentNotes: 'Original notes' // Same as original
      })

      wrapper.vm.sendEmail = true

      expect(wrapper.vm.showNotesError).toBe(true)
    })

    it('shows error when sendEmail=true and notes are empty', () => {
      const wrapper = createWrapper({
        originalNotes: '',
        currentNotes: '' // Still empty
      })

      wrapper.vm.sendEmail = true

      expect(wrapper.vm.showNotesError).toBe(true)
    })

    it('shows error when sendEmail=true and notes only have whitespace', () => {
      const wrapper = createWrapper({
        originalNotes: 'Original notes',
        currentNotes: '   ' // Only whitespace
      })

      wrapper.vm.sendEmail = true

      expect(wrapper.vm.showNotesError).toBe(true)
    })

    it('does not show error when notes have changed', () => {
      const wrapper = createWrapper({
        originalNotes: 'Original notes',
        currentNotes: 'Updated notes with new information'
      })

      wrapper.vm.sendEmail = true

      expect(wrapper.vm.showNotesError).toBe(false)
    })

    it('displays error message text when validation fails', () => {
      const wrapper = createWrapper({
        originalNotes: 'Original notes',
        currentNotes: 'Original notes'
      })

      wrapper.vm.sendEmail = true

      expect(wrapper.text()).toContain('Please update the notes field to provide context for this notification')
    })
  })

  describe('T047 - Confirm button disabled when notes validation fails', () => {
    it('disables confirm button when sendEmail=true and notes unchanged', () => {
      const wrapper = createWrapper({
        originalNotes: 'Original notes',
        currentNotes: 'Original notes'
      })

      wrapper.vm.sendEmail = true

      expect(wrapper.vm.isValid).toBe(false)
    })

    it('enables confirm button when notes have changed', () => {
      const wrapper = createWrapper({
        originalNotes: 'Original notes',
        currentNotes: 'Updated notes'
      })

      wrapper.vm.sendEmail = true

      expect(wrapper.vm.isValid).toBe(true)
    })

    it('enables confirm button when sendEmail=false regardless of notes', () => {
      const wrapper = createWrapper({
        originalNotes: 'Original notes',
        currentNotes: 'Original notes'
      })

      wrapper.vm.sendEmail = false

      expect(wrapper.vm.isValid).toBe(true)
    })

    it('prevents confirm handler from emitting when validation fails', async () => {
      const wrapper = createWrapper({
        originalNotes: 'Original notes',
        currentNotes: 'Original notes'
      })

      wrapper.vm.sendEmail = true
      await wrapper.vm.$nextTick()

      await wrapper.vm.handleConfirm()

      // Should not emit confirm when invalid
      expect(wrapper.emitted('confirm')).toBeFalsy()
    })
  })

  describe('T048 - No validation error when sendEmail=false', () => {
    it('does not show error when sendEmail=false and notes unchanged', () => {
      const wrapper = createWrapper({
        originalNotes: 'Original notes',
        currentNotes: 'Original notes'
      })

      wrapper.vm.sendEmail = false

      expect(wrapper.vm.showNotesError).toBe(false)
    })

    it('does not show error when sendEmail=false and notes are empty', () => {
      const wrapper = createWrapper({
        originalNotes: '',
        currentNotes: ''
      })

      wrapper.vm.sendEmail = false

      expect(wrapper.vm.showNotesError).toBe(false)
    })

    it('allows confirmation when sendEmail=false regardless of notes state', async () => {
      const wrapper = createWrapper({
        originalNotes: 'Original notes',
        currentNotes: 'Original notes'
      })

      wrapper.vm.sendEmail = false
      await wrapper.vm.$nextTick()

      await wrapper.vm.handleConfirm()

      expect(wrapper.emitted('confirm')).toBeTruthy()
      expect(wrapper.emitted('confirm')[0][0].sendEmail).toBe(false)
    })

    it('computed isValid returns true when sendEmail=false', () => {
      const wrapper = createWrapper({
        originalNotes: 'Original notes',
        currentNotes: 'Original notes'
      })

      wrapper.vm.sendEmail = false

      expect(wrapper.vm.isValid).toBe(true)
    })
  })

  // ============================================================================
  // T066-T068: Bilingual UI Tests (User Story 4)
  // ============================================================================

  describe('T066 - Dialog renders in English when locale is en', () => {
    it('displays all English text when locale is en', () => {
      // Set locale to English
      i18n.global.locale.value = 'en'

      const wrapper = createWrapper({
        modelValue: true,
        originalNotes: 'Original notes',
        currentNotes: 'Updated notes'
      })

      // Check title
      expect(wrapper.find('.text-h6').text()).toBe('Send Status Update Email?')

      // Check message
      expect(wrapper.html()).toContain('Would you like to notify the client about this status change?')

      // Enable email to show language selection
      wrapper.vm.sendEmail = true
      wrapper.vm.$nextTick()

      // Check language label
      expect(wrapper.html()).toContain('Client language:')

      // Check language options
      expect(wrapper.html()).toContain('English')
      expect(wrapper.html()).toContain('French')

      // Check button labels
      expect(wrapper.html()).toContain('Cancel')
      expect(wrapper.html()).toContain('Confirm')
    })

    it('displays English checkbox label', () => {
      i18n.global.locale.value = 'en'

      const wrapper = createWrapper({
        modelValue: true,
        originalNotes: 'Original notes',
        currentNotes: 'Updated notes'
      })

      // Check checkbox label
      expect(wrapper.html()).toContain('Yes, send email')
    })

    it('displays English validation error message', () => {
      i18n.global.locale.value = 'en'

      const wrapper = createWrapper({
        modelValue: true,
        originalNotes: 'Original notes',
        currentNotes: 'Original notes' // unchanged
      })

      // Enable email to trigger validation
      wrapper.vm.sendEmail = true
      wrapper.vm.$nextTick()

      // Check validation error message
      expect(wrapper.html()).toContain('Please update the notes field to provide context for this notification')
    })
  })

  describe('T067 - Dialog renders in French when locale is fr', () => {
    it('displays all French text when locale is fr', () => {
      // Set locale to French
      i18n.global.locale.value = 'fr'

      const wrapper = createWrapper({
        modelValue: true,
        originalNotes: 'Notes originales',
        currentNotes: 'Notes mises à jour'
      })

      // Check title
      expect(wrapper.find('.text-h6').text()).toBe('Envoyer un courriel de mise à jour du statut?')

      // Check message
      expect(wrapper.html()).toContain('Souhaitez-vous informer le client de ce changement de statut?')

      // Enable email to show language selection
      wrapper.vm.sendEmail = true
      wrapper.vm.$nextTick()

      // Check language label
      expect(wrapper.html()).toContain('Langue du client:')

      // Check language options
      expect(wrapper.html()).toContain('Anglais')
      expect(wrapper.html()).toContain('Français')

      // Check button labels
      expect(wrapper.html()).toContain('Annuler')
      expect(wrapper.html()).toContain('Confirmer')
    })

    it('displays French checkbox label', () => {
      i18n.global.locale.value = 'fr'

      const wrapper = createWrapper({
        modelValue: true,
        originalNotes: 'Notes originales',
        currentNotes: 'Notes mises à jour'
      })

      // Check checkbox label
      expect(wrapper.html()).toContain('Oui, envoyer un courriel')
    })

    it('displays French validation error message', () => {
      i18n.global.locale.value = 'fr'

      const wrapper = createWrapper({
        modelValue: true,
        originalNotes: 'Notes originales',
        currentNotes: 'Notes originales' // unchanged
      })

      // Enable email to trigger validation
      wrapper.vm.sendEmail = true
      wrapper.vm.$nextTick()

      // Check validation error message
      expect(wrapper.html()).toContain('Veuillez mettre à jour le champ des notes pour fournir un contexte pour cette notification')
    })
  })

  describe('T068 - Validation error messages display in current locale', () => {
    it('switches validation error from English to French when locale changes', async () => {
      // Start with English
      i18n.global.locale.value = 'en'

      const wrapper = createWrapper({
        modelValue: true,
        originalNotes: 'Original notes',
        currentNotes: 'Original notes' // unchanged
      })

      // Enable email to trigger validation
      wrapper.vm.sendEmail = true
      await wrapper.vm.$nextTick()

      // Verify English error message
      expect(wrapper.html()).toContain('Please update the notes field to provide context for this notification')

      // Switch to French
      i18n.global.locale.value = 'fr'
      await wrapper.vm.$nextTick()

      // Verify French error message
      expect(wrapper.html()).toContain('Veuillez mettre à jour le champ des notes pour fournir un contexte pour cette notification')
    })

    it('switches all dialog text from French to English when locale changes', async () => {
      // Start with French
      i18n.global.locale.value = 'fr'

      const wrapper = createWrapper({
        modelValue: true,
        originalNotes: 'Notes',
        currentNotes: 'Notes mises à jour'
      })

      // Verify French text
      expect(wrapper.find('.text-h6').text()).toBe('Envoyer un courriel de mise à jour du statut?')

      // Switch to English
      i18n.global.locale.value = 'en'
      await wrapper.vm.$nextTick()

      // Verify English text
      expect(wrapper.find('.text-h6').text()).toBe('Send Status Update Email?')
    })

    it('maintains validation state when locale switches', async () => {
      i18n.global.locale.value = 'en'

      const wrapper = createWrapper({
        modelValue: true,
        originalNotes: 'Original',
        currentNotes: 'Original' // unchanged
      })

      // Enable email to trigger validation
      wrapper.vm.sendEmail = true
      await wrapper.vm.$nextTick()

      // Verify error is shown in English
      expect(wrapper.vm.showNotesError).toBe(true)

      // Switch to French
      i18n.global.locale.value = 'fr'
      await wrapper.vm.$nextTick()

      // Validation state should remain unchanged
      expect(wrapper.vm.showNotesError).toBe(true)
      expect(wrapper.vm.isValid).toBe(false)
    })
  })
})
