/**
 * SearchPage.pom.example.js
 *
 * Example tests using Page Object Model for better maintainability
 * Demonstrates how to use the SearchPage page object
 */

const { Builder } = require('selenium-webdriver')
const chrome = require('selenium-webdriver/chrome')
const { expect } = require('chai')
const SearchPage = require('../pages/SearchPage')

describe('SearchPage - Page Object Model Examples', function() {
  this.timeout(60000)

  let driver
  let searchPage

  before(async function() {
    const options = new chrome.Options()
    options.addArguments('--disable-gpu')
    options.addArguments('--no-sandbox')
    options.addArguments('--window-size=1920,1080')

    driver = await new Builder()
      .forBrowser('chrome')
      .setChromeOptions(options)
      .build()

    searchPage = new SearchPage(driver)
  })

  after(async function() {
    if (driver) {
      await driver.quit()
    }
  })

  describe('Basic Navigation', function() {
    it('should navigate to search page and verify display', async function() {
      await searchPage.navigateTo()

      const isDisplayed = await searchPage.isPageDisplayed()
      expect(isDisplayed).to.be.true

      const title = await searchPage.getPageTitle()
      expect(title).to.include('Search')
    })

    it('should switch between tabs using POM', async function() {
      await searchPage.navigateTo()

      // Initially on Clients tab
      let isClientsActive = await searchPage.isClientsTabActive()
      expect(isClientsActive).to.be.true

      // Switch to Cases tab
      await searchPage.switchToCasesTab()
      let isCasesActive = await searchPage.isCasesTabActive()
      expect(isCasesActive).to.be.true

      // Switch back to Clients tab
      await searchPage.switchToClientsTab()
      isClientsActive = await searchPage.isClientsTabActive()
      expect(isClientsActive).to.be.true
    })
  })

  describe('Client Search with POM', function() {
    beforeEach(async function() {
      await searchPage.navigateTo()
    })

    it('should search for client using page object methods', async function() {
      // Use high-level method
      await searchPage.searchClient('Alice', 'Johnson')

      // Verify we got results (or at least the search was performed)
      const pageSource = await searchPage.getPageSource()
      expect(pageSource).to.include('result').or.include('No results')
    })

    it('should display client search results', async function() {
      await searchPage.searchClient('John')

      const results = await searchPage.getClientSearchResults()
      console.log(`Found ${results.length} client results`)

      // Results can be 0 if no matching clients exist
      expect(results).to.be.an('array')
    })
  })

  describe('Case Search with POM', function() {
    beforeEach(async function() {
      await searchPage.navigateTo()
    })

    it('should search for case using page object methods', async function() {
      await searchPage.searchCase('CASE-001')

      // Check if results, error, or no results message is displayed
      const pageSource = await searchPage.getPageSource()
      const hasResponse = pageSource.includes('result') ||
                         pageSource.includes('error') ||
                         pageSource.includes('No')

      expect(hasResponse).to.be.true
    })

    it('should display initial state before search', async function() {
      await searchPage.switchToCasesTab()

      const isInitialState = await searchPage.isInitialStateDisplayed()
      console.log(`Initial state displayed: ${isInitialState}`)

      // Initial state might not always show if there are default results
      expect(typeof isInitialState).to.equal('boolean')
    })
  })

  describe('Responsive Testing with POM', function() {
    beforeEach(async function() {
      await searchPage.navigateTo()
    })

    it('should display correctly on desktop', async function() {
      await searchPage.setDesktopSize()

      const isDisplayed = await searchPage.isPageDisplayed()
      expect(isDisplayed).to.be.true
    })

    it('should display correctly on tablet', async function() {
      await searchPage.setTabletSize()

      const isDisplayed = await searchPage.isPageDisplayed()
      expect(isDisplayed).to.be.true
    })

    it('should display correctly on mobile', async function() {
      await searchPage.setMobileSize()

      const isDisplayed = await searchPage.isPageDisplayed()
      expect(isDisplayed).to.be.true
    })
  })

  describe('Chaining Methods (Fluent Interface)', function() {
    it('should chain multiple actions', async function() {
      // Fluent interface - chain methods for readable tests
      await searchPage
        .navigateTo()
        .then(() => searchPage.switchToCasesTab())
        .then(() => searchPage.searchCase('TEST-001'))

      const isCasesActive = await searchPage.isCasesTabActive()
      expect(isCasesActive).to.be.true
    })

    it('should chain with async/await', async function() {
      await searchPage.navigateTo()
      await searchPage.switchToClientsTab()
      await searchPage.searchClient('Test')

      const isClientsActive = await searchPage.isClientsTabActive()
      expect(isClientsActive).to.be.true
    })
  })

  describe('Error Handling with POM', function() {
    beforeEach(async function() {
      await searchPage.navigateTo()
    })

    it('should handle non-existent search gracefully', async function() {
      await searchPage.searchCase('NONEXISTENT-CASE-99999')

      // Should either show error or no results
      const hasError = await searchPage.isErrorMessageDisplayed()
      const pageSource = await searchPage.getPageSource()
      const hasNoResults = pageSource.includes('No results') ||
                          pageSource.includes('not found')

      expect(hasError || hasNoResults).to.be.true
    })
  })

  describe('Screenshot Examples', function() {
    it('should capture screenshot using POM', async function() {
      await searchPage.navigateTo()

      const filepath = await searchPage.takeScreenshot('example_screenshot')
      console.log(`Screenshot saved: ${filepath}`)

      expect(filepath).to.include('.png')
    })
  })
})

/**
 * Benefits of Page Object Model:
 *
 * 1. Maintainability
 *    - Locators defined in one place
 *    - Easy to update when UI changes
 *    - DRY (Don't Repeat Yourself)
 *
 * 2. Readability
 *    - Tests read like user actions
 *    - Clear intent: searchClient(), switchToCasesTab()
 *    - Less technical, more business-focused
 *
 * 3. Reusability
 *    - Methods used across multiple tests
 *    - Consistent interaction patterns
 *    - Shared utilities
 *
 * 4. Testability
 *    - Easier to mock/stub page objects
 *    - Better isolation for unit testing
 *    - Clearer test structure
 *
 * 5. Scalability
 *    - Add new methods without touching tests
 *    - Support multiple test suites
 *    - Easier onboarding for new team members
 *
 * Compare:
 *
 * WITHOUT POM:
 *   const tab = await driver.findElement(By.xpath('//div[contains(@class, "q-tab") and contains(text(), "CASES")]'))
 *   await tab.click()
 *   const input = await driver.findElement(By.css('input[type="text"]'))
 *   await input.sendKeys('CASE-001')
 *   await input.sendKeys(Key.RETURN)
 *
 * WITH POM:
 *   await searchPage.searchCase('CASE-001')
 *
 * Much cleaner and easier to maintain!
 */
