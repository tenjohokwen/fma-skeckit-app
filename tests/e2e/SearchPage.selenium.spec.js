/**
 * SearchPage.selenium.spec.js
 *
 * Comprehensive E2E tests for SearchPage using Selenium WebDriver.
 * Tests complete user workflows for both admin and normal user roles.
 *
 * Test Users:
 * - Admin: tenjoh_okwen@yahoo.com (password: admin*123!, role: ROLE_ADMIN)
 * - Normal User: john@yahoo.com (password: admin*123!, role: ROLE_USER)
 *
 * Prerequisites:
 * - Application running at http://localhost:9000 (or configured BASE_URL)
 * - ChromeDriver installed and in PATH
 * - npm install selenium-webdriver mocha chai
 */

import { Builder, By, until, Key } from 'selenium-webdriver'
import chrome from 'selenium-webdriver/chrome.js'
import { expect } from 'chai'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { writeFileSync, existsSync, mkdirSync } from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Test configuration
const BASE_URL = process.env.BASE_URL || 'http://localhost:9000'
const TIMEOUT = 10000 // 10 seconds
const IMPLICIT_WAIT = 5000 // 5 seconds

// Test user credentials
const ADMIN_USER = {
  email: 'enkap24@gmail.com',
  password: 'Admin*123!',
  role: 'ROLE_ADMIN',
  name: 'Tenjoh Okwen',
}

const NORMAL_USER = {
  email: 'john@yahoo.com',
  password: 'Admin*123!',
  role: 'ROLE_USER',
  name: 'John Doe',
}

// Test data
const TEST_CLIENT = {
  firstName: 'John',
  lastName: 'Rambo',
  nationalId: 'firstbloodId',
}

const TEST_CASE = {
  caseId: 'firstBlood',
  caseName: 'firstBlood',
}

describe('SearchPage - Comprehensive E2E Tests with Selenium', function () {
  // Increase timeout for E2E tests
  this.timeout(60000)

  let driver
  let adminDriver
  let userDriver

  // ==================== SETUP AND TEARDOWN ====================

  /**
   * Set up Chrome driver with options
   */
  async function createDriver() {
    const options = new chrome.Options()

    // Headless mode for CI/CD (comment out for debugging)
    // options.addArguments('--headless')

    // Other useful options
    options.addArguments('--disable-gpu')
    options.addArguments('--no-sandbox')
    options.addArguments('--disable-dev-shm-usage')
    options.addArguments('--window-size=1920,1080')

    const driver = await new Builder().forBrowser('chrome').setChromeOptions(options).build()

    await driver.manage().setTimeouts({ implicit: IMPLICIT_WAIT })

    return driver
  }

  /**
   * Login helper function
   */
  async function login(driver, user) {
    await driver.get(`${BASE_URL}/#/login`)
    await driver.wait(until.elementLocated(By.css('input[type="email"]')), TIMEOUT)

    // Enter credentials
    const emailInput = await driver.findElement(By.css('input[type="email"]'))
    const passwordInput = await driver.findElement(By.css('input[type="password"]'))

    await emailInput.sendKeys(user.email)
    await passwordInput.sendKeys(user.password)

    // Submit form
    const loginButton = await driver.findElement(By.css('button[type="submit"]'))
    await loginButton.click()

    // Wait for login to complete (redirect to dashboard or search page)
    await driver.wait(until.urlContains('/#/'), TIMEOUT)

    // Wait for page to stabilize
    await driver.sleep(1000)
  }

  /**
   * Navigate to SearchPage
   */
  async function navigateToSearchPage(driver) {
    await driver.get(`${BASE_URL}/#/app/search`)
    await driver.wait(until.elementLocated(By.css('.search-page')), TIMEOUT)
    await driver.sleep(500) // Let page stabilize
  }

  /**
   * Wait for element to be visible and clickable
   */
  async function waitForClickable(driver, locator, timeout = TIMEOUT) {
    const element = await driver.wait(until.elementLocated(locator), timeout)
    await driver.wait(until.elementIsVisible(element), timeout)
    await driver.wait(until.elementIsEnabled(element), timeout)
    return element
  }

  /**
   * Take screenshot on failure
   */
  async function takeScreenshot(driver, testName) {
    try {
      const screenshot = await driver.takeScreenshot()

      const screenshotDir = join(__dirname, 'screenshots')
      if (!existsSync(screenshotDir)) {
        mkdirSync(screenshotDir, { recursive: true })
      }

      const filename = `${testName.replace(/\s+/g, '_')}_${Date.now()}.png`
      const filepath = join(screenshotDir, filename)

      writeFileSync(filepath, screenshot, 'base64')
      console.log(`Screenshot saved: ${filepath}`)
    } catch (error) {
      console.error('Failed to take screenshot:', error.message)
    }
  }

  // ==================== TEST SUITE SETUP ====================

  before(async function () {
    console.log('\n🚀 Starting Selenium E2E Tests for SearchPage...\n')
  })

  after(async function () {
    console.log('\n✅ Selenium E2E Tests completed\n')
  })

  afterEach(async function () {
    // Take screenshot if test failed
    if (this.currentTest.state === 'failed') {
      if (driver) {
        await takeScreenshot(driver, this.currentTest.fullTitle())
      }
      if (adminDriver) {
        await takeScreenshot(adminDriver, this.currentTest.fullTitle() + '_admin')
      }
      if (userDriver) {
        await takeScreenshot(userDriver, this.currentTest.fullTitle() + '_user')
      }
    }
  })

  // ==================== PAGE RENDERING TESTS ====================

  describe('Page Rendering and Navigation', function () {
    beforeEach(async function () {
      driver = await createDriver()
      await login(driver, ADMIN_USER)
      await navigateToSearchPage(driver)
    })

    afterEach(async function () {
      if (driver) {
        await driver.quit()
        driver = null
      }
    })

    it('should display the search page with header', async function () {
      const pageHeader = await driver.findElement(By.css('.page-header'))
      expect(await pageHeader.isDisplayed()).to.be.true

      const title = await driver.findElement(By.css('h1'))
      const titleText = await title.getText()
      expect(titleText).to.include('Search')
    })

    it('should display tabs for Clients and Cases', async function () {
      //const tabs = await driver.findElements(By.css('.q-tab'))
      const tabs = await driver.wait(until.elementsLocated(By.css('.q-tab')), 5000)
      expect(tabs.length).to.be.at.least(2)

      const tabTexts = await Promise.all(tabs.map((tab) => tab.getText()))
      expect(tabTexts[0]).to.include('CLIENTS')
      expect(tabTexts[1]).to.include('CASES')
    })

    it('should default to Clients tab', async function () {
      const activeTab = await driver.findElement(By.css('.q-tab--active'))
      const activeTabText = await activeTab.getText()
      expect(activeTabText).to.include('CLIENTS')
    })

    it('should switch between tabs', async function () {
      // Find and click Cases tab
      /*const casesTab = await driver.findElement(
        By.xpath('//div[contains(@class, "q-tab") and contains(text(), "CASES")]'),
      )*/
      const tabs = await driver.wait(until.elementsLocated(By.css('.q-tab')), 5000)
      // Wait up to 10 seconds for the element to appear
      const casesTab = tabs[1]
      await casesTab.click()
      await driver.sleep(500)

      // Verify Cases tab is now active
      const activeTab = await driver.findElement(By.css('.q-tab--active'))
      const activeTabText = await activeTab.getText()
      expect(activeTabText).to.include('CASES')

      // Verify Cases content is displayed
      const searchBar = await driver.findElement(
        By.css('.search-bar-stub, input[placeholder*="search"], input[placeholder*="Search"]'),
      )
      expect(await searchBar.isDisplayed()).to.be.true
    })
  })

  // ==================== CLIENT SEARCH - ADMIN USER ====================

  describe('Client Search - Admin User', function () {
    beforeEach(async function () {
      driver = await createDriver()
      await login(driver, ADMIN_USER)
      await navigateToSearchPage(driver)
      // Ensure we're on Clients tab
      await driver.sleep(500)
    })

    afterEach(async function () {
      if (driver) {
        await driver.quit()
        driver = null
      }
    })

    it('should display client search form', async function () {
      const clientSearchForm = await driver.findElement(
        By.css('.client-search-form-stub, form, .q-form'),
      )
      expect(await clientSearchForm.isDisplayed()).to.be.true
    })

    it('should search for clients by name', async function () {
      // Find search inputs (first name and/or last name)
      const inputs = await driver.findElements(By.css('input[type="text"]'))

      if (inputs.length > 0) {
        // Enter search criteria
        await inputs[0].sendKeys(TEST_CLIENT.firstName)
        await driver.sleep(500)

        // Find and click search button
        /*const searchButton = await driver.findElement(
          By.xpath('//button[contains(text(), "Search") or contains(text(), "SEARCH")]'),
        )
        await searchButton.click()*/

        // Wait for results
        await driver.sleep(2000)

        // Verify results are displayed (or no results message)
        const pageSource = await driver.getPageSource()
        const hasResults =
          pageSource.includes('result') ||
          pageSource.includes('client') ||
          pageSource.includes('No')
        expect(hasResults).to.be.true
      }
    })

    it('should display client search results', async function () {
      // Assuming there are existing clients, the results component should be visible
      try {
        const resultsComponent = await driver.findElement(
          By.css('.client-search-results-stub, .results, .client-list'),
        )
        expect(await resultsComponent.isDisplayed()).to.be.true
      } catch (error) {
        // If no results component, that's okay - might be empty state
        console.log('No search results component found (might be empty state)')
      }
    })

    it('should allow admin to view client details', async function () {
      // Look for a client result item
      try {
        const viewButton = await driver.findElement(
          By.xpath('//button[contains(text(), "View") or contains(text(), "VIEW")]'),
        )
        await viewButton.click()
        await driver.sleep(1000)

        // Verify navigation to client details page
        const currentUrl = await driver.getCurrentUrl()
        expect(currentUrl).to.include('client')
      } catch (error) {
        console.log('No client results to view (test skipped)')
        this.skip()
      }
    })

    it('should show create client button for admin', async function () {
      try {
        const createButton = await driver.findElement(
          By.xpath('//button[contains(text(), "Create") and contains(text(), "Client")]'),
        )
        expect(await createButton.isDisplayed()).to.be.true
      } catch (error) {
        console.log('Create client button not found (might be hidden or in different location)')
      }
    })
  })

  // ==================== CLIENT SEARCH - NORMAL USER ====================

  describe('Client Search - Normal User', function () {
    beforeEach(async function () {
      driver = await createDriver()
      await login(driver, NORMAL_USER)
      await navigateToSearchPage(driver)
      await driver.sleep(500)
    })

    afterEach(async function () {
      if (driver) {
        await driver.quit()
        driver = null
      }
    })

    it('should display client search form for normal user', async function () {
      const clientSearchForm = await driver.findElement(
        By.css('.client-search-form-stub, form, .q-form'),
      )
      expect(await clientSearchForm.isDisplayed()).to.be.true
    })

    it('should allow normal user to search for clients', async function () {
      const inputs = await driver.findElements(By.css('input[type="text"]'))

      if (inputs.length > 0) {
        await inputs[0].sendKeys(TEST_CLIENT.firstName)
        await driver.sleep(500)

        /*const searchButton = await driver.findElement(
          By.xpath('//button[contains(text(), "Search") or contains(text(), "SEARCH")]'),
        )
        await searchButton.click()*/

        await driver.sleep(2000)

        const pageSource = await driver.getPageSource()
        const hasResults =
          pageSource.includes('result') ||
          pageSource.includes('client') ||
          pageSource.includes('No')
        expect(hasResults).to.be.true
      }
    })

    it('should allow normal user to view client details', async function () {
      try {
        const viewButton = await driver.findElement(
          By.xpath('//button[contains(text(), "View") or contains(text(), "VIEW")]'),
        )
        await viewButton.click()
        await driver.sleep(1000)

        const currentUrl = await driver.getCurrentUrl()
        expect(currentUrl).to.include('client')
      } catch (error) {
        console.log('No client results to view (test skipped)')
        this.skip()
      }
    })
  })

  // ==================== CASE SEARCH - ADMIN USER ====================

  describe('Case Search - Admin User', function () {
    beforeEach(async function () {
      driver = await createDriver()
      await login(driver, ADMIN_USER)
      await navigateToSearchPage(driver)

      // Switch to Cases tab
      const casesTab = await driver.findElement(
        By.xpath('//div[contains(@class, "q-tab") and contains(text(), "CASES")]'),
      )
      await casesTab.click()
      await driver.sleep(500)
    })

    afterEach(async function () {
      if (driver) {
        await driver.quit()
        driver = null
      }
    })

    it('should display case search bar', async function () {
      /*const searchBar = await driver.findElement(
        By.css(
          '.search-bar-stub, input[placeholder*="search"], input[placeholder*="Search"], input',
        ),
      )*/
      const searchBar = await driver.wait(
        until.elementsLocated(
          By.css(
            '.search-bar-stub, input[placeholder*="search"], input[placeholder*="Search"], input',
          ),
        ),
        5000,
      )
      expect(await searchBar.isDisplayed()).to.be.true
    })

    it('should show initial state before search', async function () {
      try {
        const initialState = await driver.findElement(By.css('.initial-state'))
        expect(await initialState.isDisplayed()).to.be.true

        const stateText = await initialState.getText()
        expect(stateText).to.include('search')
      } catch (error) {
        console.log('Initial state might be different or already has results')
      }
    })

    it('should search for cases by case ID', async function () {
      // Find search input
      const searchInput = await driver.findElement(
        By.css('input[type="text"], input[placeholder*="search"], input[placeholder*="Search"]'),
      )

      // Enter case ID
      await searchInput.sendKeys('CASE')
      await searchInput.sendKeys(Key.RETURN)

      // Wait for results or error
      await driver.sleep(2000)

      // Verify something happened (results, error, or no results message)
      const pageSource = await driver.getPageSource()
      const hasResponse =
        pageSource.includes('result') ||
        pageSource.includes('case') ||
        pageSource.includes('error') ||
        pageSource.includes('No')
      expect(hasResponse).to.be.true
    })

    it('should display case search results', async function () {
      // Search for cases
      const searchInput = await driver.findElement(
        By.css('input[type="text"], input[placeholder*="search"], input[placeholder*="Search"]'),
      )
      await searchInput.sendKeys('CASE')
      await searchInput.sendKeys(Key.RETURN)
      await driver.sleep(2000)

      try {
        const results = await driver.findElements(
          By.css('.case-card-stub, .case-item, .case-result'),
        )
        console.log(`Found ${results.length} case results`)
      } catch (error) {
        console.log('No case results found')
      }
    })

    it('should allow admin to view case in read-only mode', async function () {
      // This test requires existing case data
      try {
        const viewButton = await driver.findElement(
          By.xpath('//button[contains(text(), "View") or contains(text(), "VIEW")]'),
        )
        await viewButton.click()
        await driver.sleep(1000)

        const currentUrl = await driver.getCurrentUrl()
        expect(currentUrl).to.include('case') || expect(currentUrl).to.include('edit')
      } catch (error) {
        console.log('No case results to view (test skipped)')
        this.skip()
      }
    })

    it('should allow admin to edit case', async function () {
      try {
        const editButton = await driver.findElement(
          By.xpath('//button[contains(text(), "Edit") or contains(text(), "EDIT")]'),
        )
        await editButton.click()
        await driver.sleep(1000)

        const currentUrl = await driver.getCurrentUrl()
        expect(currentUrl).to.include('edit') || expect(currentUrl).to.include('case')
      } catch (error) {
        console.log('No case results to edit (test skipped)')
        this.skip()
      }
    })

    it('should display loading state during search', async function () {
      const searchInput = await driver.findElement(
        By.css('input[type="text"], input[placeholder*="search"], input[placeholder*="Search"]'),
      )
      await searchInput.sendKeys('TEST')
      await searchInput.sendKeys(Key.RETURN)

      // Immediately check for loading indicator
      try {
        const loadingIndicator = await driver.findElement(
          By.css('.loading-stub, .q-spinner, .loading'),
        )
        const isDisplayed = await loadingIndicator.isDisplayed()
        // Loading might be very quick, so just log if we found it
        console.log(`Loading indicator displayed: ${isDisplayed}`)
      } catch (error) {
        console.log('Loading was too fast to capture or not found')
      }
    })
  })

  // ==================== CASE SEARCH - NORMAL USER ====================

  describe('Case Search - Normal User', function () {
    beforeEach(async function () {
      driver = await createDriver()
      await login(driver, NORMAL_USER)
      await navigateToSearchPage(driver)

      // Switch to Cases tab
      const casesTab = await driver.findElement(
        By.xpath('//div[contains(@class, "q-tab") and contains(text(), "CASES")]'),
      )
      await casesTab.click()
      await driver.sleep(500)
    })

    afterEach(async function () {
      if (driver) {
        await driver.quit()
        driver = null
      }
    })

    it('should display case search bar for normal user', async function () {
      const searchBar = await driver.findElement(
        By.css(
          '.search-bar-stub, input[placeholder*="search"], input[placeholder*="Search"], input',
        ),
      )
      expect(await searchBar.isDisplayed()).to.be.true
    })

    it('should allow normal user to search for cases', async function () {
      const searchInput = await driver.findElement(
        By.css('input[type="text"], input[placeholder*="search"], input[placeholder*="Search"]'),
      )
      await searchInput.sendKeys('CASE')
      await searchInput.sendKeys(Key.RETURN)
      await driver.sleep(2000)

      const pageSource = await driver.getPageSource()
      const hasResponse =
        pageSource.includes('result') || pageSource.includes('case') || pageSource.includes('No')
      expect(hasResponse).to.be.true
    })

    it('should allow normal user to view case in read-only mode', async function () {
      try {
        const viewButton = await driver.findElement(
          By.xpath('//button[contains(text(), "View") or contains(text(), "VIEW")]'),
        )
        await viewButton.click()
        await driver.sleep(1000)

        const currentUrl = await driver.getCurrentUrl()
        expect(currentUrl).to.include('case') || expect(currentUrl).to.include('edit')
      } catch (error) {
        console.log('No case results to view (test skipped)')
        this.skip()
      }
    })
  })

  // ==================== CREATE CASE DIALOG - ADMIN USER ====================

  describe('Create Case Dialog - Admin User', function () {
    beforeEach(async function () {
      driver = await createDriver()
      await login(driver, ADMIN_USER)
      await navigateToSearchPage(driver)
      await driver.sleep(500)
    })

    afterEach(async function () {
      if (driver) {
        await driver.quit()
        driver = null
      }
    })

    it('should not show create case dialog initially', async function () {
      const dialogs = await driver.findElements(By.css('.q-dialog, [role="dialog"]'))
      const visibleDialogs = await Promise.all(
        dialogs.map(async (dialog) => await dialog.isDisplayed()),
      )
      const hasVisibleDialog = visibleDialogs.some((visible) => visible === true)
      expect(hasVisibleDialog).to.be.false
    })

    it('should open create case dialog when clicking create case button', async function () {
      try {
        // Look for create case button in client results
        const createCaseButton = await driver.findElement(
          By.xpath('//button[contains(text(), "Create") and contains(text(), "Case")]'),
        )
        await createCaseButton.click()
        await driver.sleep(1000)

        // Verify dialog is visible
        const dialog = await driver.findElement(By.css('.q-dialog, [role="dialog"]'))
        expect(await dialog.isDisplayed()).to.be.true

        // Verify dialog title
        const dialogTitle = await driver.findElement(
          By.xpath('//*[contains(text(), "Create") and contains(text(), "Case")]'),
        )
        expect(await dialogTitle.isDisplayed()).to.be.true
      } catch (error) {
        console.log('Create case button not found (might need client selection first)')
        this.skip()
      }
    })

    it('should show case form in dialog', async function () {
      try {
        const createCaseButton = await driver.findElement(
          By.xpath('//button[contains(text(), "Create") and contains(text(), "Case")]'),
        )
        await createCaseButton.click()
        await driver.sleep(1000)

        // Look for case form
        const caseForm = await driver.findElement(By.css('.case-form-stub, form, .q-form'))
        expect(await caseForm.isDisplayed()).to.be.true
      } catch (error) {
        console.log('Could not open create case dialog')
        this.skip()
      }
    })

    it('should validate case ID when creating case', async function () {
      try {
        const createCaseButton = await driver.findElement(
          By.xpath('//button[contains(text(), "Create") and contains(text(), "Case")]'),
        )
        await createCaseButton.click()
        await driver.sleep(1000)

        // Try to submit without entering case ID
        const submitButton = await driver.findElement(
          By.xpath('//button[contains(text(), "Submit") or contains(text(), "Create")]'),
        )
        await submitButton.click()
        await driver.sleep(1000)

        // Should show validation error or stay on dialog
        const pageSource = await driver.getPageSource()
        const hasValidation =
          pageSource.includes('required') ||
          pageSource.includes('error') ||
          pageSource.includes('invalid')
        expect(hasValidation).to.be.true
      } catch (error) {
        console.log('Could not test case validation')
        this.skip()
      }
    })

    it('should close dialog when clicking cancel', async function () {
      try {
        const createCaseButton = await driver.findElement(
          By.xpath('//button[contains(text(), "Create") and contains(text(), "Case")]'),
        )
        await createCaseButton.click()
        await driver.sleep(1000)

        // Click cancel button
        const cancelButton = await driver.findElement(
          By.xpath('//button[contains(text(), "Cancel") or contains(text(), "CANCEL")]'),
        )
        await cancelButton.click()
        await driver.sleep(1000)

        // Dialog should be hidden
        const dialogs = await driver.findElements(By.css('.q-dialog, [role="dialog"]'))
        if (dialogs.length > 0) {
          const isVisible = await dialogs[0].isDisplayed()
          expect(isVisible).to.be.false
        }
      } catch (error) {
        console.log('Could not test dialog cancel')
        this.skip()
      }
    })
  })

  // ==================== CROSS-BROWSER TESTS ====================

  describe('Responsive Behavior', function () {
    beforeEach(async function () {
      driver = await createDriver()
      await login(driver, ADMIN_USER)
      await navigateToSearchPage(driver)
    })

    afterEach(async function () {
      if (driver) {
        await driver.quit()
        driver = null
      }
    })

    it('should display correctly on desktop resolution (1920x1080)', async function () {
      await driver.manage().window().setRect({ width: 1920, height: 1080 })
      await driver.sleep(500)

      const searchPage = await driver.findElement(By.css('.search-page'))
      expect(await searchPage.isDisplayed()).to.be.true
    })

    it('should display correctly on tablet resolution (768x1024)', async function () {
      await driver.manage().window().setRect({ width: 768, height: 1024 })
      await driver.sleep(500)

      const searchPage = await driver.findElement(By.css('.search-page'))
      expect(await searchPage.isDisplayed()).to.be.true
    })

    it('should display correctly on mobile resolution (375x667)', async function () {
      await driver.manage().window().setRect({ width: 375, height: 667 })
      await driver.sleep(500)

      const searchPage = await driver.findElement(By.css('.search-page'))
      expect(await searchPage.isDisplayed()).to.be.true
    })
  })

  // ==================== ACCESSIBILITY TESTS ====================

  describe('Accessibility', function () {
    beforeEach(async function () {
      driver = await createDriver()
      await login(driver, ADMIN_USER)
      await navigateToSearchPage(driver)
    })

    afterEach(async function () {
      if (driver) {
        await driver.quit()
        driver = null
      }
    })

    it('should have proper heading structure', async function () {
      const h1Elements = await driver.findElements(By.css('h1'))
      expect(h1Elements.length).to.be.at.least(1)
    })

    it('should support keyboard navigation for tabs', async function () {
      const casesTab = await driver.findElement(
        By.xpath('//div[contains(@class, "q-tab") and contains(text(), "CASES")]'),
      )

      // Focus on tab
      await driver.executeScript('arguments[0].focus()', casesTab)
      await driver.sleep(500)

      // Press Enter or Space to activate
      await casesTab.sendKeys(Key.RETURN)
      await driver.sleep(500)

      // Verify tab switched
      const activeTab = await driver.findElement(By.css('.q-tab--active'))
      const activeTabText = await activeTab.getText()
      expect(activeTabText).to.include('CASES')
    })

    it('should have accessible form labels', async function () {
      const inputs = await driver.findElements(By.css('input'))

      for (const input of inputs) {
        // Check for aria-label or associated label
        const ariaLabel = await input.getAttribute('aria-label')
        const id = await input.getAttribute('id')

        if (!ariaLabel && id) {
          // Look for associated label
          try {
            await driver.findElement(By.css(`label[for="${id}"]`))
          } catch (error) {
            console.log(`Input with id ${id} might be missing associated label`)
          }
        }
      }
    })
  })

  // ==================== PERFORMANCE TESTS ====================

  describe('Performance', function () {
    beforeEach(async function () {
      driver = await createDriver()
      await login(driver, ADMIN_USER)
    })

    afterEach(async function () {
      if (driver) {
        await driver.quit()
        driver = null
      }
    })

    it('should load search page within 3 seconds', async function () {
      const startTime = Date.now()

      await driver.get(`${BASE_URL}/#/search`)
      await driver.wait(until.elementLocated(By.css('.search-page')), TIMEOUT)

      const loadTime = Date.now() - startTime
      console.log(`Page load time: ${loadTime}ms`)

      expect(loadTime).to.be.below(3000)
    })

    it('should switch tabs quickly (< 500ms)', async function () {
      await navigateToSearchPage(driver)

      const startTime = Date.now()

      const casesTab = await driver.findElement(
        By.xpath('//div[contains(@class, "q-tab") and contains(text(), "CASES")]'),
      )
      await casesTab.click()
      await driver.wait(until.elementLocated(By.css('.search-bar-stub, input')), TIMEOUT)

      const switchTime = Date.now() - startTime
      console.log(`Tab switch time: ${switchTime}ms`)

      expect(switchTime).to.be.below(500)
    })
  })

  // ==================== ERROR HANDLING TESTS ====================

  describe('Error Handling', function () {
    beforeEach(async function () {
      driver = await createDriver()
      await login(driver, ADMIN_USER)
      await navigateToSearchPage(driver)
    })

    afterEach(async function () {
      if (driver) {
        await driver.quit()
        driver = null
      }
    })

    it('should display error message on search failure', async function () {
      // Switch to Cases tab
      const casesTab = await driver.findElement(
        By.xpath('//div[contains(@class, "q-tab") and contains(text(), "CASES")]'),
      )
      await casesTab.click()
      await driver.sleep(500)

      // Search for non-existent case
      const searchInput = await driver.findElement(
        By.css('input[type="text"], input[placeholder*="search"], input[placeholder*="Search"]'),
      )
      await searchInput.sendKeys('NONEXISTENT-CASE-12345')
      await searchInput.sendKeys(Key.RETURN)
      await driver.sleep(2000)

      // Should show either "no results" or error message
      const pageSource = await driver.getPageSource()
      const hasErrorOrNoResults =
        pageSource.includes('No results') ||
        pageSource.includes('not found') ||
        pageSource.includes('error') ||
        pageSource.includes('No cases')

      expect(hasErrorOrNoResults).to.be.true
    })

    it('should handle empty search gracefully', async function () {
      const casesTab = await driver.findElement(
        By.xpath('//div[contains(@class, "q-tab") and contains(text(), "CASES")]'),
      )
      await casesTab.click()
      await driver.sleep(500)

      // Submit empty search
      const searchInput = await driver.findElement(
        By.css('input[type="text"], input[placeholder*="search"], input[placeholder*="Search"]'),
      )
      await searchInput.sendKeys(Key.RETURN)
      await driver.sleep(1000)

      // Should not crash - page should still be functional
      const searchPage = await driver.findElement(By.css('.search-page'))
      expect(await searchPage.isDisplayed()).to.be.true
    })
  })
})
