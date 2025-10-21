/**
 * selenium.config.js
 *
 * Configuration for Selenium WebDriver E2E tests
 */

module.exports = {
  // Base URL for the application
  baseUrl: process.env.BASE_URL || 'http://localhost:9000',

  // Browser configuration
  browser: {
    name: 'chrome', // Options: 'chrome', 'firefox', 'safari', 'edge'
    headless: process.env.HEADLESS === 'true',
    options: {
      chrome: {
        args: [
          '--disable-gpu',
          '--no-sandbox',
          '--disable-dev-shm-usage',
          '--window-size=1920,1080',
          '--disable-web-security', // Only for testing
          '--disable-features=VizDisplayCompositor'
        ]
      },
      firefox: {
        args: [
          '-headless',
          '--width=1920',
          '--height=1080'
        ]
      }
    }
  },

  // Timeouts (in milliseconds)
  timeouts: {
    implicit: 5000,      // Implicit wait for element location
    explicit: 10000,     // Explicit wait for conditions
    pageLoad: 30000,     // Page load timeout
    script: 30000        // Script execution timeout
  },

  // Test users
  users: {
    admin: {
      email: 'tenjoh_okwen@yahoo.com',
      password: 'admin*123!',
      role: 'ROLE_ADMIN',
      name: 'Tenjoh Okwen'
    },
    normalUser: {
      email: 'john@yahoo.com',
      password: 'admin*123!',
      role: 'ROLE_USER',
      name: 'John Doe'
    }
  },

  // Screenshot configuration
  screenshots: {
    enabled: true,
    path: './tests/e2e/screenshots',
    onFailure: true,
    onSuccess: false
  },

  // Mocha configuration
  mocha: {
    timeout: 60000,        // Test timeout
    slow: 10000,           // Slow test threshold
    reporter: 'spec',      // Reporter type: 'spec', 'json', 'html'
    bail: false            // Stop on first failure
  },

  // Parallel execution
  parallel: {
    enabled: false,        // Enable parallel test execution
    workers: 2             // Number of parallel workers
  },

  // Logging
  logging: {
    level: 'info',         // Options: 'error', 'warn', 'info', 'debug'
    verbose: false
  }
}
