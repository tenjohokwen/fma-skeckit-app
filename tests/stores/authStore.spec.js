/**
 * authStore.spec.js
 *
 * Tests for authStore Pinia store
 * Per constitution: Plain JavaScript tests with Vitest
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore } from 'src/stores/authStore'

// Mock API service
vi.mock('src/services/api', () => ({
  api: {
    post: vi.fn()
  }
}))

import { api } from 'src/services/api'

describe('authStore', () => {
  let store

  beforeEach(() => {
    setActivePinia(createPinia())
    store = useAuthStore()

    // Clear localStorage
    localStorage.clear()

    // Reset mocks
    vi.clearAllMocks()
  })

  afterEach(() => {
    localStorage.clear()
  })

  describe('Initial State', () => {
    it('initializes with null user', () => {
      expect(store.user).toBeNull()
    })

    it('initializes with null token', () => {
      expect(store.token).toBeNull()
    })

    it('initializes with null token expiry', () => {
      expect(store.tokenExpiry).toBeNull()
    })

    it('initializes as not loading', () => {
      expect(store.isLoading).toBe(false)
    })

    it('initializes with no error', () => {
      expect(store.error).toBeNull()
    })
  })

  describe('Computed Properties', () => {
    it('isAuthenticated returns false when no token', () => {
      expect(store.isAuthenticated).toBe(false)
    })

    it('isAuthenticated returns true when token and user exist', () => {
      store.token = 'test-token'
      store.user = { email: 'test@example.com' }
      expect(store.isAuthenticated).toBe(true)
    })

    it('isTokenValid returns false when no expiry', () => {
      expect(store.isTokenValid).toBe(false)
    })

    it('isTokenValid returns true when expiry is in future', () => {
      store.tokenExpiry = Date.now() + 60000 // 1 minute from now
      expect(store.isTokenValid).toBe(true)
    })

    it('isTokenValid returns false when expiry is in past', () => {
      store.tokenExpiry = Date.now() - 60000 // 1 minute ago
      expect(store.isTokenValid).toBe(false)
    })

    it('isAdmin returns false when user is null', () => {
      expect(store.isAdmin).toBe(false)
    })

    it('isAdmin returns true when user role is ROLE_ADMIN', () => {
      store.user = { email: 'admin@example.com', role: 'ROLE_ADMIN' }
      expect(store.isAdmin).toBe(true)
    })

    it('isAdmin returns false when user role is ROLE_USER', () => {
      store.user = { email: 'user@example.com', role: 'ROLE_USER' }
      expect(store.isAdmin).toBe(false)
    })

    it('isVerified returns true when user status is VERIFIED', () => {
      store.user = { email: 'test@example.com', status: 'VERIFIED' }
      expect(store.isVerified).toBe(true)
    })

    it('isVerified returns false when user status is PENDING', () => {
      store.user = { email: 'test@example.com', status: 'PENDING' }
      expect(store.isVerified).toBe(false)
    })
  })

  describe('setAuth', () => {
    it('sets token, expiry, and user', () => {
      const tokenData = { value: 'test-token', ttl: Date.now() + 60000 }
      const userData = { email: 'test@example.com', role: 'ROLE_USER' }

      store.setAuth(tokenData, userData)

      expect(store.token).toBe('test-token')
      expect(store.tokenExpiry).toBe(tokenData.ttl)
      expect(store.user).toEqual(userData)
    })

    it('persists auth data to localStorage', () => {
      const tokenData = { value: 'test-token', ttl: Date.now() + 60000 }
      const userData = { email: 'test@example.com', role: 'ROLE_USER' }

      store.setAuth(tokenData, userData)

      expect(localStorage.getItem('auth_token')).toBe('test-token')
      expect(localStorage.getItem('auth_expiry')).toBe(tokenData.ttl.toString())
      expect(localStorage.getItem('auth_user')).toBe(JSON.stringify(userData))
    })
  })

  describe('clearAuth', () => {
    it('clears token, expiry, and user', () => {
      store.token = 'test-token'
      store.tokenExpiry = Date.now() + 60000
      store.user = { email: 'test@example.com' }

      store.clearAuth()

      expect(store.token).toBeNull()
      expect(store.tokenExpiry).toBeNull()
      expect(store.user).toBeNull()
    })

    it('removes auth data from localStorage', () => {
      localStorage.setItem('auth_token', 'test-token')
      localStorage.setItem('auth_expiry', Date.now().toString())
      localStorage.setItem('auth_user', JSON.stringify({ email: 'test@example.com' }))

      store.clearAuth()

      expect(localStorage.getItem('auth_token')).toBeNull()
      expect(localStorage.getItem('auth_expiry')).toBeNull()
      expect(localStorage.getItem('auth_user')).toBeNull()
    })
  })

  describe('Login', () => {
    it('calls API with credentials', async () => {
      const credentials = { email: 'test@example.com', password: 'password123' }
      api.post.mockResolvedValue({
        token: { value: 'test-token', ttl: Date.now() + 60000 },
        data: { email: 'test@example.com', role: 'ROLE_USER' }
      })

      await store.login(credentials)

      expect(api.post).toHaveBeenCalledWith('auth.login', credentials)
    })

    it('sets loading state during login', async () => {
      api.post.mockImplementation(() => new Promise(() => {})) // Never resolves

      const loginPromise = store.login({ email: 'test@example.com', password: 'password123' })

      expect(store.isLoading).toBe(true)

      // Clean up
      api.post.mockResolvedValue({})
      await loginPromise.catch(() => {})
    })

    it('sets auth data on successful login', async () => {
      const tokenData = { value: 'test-token', ttl: Date.now() + 60000 }
      const userData = { email: 'test@example.com', role: 'ROLE_USER' }

      api.post.mockResolvedValue({ token: tokenData, data: userData })

      await store.login({ email: 'test@example.com', password: 'password123' })

      expect(store.token).toBe(tokenData.value)
      expect(store.user).toEqual(userData)
    })

    it('sets error on failed login', async () => {
      api.post.mockRejectedValue(new Error('Invalid credentials'))

      await expect(store.login({ email: 'test@example.com', password: 'wrong' })).rejects.toThrow()

      expect(store.error).toBe('Invalid credentials')
    })
  })

  describe('Logout', () => {
    it('clears auth data', () => {
      store.token = 'test-token'
      store.user = { email: 'test@example.com' }

      store.logout()

      expect(store.token).toBeNull()
      expect(store.user).toBeNull()
    })
  })

  describe('Signup', () => {
    it('calls API with credentials', async () => {
      const credentials = { email: 'new@example.com', password: 'password123' }
      api.post.mockResolvedValue({ data: { success: true } })

      await store.signup(credentials)

      expect(api.post).toHaveBeenCalledWith('auth.signup', credentials)
    })

    it('handles signup error', async () => {
      api.post.mockRejectedValue(new Error('Email already exists'))

      await expect(store.signup({ email: 'existing@example.com', password: 'pass' })).rejects.toThrow()

      expect(store.error).toBe('Email already exists')
    })
  })

  describe('Password Reset', () => {
    it('requests password reset', async () => {
      api.post.mockResolvedValue({ data: { success: true } })

      await store.requestPasswordReset('test@example.com')

      expect(api.post).toHaveBeenCalledWith('auth.requestPasswordReset', { email: 'test@example.com' })
    })

    it('verifies OTP', async () => {
      api.post.mockResolvedValue({ data: { success: true } })

      await store.verifyOTP('test@example.com', '123456')

      expect(api.post).toHaveBeenCalledWith('auth.verifyOTP', { email: 'test@example.com', otp: '123456' })
    })

    it('resets password with verified OTP', async () => {
      api.post.mockResolvedValue({ data: { success: true } })

      await store.resetPassword('test@example.com', '123456', 'newpassword')

      expect(api.post).toHaveBeenCalledWith('auth.resetPassword', {
        email: 'test@example.com',
        otp: '123456',
        newPassword: 'newpassword'
      })
    })
  })

  describe('LocalStorage Initialization', () => {
    it('restores auth from valid localStorage data', () => {
      const futureExpiry = Date.now() + 60000
      localStorage.setItem('auth_token', 'stored-token')
      localStorage.setItem('auth_expiry', futureExpiry.toString())
      localStorage.setItem('auth_user', JSON.stringify({ email: 'stored@example.com' }))

      // Create a new store instance to trigger init
      setActivePinia(createPinia())
      const newStore = useAuthStore()

      expect(newStore.token).toBe('stored-token')
      expect(newStore.tokenExpiry).toBe(futureExpiry)
      expect(newStore.user).toEqual({ email: 'stored@example.com' })
    })

    it('clears expired localStorage data on init', () => {
      const pastExpiry = Date.now() - 60000
      localStorage.setItem('auth_token', 'expired-token')
      localStorage.setItem('auth_expiry', pastExpiry.toString())
      localStorage.setItem('auth_user', JSON.stringify({ email: 'expired@example.com' }))

      // Create a new store instance to trigger init
      setActivePinia(createPinia())
      const newStore = useAuthStore()

      expect(newStore.token).toBeNull()
      expect(newStore.user).toBeNull()
      expect(localStorage.getItem('auth_token')).toBeNull()
    })
  })
})
