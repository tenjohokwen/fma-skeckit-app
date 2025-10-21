/**
 * SearchPage.js
 *
 * Page Object Model for SearchPage
 * Provides reusable methods for interacting with the Search Page
 *
 * Usage:
 *   const searchPage = new SearchPage(driver)
 *   await searchPage.navigateTo()
 *   await searchPage.switchToClientsTab()
 *   await searchPage.searchClient('John', 'Doe')
 */

const { By, until } = require('selenium-webdriver')

class SearchPage {
  constructor(driver, baseUrl = 'http://localhost:9000') {
    this.driver = driver
    this.baseUrl = baseUrl
    this.timeout = 10000
  }

  // ==================== LOCATORS ====================

  get pageContainer() {
    return By.css('.search-page')
  }

  get pageTitle() {
    return By.css('.page-header h1')
  }

  get clientsTab() {
    return By.xpath('//div[contains(@class, "q-tab") and contains(text(), "CLIENTS")]')
  }

  get casesTab() {
    return By.xpath('//div[contains(@class, "q-tab") and contains(text(), "CASES")]')
  }

  get activeTab() {
    return By.css('.q-tab--active')
  }

  // Client Search Locators
  get clientSearchForm() {
    return By.css('.client-search-form-stub, form, .q-form')
  }

  get clientSearchResults() {
    return By.css('.client-search-results-stub, .results, .client-list')
  }

  get clientResultItems() {
    return By.css('.client-result-item, .client-card')
  }

  get createClientButton() {
    return By.xpath('//button[contains(text(), "Create") and contains(text(), "Client")]')
  }

  // Case Search Locators
  get caseSearchBar() {
    return By.css('.search-bar-stub, input[placeholder*="search"], input[placeholder*="Search"]')
  }

  get caseSearchInput() {
    return By.css('input[type="text"], input[placeholder*="search"]')
  }

  get caseResultItems() {
    return By.css('.case-card-stub, .case-item, .case-result')
  }

  get initialStateMessage() {
    return By.css('.initial-state')
  }

  get loadingIndicator() {
    return By.css('.loading-stub, .q-spinner, .loading')
  }

  get errorMessage() {
    return By.css('.error-stub, .error-state, .q-banner--negative')
  }

  // Dialog Locators
  get createCaseDialog() {
    return By.css('.q-dialog, [role="dialog"]')
  }

  get caseForm() {
    return By.css('.case-form-stub, form')
  }

  get dialogSubmitButton() {
    return By.xpath('//button[contains(text(), "Submit") or contains(text(), "Create")]')
  }

  get dialogCancelButton() {
    return By.xpath('//button[contains(text(), "Cancel") or contains(text(), "CANCEL")]')
  }

  // ==================== NAVIGATION ====================

  async navigateTo() {
    await this.driver.get(`${this.baseUrl}/#/search`)
    await this.driver.wait(until.elementLocated(this.pageContainer), this.timeout)
    await this.driver.sleep(500) // Let page stabilize
    return this
  }

  async getCurrentUrl() {
    return await this.driver.getCurrentUrl()
  }

  // ==================== TAB NAVIGATION ====================

  async switchToClientsTab() {
    const tab = await this.driver.findElement(this.clientsTab)
    await tab.click()
    await this.driver.sleep(500)
    return this
  }

  async switchToCasesTab() {
    const tab = await this.driver.findElement(this.casesTab)
    await tab.click()
    await this.driver.sleep(500)
    return this
  }

  async getActiveTabText() {
    const tab = await this.driver.findElement(this.activeTab)
    return await tab.getText()
  }

  async isClientsTabActive() {
    const tabText = await this.getActiveTabText()
    return tabText.includes('CLIENTS')
  }

  async isCasesTabActive() {
    const tabText = await this.getActiveTabText()
    return tabText.includes('CASES')
  }

  // ==================== CLIENT SEARCH ====================

  async searchClient(firstName, lastName = '') {
    // Ensure we're on Clients tab
    if (!await this.isClientsTabActive()) {
      await this.switchToClientsTab()
    }

    // Find search inputs
    const inputs = await this.driver.findElements(By.css('input[type="text"]'))

    if (inputs.length > 0 && firstName) {
      await inputs[0].sendKeys(firstName)
    }

    if (inputs.length > 1 && lastName) {
      await inputs[1].sendKeys(lastName)
    }

    // Submit search
    await this.submitClientSearch()
    await this.driver.sleep(2000) // Wait for results

    return this
  }

  async submitClientSearch() {
    const searchButton = await this.driver.findElement(
      By.xpath('//button[contains(text(), "Search") or contains(text(), "SEARCH")]')
    )
    await searchButton.click()
    return this
  }

  async clearClientSearch() {
    const clearButton = await this.driver.findElement(
      By.xpath('//button[contains(text(), "Clear") or contains(text(), "CLEAR")]')
    )
    await clearButton.click()
    return this
  }

  async getClientSearchResults() {
    try {
      const results = await this.driver.findElements(this.clientResultItems)
      return results
    } catch (error) {
      return []
    }
  }

  async clickViewClientButton(index = 0) {
    const viewButtons = await this.driver.findElements(
      By.xpath('//button[contains(text(), "View") or contains(text(), "VIEW")]')
    )

    if (viewButtons.length > index) {
      await viewButtons[index].click()
      await this.driver.sleep(1000)
    }

    return this
  }

  async clickCreateCaseButton(index = 0) {
    const createButtons = await this.driver.findElements(
      By.xpath('//button[contains(text(), "Create") and contains(text(), "Case")]')
    )

    if (createButtons.length > index) {
      await createButtons[index].click()
      await this.driver.sleep(1000)
    }

    return this
  }

  // ==================== CASE SEARCH ====================

  async searchCase(caseId) {
    // Ensure we're on Cases tab
    if (!await this.isCasesTabActive()) {
      await this.switchToCasesTab()
    }

    // Enter case ID
    const searchInput = await this.driver.findElement(this.caseSearchInput)
    await searchInput.sendKeys(caseId)
    await searchInput.sendKeys(this.driver.actions().sendKeys('\n').perform())

    await this.driver.sleep(2000) // Wait for results

    return this
  }

  async getCaseSearchResults() {
    try {
      const results = await this.driver.findElements(this.caseResultItems)
      return results
    } catch (error) {
      return []
    }
  }

  async isInitialStateDisplayed() {
    try {
      const element = await this.driver.findElement(this.initialStateMessage)
      return await element.isDisplayed()
    } catch (error) {
      return false
    }
  }

  async isLoadingIndicatorDisplayed() {
    try {
      const element = await this.driver.findElement(this.loadingIndicator)
      return await element.isDisplayed()
    } catch (error) {
      return false
    }
  }

  async isErrorMessageDisplayed() {
    try {
      const element = await this.driver.findElement(this.errorMessage)
      return await element.isDisplayed()
    } catch (error) {
      return false
    }
  }

  async getErrorMessageText() {
    try {
      const element = await this.driver.findElement(this.errorMessage)
      return await element.getText()
    } catch (error) {
      return ''
    }
  }

  async clickViewCaseButton(index = 0) {
    const viewButtons = await this.driver.findElements(
      By.xpath('//button[contains(text(), "View") or contains(text(), "VIEW")]')
    )

    if (viewButtons.length > index) {
      await viewButtons[index].click()
      await this.driver.sleep(1000)
    }

    return this
  }

  async clickEditCaseButton(index = 0) {
    const editButtons = await this.driver.findElements(
      By.xpath('//button[contains(text(), "Edit") or contains(text(), "EDIT")]')
    )

    if (editButtons.length > index) {
      await editButtons[index].click()
      await this.driver.sleep(1000)
    }

    return this
  }

  // ==================== CREATE CASE DIALOG ====================

  async isCreateCaseDialogDisplayed() {
    try {
      const dialog = await this.driver.findElement(this.createCaseDialog)
      return await dialog.isDisplayed()
    } catch (error) {
      return false
    }
  }

  async fillCaseForm(caseId) {
    // Wait for dialog to be visible
    await this.driver.wait(until.elementLocated(this.createCaseDialog), this.timeout)

    // Find case ID input
    const caseIdInput = await this.driver.findElement(
      By.css('input[name="caseId"], input[placeholder*="Case ID"]')
    )

    await caseIdInput.sendKeys(caseId)

    return this
  }

  async submitCaseForm() {
    const submitButton = await this.driver.findElement(this.dialogSubmitButton)
    await submitButton.click()
    await this.driver.sleep(1000)
    return this
  }

  async cancelCaseForm() {
    const cancelButton = await this.driver.findElement(this.dialogCancelButton)
    await cancelButton.click()
    await this.driver.sleep(1000)
    return this
  }

  async createCase(caseId) {
    await this.fillCaseForm(caseId)
    await this.submitCaseForm()
    return this
  }

  // ==================== VALIDATION ====================

  async getPageTitle() {
    const title = await this.driver.findElement(this.pageTitle)
    return await title.getText()
  }

  async isPageDisplayed() {
    try {
      const page = await this.driver.findElement(this.pageContainer)
      return await page.isDisplayed()
    } catch (error) {
      return false
    }
  }

  async getPageSource() {
    return await this.driver.getPageSource()
  }

  // ==================== RESPONSIVE TESTING ====================

  async setDesktopSize() {
    await this.driver.manage().window().setRect({ width: 1920, height: 1080 })
    await this.driver.sleep(500)
    return this
  }

  async setTabletSize() {
    await this.driver.manage().window().setRect({ width: 768, height: 1024 })
    await this.driver.sleep(500)
    return this
  }

  async setMobileSize() {
    await this.driver.manage().window().setRect({ width: 375, height: 667 })
    await this.driver.sleep(500)
    return this
  }

  // ==================== UTILITIES ====================

  async takeScreenshot(filename) {
    const screenshot = await this.driver.takeScreenshot()
    const fs = require('fs')
    const path = require('path')

    const screenshotDir = path.join(__dirname, '../screenshots')
    if (!fs.existsSync(screenshotDir)) {
      fs.mkdirSync(screenshotDir, { recursive: true })
    }

    const filepath = path.join(screenshotDir, `${filename}_${Date.now()}.png`)
    fs.writeFileSync(filepath, screenshot, 'base64')

    return filepath
  }

  async waitForElement(locator, timeout = this.timeout) {
    return await this.driver.wait(until.elementLocated(locator), timeout)
  }

  async waitForVisible(locator, timeout = this.timeout) {
    const element = await this.waitForElement(locator, timeout)
    await this.driver.wait(until.elementIsVisible(element), timeout)
    return element
  }

  async waitForClickable(locator, timeout = this.timeout) {
    const element = await this.waitForVisible(locator, timeout)
    await this.driver.wait(until.elementIsEnabled(element), timeout)
    return element
  }
}

module.exports = SearchPage
