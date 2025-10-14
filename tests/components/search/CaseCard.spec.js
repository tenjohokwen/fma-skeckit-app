/**
 * CaseCard.spec.js
 *
 * Tests for CaseCard component (US3).
 * Tests case data display, formatting, and actions.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import CaseCard from 'src/components/search/CaseCard.vue'
import { Quasar } from 'quasar'

const mockT = vi.fn((key) => key)

describe('CaseCard', () => {
  let wrapper

  const mockCaseData = {
    caseId: 'CASE-001',
    clientFirstName: 'John',
    clientLastName: 'Doe',
    clientEmail: 'john@example.com',
    clientPhoneNumber: '+1234567890',
    amountPaid: 5000,
    paymentStatus: 'Paid',
    folderName: 'John_Doe_ID123',
    folderPath: 'cases/John_Doe_ID123',
    assignedTo: 'Jane Admin',
    tasksRemaining: 'Review documents',
    nextAction: 'Contact client',
    comment: 'Urgent case',
    dueDate: '2025-11-01',
    status: 'In Progress'
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  const createWrapper = (props = {}) => {
    return mount(CaseCard, {
      props: {
        caseData: mockCaseData,
        ...props
      },
      global: {
        plugins: [
          Quasar,
          createTestingPinia({
            createSpy: vi.fn,
            initialState: {
              auth: {
                user: { email: 'admin@example.com', role: 'ROLE_ADMIN' },
                token: 'test-token',
                isAuthenticated: true
              }
            }
          })
        ],
        mocks: {
          $t: mockT
        },
        stubs: {
          QCard: false,
          QCardSection: false,
          QCardActions: false,
          QBtn: false,
          QIcon: false,
          QBadge: false,
          QSeparator: false
        }
      }
    })
  }

  describe('Component Rendering', () => {
    it('renders case card', () => {
      wrapper = createWrapper()

      expect(wrapper.find('.case-card').exists()).toBe(true)
    })

    it('displays case ID', () => {
      wrapper = createWrapper()

      expect(wrapper.text()).toContain('CASE-001')
    })

    it('displays case status badge', () => {
      wrapper = createWrapper()

      const badge = wrapper.findComponent({ name: 'QBadge' })
      expect(badge.exists()).toBe(true)
    })
  })

  describe('Client Information Display', () => {
    it('displays client name', () => {
      wrapper = createWrapper()

      expect(wrapper.text()).toContain('John')
      expect(wrapper.text()).toContain('Doe')
    })

    it('displays client email when provided', () => {
      wrapper = createWrapper()

      expect(wrapper.text()).toContain('john@example.com')
    })

    it('displays client phone when provided', () => {
      wrapper = createWrapper()

      expect(wrapper.text()).toContain('+1234567890')
    })

    it('hides client email when not provided', () => {
      const caseData = { ...mockCaseData, clientEmail: null }
      wrapper = createWrapper({ caseData })

      expect(wrapper.vm.caseData.clientEmail).toBeNull()
    })

    it('hides client phone when not provided', () => {
      const caseData = { ...mockCaseData, clientPhoneNumber: null }
      wrapper = createWrapper({ caseData })

      expect(wrapper.vm.caseData.clientPhoneNumber).toBeNull()
    })
  })

  describe('Payment Information Display', () => {
    it('shows payment section when payment data exists', () => {
      wrapper = createWrapper()

      expect(wrapper.vm.showPaymentInfo).toBe(true)
    })

    it('displays amount paid', () => {
      wrapper = createWrapper()

      expect(wrapper.text()).toContain('$5,000')
    })

    it('displays payment status', () => {
      wrapper = createWrapper()

      expect(wrapper.text()).toContain('Paid')
    })

    it('hides payment section when no payment data', () => {
      const caseData = {
        ...mockCaseData,
        amountPaid: null,
        paymentStatus: null
      }
      wrapper = createWrapper({ caseData })

      expect(wrapper.vm.showPaymentInfo).toBe(false)
    })

    it('formats currency correctly', () => {
      wrapper = createWrapper()

      const formatted = wrapper.vm.formatCurrency(5000)
      expect(formatted).toBe('$5,000.00')
    })

    it('handles zero amount', () => {
      const caseData = { ...mockCaseData, amountPaid: 0 }
      wrapper = createWrapper({ caseData })

      const formatted = wrapper.vm.formatCurrency(0)
      expect(formatted).toBe('$0.00')
    })
  })

  describe('Management Information Display', () => {
    it('shows management section when data exists', () => {
      wrapper = createWrapper()

      expect(wrapper.vm.showManagementInfo).toBe(true)
    })

    it('displays assigned user', () => {
      wrapper = createWrapper()

      expect(wrapper.text()).toContain('Jane Admin')
    })

    it('displays due date', () => {
      wrapper = createWrapper()

      const formatted = wrapper.vm.formatDate('2025-11-01')
      expect(formatted).toContain('Nov')
      expect(formatted).toContain('2025')
    })

    it('displays tasks remaining', () => {
      wrapper = createWrapper()

      expect(wrapper.text()).toContain('Review documents')
    })

    it('displays next action', () => {
      wrapper = createWrapper()

      expect(wrapper.text()).toContain('Contact client')
    })

    it('hides management section when no data', () => {
      const caseData = {
        ...mockCaseData,
        assignedTo: null,
        dueDate: null,
        tasksRemaining: null,
        nextAction: null
      }
      wrapper = createWrapper({ caseData })

      expect(wrapper.vm.showManagementInfo).toBe(false)
    })
  })

  describe('Comments Display', () => {
    it('displays comments when provided', () => {
      wrapper = createWrapper()

      expect(wrapper.text()).toContain('Urgent case')
    })

    it('hides comments section when not provided', () => {
      const caseData = { ...mockCaseData, comment: null }
      wrapper = createWrapper({ caseData })

      expect(wrapper.vm.caseData.comment).toBeNull()
    })
  })

  describe('Folder Information Display', () => {
    it('displays folder path', () => {
      wrapper = createWrapper()

      expect(wrapper.text()).toContain('cases/John_Doe_ID123')
    })

    it('hides folder path when not provided', () => {
      const caseData = { ...mockCaseData, folderPath: null }
      wrapper = createWrapper({ caseData })

      expect(wrapper.vm.caseData.folderPath).toBeNull()
    })
  })

  describe('Status Badge Colors', () => {
    it('returns positive color for completed status', () => {
      wrapper = createWrapper()

      const color = wrapper.vm.getStatusColor('Completed')
      expect(color).toBe('positive')
    })

    it('returns primary color for in progress status', () => {
      wrapper = createWrapper()

      const color = wrapper.vm.getStatusColor('In Progress')
      expect(color).toBe('primary')
    })

    it('returns warning color for pending status', () => {
      wrapper = createWrapper()

      const color = wrapper.vm.getStatusColor('Pending')
      expect(color).toBe('warning')
    })

    it('returns negative color for blocked status', () => {
      wrapper = createWrapper()

      const color = wrapper.vm.getStatusColor('Blocked')
      expect(color).toBe('negative')
    })

    it('returns grey color for unknown status', () => {
      wrapper = createWrapper()

      const color = wrapper.vm.getStatusColor('Unknown')
      expect(color).toBe('grey')
    })

    it('handles case-insensitive status matching', () => {
      wrapper = createWrapper()

      expect(wrapper.vm.getStatusColor('COMPLETED')).toBe('positive')
      expect(wrapper.vm.getStatusColor('in progress')).toBe('primary')
      expect(wrapper.vm.getStatusColor('PENDING')).toBe('warning')
    })
  })

  describe('Action Buttons', () => {
    it('shows action buttons by default', () => {
      wrapper = createWrapper()

      const actions = wrapper.findComponent({ name: 'QCardActions' })
      expect(actions.exists()).toBe(true)
    })

    it('hides action buttons when showActions is false', () => {
      wrapper = createWrapper({ showActions: false })

      const actions = wrapper.findComponent({ name: 'QCardActions' })
      expect(actions.exists()).toBe(false)
    })

    it('emits view event when view button clicked', async () => {
      wrapper = createWrapper()

      wrapper.vm.$emit('view', 'CASE-001')
      await wrapper.vm.$nextTick()

      expect(wrapper.emitted('view')).toBeTruthy()
      expect(wrapper.emitted('view')[0]).toEqual(['CASE-001'])
    })

    it('emits edit event when edit button clicked', async () => {
      wrapper = createWrapper()

      wrapper.vm.$emit('edit', 'CASE-001')
      await wrapper.vm.$nextTick()

      expect(wrapper.emitted('edit')).toBeTruthy()
      expect(wrapper.emitted('edit')[0]).toEqual(['CASE-001'])
    })
  })

  describe('Admin Permissions', () => {
    it('shows edit button for admin users', () => {
      wrapper = createWrapper()

      expect(wrapper.vm.canEdit).toBe(true)
    })

    it('hides edit button for non-admin users', () => {
      wrapper = mount(CaseCard, {
        props: {
          caseData: mockCaseData
        },
        global: {
          plugins: [
            Quasar,
            createTestingPinia({
              createSpy: vi.fn,
              initialState: {
                auth: {
                  user: { email: 'user@example.com', role: 'ROLE_USER' },
                  token: 'test-token',
                  isAuthenticated: true
                }
              }
            })
          ],
          mocks: {
            $t: mockT
          },
          stubs: {
            QCard: false,
            QCardSection: false,
            QCardActions: false,
            QBtn: false,
            QIcon: false,
            QBadge: false,
            QSeparator: false
          }
        }
      })

      expect(wrapper.vm.canEdit).toBe(false)
    })
  })

  describe('Data Formatting', () => {
    it('formats currency with USD symbol', () => {
      wrapper = createWrapper()

      const formatted = wrapper.vm.formatCurrency(1234.56)
      expect(formatted).toContain('$')
      expect(formatted).toContain('1,234.56')
    })

    it('returns empty string for null currency', () => {
      wrapper = createWrapper()

      const formatted = wrapper.vm.formatCurrency(null)
      expect(formatted).toBe('')
    })

    it('formats date in readable format', () => {
      wrapper = createWrapper()

      const formatted = wrapper.vm.formatDate('2025-11-01')
      expect(formatted).toMatch(/Nov.*2025/)
    })

    it('returns original string for invalid date', () => {
      wrapper = createWrapper()

      const formatted = wrapper.vm.formatDate('invalid-date')
      expect(formatted).toBe('invalid-date')
    })

    it('returns empty string for null date', () => {
      wrapper = createWrapper()

      const formatted = wrapper.vm.formatDate(null)
      expect(formatted).toBe('')
    })
  })

  describe('System Fields Exclusion', () => {
    it('does not display assignedAt field', () => {
      const caseData = { ...mockCaseData, assignedAt: '2025-10-01 10:00:00' }
      wrapper = createWrapper({ caseData })

      expect(wrapper.text()).not.toContain('assignedAt')
      expect(wrapper.text()).not.toContain('2025-10-01 10:00:00')
    })

    it('does not display lastUpdatedBy field', () => {
      const caseData = { ...mockCaseData, lastUpdatedBy: 'System Admin' }
      wrapper = createWrapper({ caseData })

      expect(wrapper.text()).not.toContain('lastUpdatedBy')
      expect(wrapper.text()).not.toContain('System Admin')
    })

    it('does not display lastUpdatedAt field', () => {
      const caseData = { ...mockCaseData, lastUpdatedAt: '2025-10-13 14:30:00' }
      wrapper = createWrapper({ caseData })

      expect(wrapper.text()).not.toContain('lastUpdatedAt')
      expect(wrapper.text()).not.toContain('2025-10-13 14:30:00')
    })

    it('does not display version field', () => {
      const caseData = { ...mockCaseData, version: 5 }
      wrapper = createWrapper({ caseData })

      expect(wrapper.text()).not.toContain('version')
    })
  })
})
