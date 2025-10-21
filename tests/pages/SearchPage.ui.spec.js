/**
 * SearchPage.ui.spec.js
 *
 * Exhaustive UI tests for SearchPage component.
 * Tests role-based access control, tab switching, client/case search,
 * dialog interactions, and all user workflows.
 *
 * Test Users:
 * - Admin: tenjoh_okwen@yahoo.com (password: admin*123!, role: ROLE_ADMIN)
 * - Normal User: john@yahoo.com (password: admin*123!, role: ROLE_USER)
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import SearchPage from 'src/pages/SearchPage.vue'

// Mock user credentials
const ADMIN_USER = {
  email: 'tenjoh_okwen@yahoo.com',
  fullName: 'Tenjoh Okwen',
  role: 'ROLE_ADMIN',
  status: 'VERIFIED'
}

const NORMAL_USER = {
  email: 'john@yahoo.com',
  fullName: 'John Doe',
  role: 'ROLE_USER',
  status: 'VERIFIED'
}

// Mock API responses
const mockClientSearchResults = [
  {
    clientId: 'client-uuid-001',
    firstName: 'Alice',
    lastName: 'Johnson',
    nationalId: 'NAT-001',
    telephone: '1234567890',
    email: 'alice@example.com',
    folderId: 'folder-001'
  },
  {
    clientId: 'client-uuid-002',
    firstName: 'Bob',
    lastName: 'Smith',
    nationalId: 'NAT-002',
    telephone: '0987654321',
    email: 'bob@example.com',
    folderId: 'folder-002'
  }
]

const mockCaseSearchResults = [
  {
    caseId: 'CASE-001',
    caseName: 'Contract Review',
    clientId: 'client-uuid-001',
    clientName: 'Alice Johnson',
    assignedTo: 'John Doe',
    caseType: 'Legal',
    status: 'Open',
    notes: 'Urgent review needed'
  },
  {
    caseId: 'CASE-002',
    caseName: 'Property Dispute',
    clientId: 'client-uuid-002',
    clientName: 'Bob Smith',
    assignedTo: '',
    caseType: 'Real Estate',
    status: 'Pending',
    notes: ''
  }
]

// Mock functions
let mockNotifyInfo
let mockNotifyError
let mockNotifySuccess
let mockRouterPush
let mockInitializeFuzzySearch
let mockApiPost

// Mock composables
vi.mock('src/composables/useNotifications', () => ({
  useNotifications: () => ({
    notifyInfo: (...args) => mockNotifyInfo(...args),
    notifyError: (...args) => mockNotifyError(...args),
    notifySuccess: (...args) => mockNotifySuccess(...args)
  })
}))

vi.mock('src/composables/useSearch', () => ({
  useSearch: () => ({
    initializeFuzzySearch: (...args) => mockInitializeFuzzySearch(...args)
  })
}))

vi.mock('src/services/api', () => ({
  api: {
    post: (...args) => mockApiPost(...args)
  }
}))

vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: (...args) => mockRouterPush(...args)
  })
}))

const mockT = vi.fn((key, options) => {
  if (options && options.count !== undefined) {
    return `${options.count} results found`
  }
  const translations = {
    'search.pageTitle': 'Search',
    'search.pageSubtitle': 'Find clients and cases',
    'search.tabs.clients': 'Clients',
    'search.tabs.cases': 'Cases',
    'search.searching': 'Searching...',
    'search.resultsTitle': 'Search Results',
    'search.noResults': 'No results found',
    'search.noResultsHint': 'Try adjusting your search criteria',
    'search.initialStateTitle': 'Start your search',
    'search.initialStateHint': 'Use the search bar above',
    'search.error.title': 'Search Error',
    'search.error.generic': 'An error occurred',
    'client.create.title': 'Create New Client',
    'client.create.subtitle': 'Enter client information',
    'client.search.noResults': 'No clients found',
    'case.create.title': 'Create New Case',
    'case.create.success': 'Case created successfully',
    'case.create.error.duplicate': 'Case ID already exists',
    'case.create.validation.format': 'Invalid case ID format'
  }
  return translations[key] || key
})

describe('SearchPage - Exhaustive UI Tests', () => {
  let wrapper

  const createWrapper = (options = {}) => {
    const {
      user = null,
      searchBarData = {},
      clientStoreState = {}
    } = options

    // Reset mock functions
    mockNotifyInfo = vi.fn()
    mockNotifyError = vi.fn()
    mockNotifySuccess = vi.fn()
    mockRouterPush = vi.fn()
    mockInitializeFuzzySearch = vi.fn()
    mockApiPost = vi.fn()

    const pinia = createTestingPinia({
      createSpy: vi.fn,
      initialState: {
        auth: {
          user: user,
          token: user ? 'mock-token' : null,
          tokenExpiry: user ? Date.now() + 3600000 : null
        },
        client: {
          searchResults: clientStoreState.searchResults || [],
          loading: clientStoreState.loading || false,
          error: clientStoreState.error || null,
          searchQuery: clientStoreState.searchQuery || {}
        }
      }
    })

    const searchBarRef = {
      searchResults: searchBarData.searchResults || [],
      isSearching: searchBarData.isSearching || false,
      searchError: searchBarData.searchError || null
    }

    return mount(SearchPage, {
      global: {
        plugins: [pinia],
        mocks: {
          $t: mockT,
          $router: {
            push: mockRouterPush
          }
        },
        stubs: {
          QPage: false,
          QTabs: false,
          QTab: false,
          QTabPanels: false,
          QTabPanel: false,
          QDialog: false,
          QCard: false,
          QCardSection: false,
          QSeparator: false,
          QIcon: true,
          SearchBar: {
            name: 'SearchBar',
            template: '<div class="search-bar-stub"></div>',
            expose: searchBarRef
          },
          ClientSearchForm: {
            name: 'ClientSearchForm',
            template: '<div class="client-search-form-stub"></div>',
            props: ['loading']
          },
          ClientSearchResults: {
            name: 'ClientSearchResults',
            template: '<div class="client-search-results-stub"></div>',
            props: ['results', 'loading']
          },
          ClientForm: {
            name: 'ClientForm',
            template: '<div class="client-form-stub"></div>',
            props: ['loading']
          },
          CaseForm: {
            name: 'CaseForm',
            template: '<div class="case-form-stub"></div>',
            props: ['loading']
          },
          CaseCard: {
            name: 'CaseCard',
            template: '<div class="case-card-stub"></div>',
            props: ['caseData']
          },
          LoadingIndicator: {
            name: 'LoadingIndicator',
            template: '<div class="loading-stub"></div>',
            props: ['message']
          },
          ErrorDisplay: {
            name: 'ErrorDisplay',
            template: '<div class="error-stub"></div>',
            props: ['type', 'title', 'message', 'dismissible']
          }
        }
      }
    })
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
  })

  // ==================== COMPONENT RENDERING ====================

  describe('Component Rendering - General', () => {
    it('renders the search page container', () => {
      wrapper = createWrapper()
      expect(wrapper.find('.search-page').exists()).toBe(true)
    })

    it('renders page header with title', () => {
      wrapper = createWrapper()
      expect(wrapper.find('.page-header').exists()).toBe(true)
      expect(wrapper.text()).toContain('Search')
    })

    it('renders page subtitle', () => {
      wrapper = createWrapper()
      expect(wrapper.text()).toContain('Find clients and cases')
    })

    it('defaults to Clients tab on mount', () => {
      wrapper = createWrapper()
      expect(wrapper.vm.activeTab).toBe('clients')
    })
  })

  // ==================== TAB SWITCHING ====================

  describe('Tab Switching', () => {
    it('shows Clients tab content when Clients tab is active', async () => {
      wrapper = createWrapper()
      wrapper.vm.activeTab = 'clients'
      await wrapper.vm.$nextTick()

      const clientSearchForm = wrapper.findComponent({ name: 'ClientSearchForm' })
      expect(clientSearchForm.exists()).toBe(true)
    })

    it('shows Cases tab content when Cases tab is active', async () => {
      wrapper = createWrapper()
      wrapper.vm.activeTab = 'cases'
      await wrapper.vm.$nextTick()

      const searchBar = wrapper.findComponent({ name: 'SearchBar' })
      expect(searchBar.exists()).toBe(true)
    })

    it('switches from Clients to Cases tab', async () => {
      wrapper = createWrapper()
      expect(wrapper.vm.activeTab).toBe('clients')

      wrapper.vm.activeTab = 'cases'
      await wrapper.vm.$nextTick()

      expect(wrapper.vm.activeTab).toBe('cases')
    })
  })

  // ==================== CLIENT SEARCH TAB - ADMIN USER ====================

  describe('Client Search Tab - Admin User', () => {
    it('renders ClientSearchForm for admin', async () => {
      wrapper = createWrapper({ user: ADMIN_USER })
      wrapper.vm.activeTab = 'clients'
      await wrapper.vm.$nextTick()

      const form = wrapper.findComponent({ name: 'ClientSearchForm' })
      expect(form.exists()).toBe(true)
    })

    it('renders ClientSearchResults for admin', async () => {
      wrapper = createWrapper({ user: ADMIN_USER })
      wrapper.vm.activeTab = 'clients'
      await wrapper.vm.$nextTick()

      const results = wrapper.findComponent({ name: 'ClientSearchResults' })
      expect(results.exists()).toBe(true)
    })

    it('displays client search results for admin', async () => {
      wrapper = createWrapper({
        user: ADMIN_USER,
        clientStoreState: { searchResults: mockClientSearchResults }
      })
      await wrapper.vm.$nextTick()

      expect(wrapper.vm.displayedClientResults).toEqual(mockClientSearchResults)
    })

    it('allows admin to view client details', async () => {
      wrapper = createWrapper({ user: ADMIN_USER })
      const client = mockClientSearchResults[0]

      await wrapper.vm.handleViewClient(client)

      expect(mockRouterPush).toHaveBeenCalledWith({
        name: 'client-details',
        params: { clientId: client.clientId }
      })
    })

    it('allows admin to open create case dialog from client result', async () => {
      wrapper = createWrapper({ user: ADMIN_USER })
      const client = mockClientSearchResults[0]

      await wrapper.vm.handleCreateCase(client)

      expect(wrapper.vm.showCreateCaseDialog).toBe(true)
      expect(wrapper.vm.selectedClientForCase).toEqual(client)
    })
  })

  // ==================== CLIENT SEARCH TAB - NORMAL USER ====================

  describe('Client Search Tab - Normal User', () => {
    it('renders ClientSearchForm for normal user', async () => {
      wrapper = createWrapper({ user: NORMAL_USER })
      wrapper.vm.activeTab = 'clients'
      await wrapper.vm.$nextTick()

      const form = wrapper.findComponent({ name: 'ClientSearchForm' })
      expect(form.exists()).toBe(true)
    })

    it('renders ClientSearchResults for normal user', async () => {
      wrapper = createWrapper({ user: NORMAL_USER })
      wrapper.vm.activeTab = 'clients'
      await wrapper.vm.$nextTick()

      const results = wrapper.findComponent({ name: 'ClientSearchResults' })
      expect(results.exists()).toBe(true)
    })

    it('displays client search results for normal user', async () => {
      wrapper = createWrapper({
        user: NORMAL_USER,
        clientStoreState: { searchResults: mockClientSearchResults }
      })
      await wrapper.vm.$nextTick()

      expect(wrapper.vm.displayedClientResults).toEqual(mockClientSearchResults)
    })

    it('allows normal user to view client details', async () => {
      wrapper = createWrapper({ user: NORMAL_USER })
      const client = mockClientSearchResults[0]

      await wrapper.vm.handleViewClient(client)

      expect(mockRouterPush).toHaveBeenCalledWith({
        name: 'client-details',
        params: { clientId: client.clientId }
      })
    })
  })

  // ==================== CASE SEARCH TAB - ADMIN USER ====================

  describe('Case Search Tab - Admin User', () => {
    it('renders SearchBar component for admin', async () => {
      wrapper = createWrapper({ user: ADMIN_USER })
      wrapper.vm.activeTab = 'cases'
      await wrapper.vm.$nextTick()

      const searchBar = wrapper.findComponent({ name: 'SearchBar' })
      expect(searchBar.exists()).toBe(true)
    })

    it('shows initial state before admin performs search', async () => {
      wrapper = createWrapper({ user: ADMIN_USER })
      wrapper.vm.activeTab = 'cases'
      await wrapper.vm.$nextTick()

      expect(wrapper.find('.initial-state').exists()).toBe(true)
    })

    it('shows loading state when admin search is in progress', async () => {
      wrapper = createWrapper({
        user: ADMIN_USER,
        searchBarData: { isSearching: true }
      })
      wrapper.vm.activeTab = 'cases'
      await wrapper.vm.$nextTick()

      const loading = wrapper.findComponent({ name: 'LoadingIndicator' })
      expect(loading.exists()).toBe(true)
    })

    it('displays case search results for admin', async () => {
      wrapper = createWrapper({
        user: ADMIN_USER,
        searchBarData: { searchResults: mockCaseSearchResults }
      })
      wrapper.vm.activeTab = 'cases'
      await wrapper.vm.$nextTick()

      const caseCards = wrapper.findAllComponents({ name: 'CaseCard' })
      expect(caseCards.length).toBe(2)
    })

    it('allows admin to view case in read-only mode', async () => {
      wrapper = createWrapper({ user: ADMIN_USER })

      await wrapper.vm.handleViewCase('CASE-001')

      expect(mockRouterPush).toHaveBeenCalledWith({
        name: 'CaseEdit',
        params: { caseId: 'CASE-001' },
        query: { mode: 'view' }
      })
    })

    it('allows admin to edit case in edit mode', async () => {
      wrapper = createWrapper({ user: ADMIN_USER })

      await wrapper.vm.handleEditCase('CASE-001')

      expect(mockRouterPush).toHaveBeenCalledWith({
        name: 'CaseEdit',
        params: { caseId: 'CASE-001' },
        query: { mode: 'edit' }
      })
    })

    it('shows error state when admin search fails', async () => {
      const mockError = { message: 'Network error' }
      wrapper = createWrapper({
        user: ADMIN_USER,
        searchBarData: {
          searchResults: [],
          isSearching: false,
          searchError: mockError
        }
      })
      wrapper.vm.activeTab = 'cases'
      await wrapper.vm.$nextTick()

      const errorDisplay = wrapper.findComponent({ name: 'ErrorDisplay' })
      expect(errorDisplay.exists()).toBe(true)
    })
  })

  // ==================== CASE SEARCH TAB - NORMAL USER ====================

  describe('Case Search Tab - Normal User', () => {
    it('renders SearchBar component for normal user', async () => {
      wrapper = createWrapper({ user: NORMAL_USER })
      wrapper.vm.activeTab = 'cases'
      await wrapper.vm.$nextTick()

      const searchBar = wrapper.findComponent({ name: 'SearchBar' })
      expect(searchBar.exists()).toBe(true)
    })

    it('shows initial state before normal user performs search', async () => {
      wrapper = createWrapper({ user: NORMAL_USER })
      wrapper.vm.activeTab = 'cases'
      await wrapper.vm.$nextTick()

      expect(wrapper.find('.initial-state').exists()).toBe(true)
    })

    it('displays case search results for normal user', async () => {
      wrapper = createWrapper({
        user: NORMAL_USER,
        searchBarData: { searchResults: mockCaseSearchResults }
      })
      wrapper.vm.activeTab = 'cases'
      await wrapper.vm.$nextTick()

      const caseCards = wrapper.findAllComponents({ name: 'CaseCard' })
      expect(caseCards.length).toBe(2)
    })

    it('allows normal user to view case in read-only mode', async () => {
      wrapper = createWrapper({ user: NORMAL_USER })

      await wrapper.vm.handleViewCase('CASE-001')

      expect(mockRouterPush).toHaveBeenCalledWith({
        name: 'CaseEdit',
        params: { caseId: 'CASE-001' },
        query: { mode: 'view' }
      })
    })
  })

  // ==================== CREATE CASE DIALOG - ADMIN USER ====================

  describe('Create Case Dialog - Admin User', () => {
    it('does not show create case dialog initially', () => {
      wrapper = createWrapper({ user: ADMIN_USER })
      expect(wrapper.vm.showCreateCaseDialog).toBe(false)
    })

    it('opens create case dialog when admin triggers it', async () => {
      wrapper = createWrapper({ user: ADMIN_USER })
      const client = mockClientSearchResults[0]
      wrapper.vm.selectedClientForCase = client
      wrapper.vm.showCreateCaseDialog = true
      await wrapper.vm.$nextTick()

      expect(wrapper.vm.showCreateCaseDialog).toBe(true)
    })

    it('handles case creation by admin successfully', async () => {
      wrapper = createWrapper({ user: ADMIN_USER })
      const client = mockClientSearchResults[0]
      const caseData = { caseId: 'TEST-001' }

      mockApiPost.mockResolvedValue({ data: { caseId: 'TEST-001' } })

      wrapper.vm.selectedClientForCase = client

      await wrapper.vm.handleCaseSubmit(caseData)
      await flushPromises()

      expect(mockApiPost).toHaveBeenCalledWith('case.create', {
        clientId: client.clientId,
        caseId: caseData.caseId
      })
      expect(mockNotifySuccess).toHaveBeenCalledWith('Case created successfully')
      expect(mockRouterPush).toHaveBeenCalledWith({
        name: 'client-details',
        params: { clientId: client.clientId }
      })
    })

    it('prevents case creation when client info is missing for admin', async () => {
      wrapper = createWrapper({ user: ADMIN_USER })
      wrapper.vm.selectedClientForCase = null

      await wrapper.vm.handleCaseSubmit({ caseId: 'TEST-001' })

      expect(mockNotifyError).toHaveBeenCalledWith('Client information is missing')
      expect(mockApiPost).not.toHaveBeenCalled()
    })
  })

  // ==================== COMPUTED PROPERTIES ====================

  describe('Computed Properties', () => {
    it('computes searchResults from searchBarRef', () => {
      wrapper = createWrapper({
        searchBarData: { searchResults: mockCaseSearchResults }
      })

      expect(wrapper.vm.searchResults).toEqual(mockCaseSearchResults)
    })

    it('returns empty array for searchResults when searchBarRef is null', () => {
      wrapper = createWrapper()
      wrapper.vm.searchBarRef = null

      expect(wrapper.vm.searchResults).toEqual([])
    })

    it('computes isSearching from searchBarRef', () => {
      wrapper = createWrapper({
        searchBarData: { isSearching: true }
      })

      expect(wrapper.vm.isSearching).toBe(true)
    })

    it('computes displayedClientResults from client store', () => {
      wrapper = createWrapper({
        clientStoreState: { searchResults: mockClientSearchResults }
      })

      expect(wrapper.vm.displayedClientResults).toEqual(mockClientSearchResults)
    })
  })

  // ==================== COMPONENT LIFECYCLE ====================

  describe('Component Lifecycle', () => {
    it('initializes with correct default state', () => {
      wrapper = createWrapper()

      expect(wrapper.vm.activeTab).toBe('clients')
      expect(wrapper.vm.showCreateClientDialog).toBe(false)
      expect(wrapper.vm.showCreateCaseDialog).toBe(false)
      expect(wrapper.vm.creatingCase).toBe(false)
      expect(wrapper.vm.selectedClientForCase).toBe(null)
    })
  })
})
