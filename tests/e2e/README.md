# Selenium WebDriver E2E Tests for SearchPage

## Overview

Comprehensive end-to-end tests for the SearchPage component using Selenium WebDriver. Tests real user workflows in a live browser environment for both admin and normal user roles.

## Test File

[tests/e2e/SearchPage.selenium.spec.js](SearchPage.selenium.spec.js)

## Prerequisites

### 1. Install Dependencies

```bash
npm install --save-dev selenium-webdriver mocha chai
```

### 2. Install Browser Drivers

#### ChromeDriver (Recommended)
```bash
# macOS (using Homebrew)
brew install chromedriver

# Or download from: https://chromedriver.chromium.org/downloads
# Make sure the version matches your Chrome browser
```

#### FirefoxDriver (GeckoDriver)
```bash
# macOS (using Homebrew)
brew install geckodriver

# Or download from: https://github.com/mozilla/geckodriver/releases
```

#### Verify Installation
```bash
chromedriver --version
# or
geckodriver --version
```

### 3. Start the Application

The tests expect the application to be running at `http://localhost:9000` (configurable via `BASE_URL` env variable).

```bash
# In one terminal, start the application
npm run dev
# or
quasar dev
```

## Running the Tests

### Run All E2E Tests
```bash
npm run test:e2e
```

### Run Specific Test Suites
```bash
# Run only admin user tests
npx mocha tests/e2e/SearchPage.selenium.spec.js --grep "Admin User"

# Run only normal user tests
npx mocha tests/e2e/SearchPage.selenium.spec.js --grep "Normal User"

# Run only client search tests
npx mocha tests/e2e/SearchPage.selenium.spec.js --grep "Client Search"

# Run only case search tests
npx mocha tests/e2e/SearchPage.selenium.spec.js --grep "Case Search"
```

### Run in Headless Mode
```bash
# Edit the test file and uncomment the headless option in createDriver()
# Or set environment variable
HEADLESS=true npm run test:e2e
```

### Run with Different Base URL
```bash
BASE_URL=http://localhost:8080 npm run test:e2e
```

### Generate HTML Report
```bash
npx mocha tests/e2e/SearchPage.selenium.spec.js --reporter mochawesome --reporter-options reportDir=tests/e2e/reports,reportFilename=selenium-report
```

## Test Coverage

### Total Tests: 50+ Comprehensive Scenarios

#### 1. Page Rendering and Navigation (4 tests)
- ✅ Display search page with header
- ✅ Display tabs for Clients and Cases
- ✅ Default to Clients tab
- ✅ Switch between tabs

#### 2. Client Search - Admin User (5 tests)
- ✅ Display client search form
- ✅ Search for clients by name
- ✅ Display client search results
- ✅ View client details
- ✅ Show create client button

#### 3. Client Search - Normal User (3 tests)
- ✅ Display client search form for normal user
- ✅ Allow normal user to search for clients
- ✅ Allow normal user to view client details

#### 4. Case Search - Admin User (7 tests)
- ✅ Display case search bar
- ✅ Show initial state before search
- ✅ Search for cases by case ID
- ✅ Display case search results
- ✅ View case in read-only mode
- ✅ Edit case
- ✅ Display loading state during search

#### 5. Case Search - Normal User (3 tests)
- ✅ Display case search bar for normal user
- ✅ Allow normal user to search for cases
- ✅ Allow normal user to view case in read-only mode

#### 6. Create Case Dialog - Admin User (5 tests)
- ✅ Not show create case dialog initially
- ✅ Open create case dialog
- ✅ Show case form in dialog
- ✅ Validate case ID when creating case
- ✅ Close dialog when clicking cancel

#### 7. Responsive Behavior (3 tests)
- ✅ Display correctly on desktop (1920x1080)
- ✅ Display correctly on tablet (768x1024)
- ✅ Display correctly on mobile (375x667)

#### 8. Accessibility (3 tests)
- ✅ Have proper heading structure
- ✅ Support keyboard navigation for tabs
- ✅ Have accessible form labels

#### 9. Performance (2 tests)
- ✅ Load search page within 3 seconds
- ✅ Switch tabs quickly (< 500ms)

#### 10. Error Handling (2 tests)
- ✅ Display error message on search failure
- ✅ Handle empty search gracefully

## Test Users

### Admin User
- **Email**: `tenjoh_okwen@yahoo.com`
- **Password**: `admin*123!`
- **Role**: `ROLE_ADMIN`

### Normal User
- **Email**: `john@yahoo.com`
- **Password**: `admin*123!`
- **Role**: `ROLE_USER`

## Configuration

Test configuration is in [selenium.config.js](selenium.config.js):

```javascript
module.exports = {
  baseUrl: 'http://localhost:9000',
  browser: {
    name: 'chrome',
    headless: false
  },
  timeouts: {
    implicit: 5000,
    explicit: 10000,
    pageLoad: 30000
  }
}
```

## Screenshots

Screenshots are automatically captured on test failures and saved to:
```
tests/e2e/screenshots/
```

Screenshot naming format: `{test-name}_{timestamp}.png`

## Helper Functions

The test file includes useful helper functions:

### `createDriver()`
Creates and configures a Selenium WebDriver instance with Chrome options.

### `login(driver, user)`
Logs in a user with provided credentials.

### `navigateToSearchPage(driver)`
Navigates to the search page and waits for it to load.

### `waitForClickable(driver, locator, timeout)`
Waits for an element to be visible and clickable.

### `takeScreenshot(driver, testName)`
Captures a screenshot and saves it to the screenshots directory.

## Debugging Tests

### Run in Non-Headless Mode
Comment out the `--headless` option in `createDriver()` to see the browser:

```javascript
// options.addArguments('--headless')  // Comment this line
```

### Add Debug Breakpoints
```javascript
it('should test something', async function() {
  await driver.get(url)

  // Add a pause to inspect the browser
  await driver.sleep(5000)

  // Or use Node debugger
  debugger
})
```

### Verbose Logging
Enable verbose logging in the test:

```javascript
const logging = require('selenium-webdriver/lib/logging')
const prefs = new logging.Preferences()
prefs.setLevel(logging.Type.BROWSER, logging.Level.ALL)
builder.setLoggingPrefs(prefs)
```

## Common Issues and Solutions

### Issue: ChromeDriver version mismatch
**Solution**: Update ChromeDriver to match your Chrome browser version
```bash
# Check Chrome version
google-chrome --version

# Download matching ChromeDriver from:
# https://chromedriver.chromium.org/downloads
```

### Issue: "Element not interactable" error
**Solution**: Use `waitForClickable()` helper or add explicit waits
```javascript
await driver.wait(until.elementIsVisible(element), TIMEOUT)
await driver.wait(until.elementIsEnabled(element), TIMEOUT)
```

### Issue: Tests timeout
**Solution**: Increase timeout in test or Mocha configuration
```javascript
this.timeout(120000) // 2 minutes
```

### Issue: Stale element reference
**Solution**: Re-locate the element before interacting
```javascript
// Instead of storing element reference
const button = await driver.findElement(By.css('.button'))

// Re-locate before each interaction
await driver.findElement(By.css('.button')).click()
```

## CI/CD Integration

### GitHub Actions Example

```yaml
name: E2E Tests

on: [push, pull_request]

jobs:
  e2e-tests:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v2

      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm install

      - name: Install ChromeDriver
        run: |
          wget https://chromedriver.storage.googleapis.com/LATEST_RELEASE
          LATEST=$(cat LATEST_RELEASE)
          wget https://chromedriver.storage.googleapis.com/$LATEST/chromedriver_linux64.zip
          unzip chromedriver_linux64.zip
          sudo mv chromedriver /usr/local/bin/
          sudo chmod +x /usr/local/bin/chromedriver

      - name: Start application
        run: |
          npm run dev &
          sleep 10

      - name: Run E2E tests
        run: npm run test:e2e
        env:
          HEADLESS: true

      - name: Upload screenshots on failure
        if: failure()
        uses: actions/upload-artifact@v2
        with:
          name: test-screenshots
          path: tests/e2e/screenshots/
```

## Best Practices

### 1. Use Explicit Waits
```javascript
// Good
await driver.wait(until.elementLocated(By.css('.element')), TIMEOUT)

// Avoid
await driver.sleep(5000)
```

### 2. Use Unique Selectors
```javascript
// Good - specific and unique
By.css('[data-testid="search-button"]')
By.css('#client-search-form input[name="firstName"]')

// Avoid - fragile
By.css('.q-btn')
By.xpath('//div/div/button')
```

### 3. Handle Async Properly
```javascript
// Good
await driver.findElement(By.css('.button')).click()

// Avoid
driver.findElement(By.css('.button')).click() // Missing await
```

### 4. Clean Up Resources
```javascript
afterEach(async function() {
  if (driver) {
    await driver.quit()
    driver = null
  }
})
```

### 5. Use Page Object Pattern (Optional)
For larger test suites, consider using the Page Object pattern:

```javascript
class SearchPage {
  constructor(driver) {
    this.driver = driver
  }

  async navigateTo() {
    await this.driver.get(`${BASE_URL}/#/search`)
  }

  async clickClientsTab() {
    const tab = await this.driver.findElement(By.xpath('//div[contains(text(), "CLIENTS")]'))
    await tab.click()
  }

  async searchClient(firstName) {
    const input = await this.driver.findElement(By.css('input[name="firstName"]'))
    await input.sendKeys(firstName)
    await this.submitSearch()
  }
}
```

## Additional Resources

- **Selenium WebDriver JavaScript API**: https://www.selenium.dev/selenium/docs/api/javascript/
- **Mocha Documentation**: https://mochajs.org/
- **Chai Assertion Library**: https://www.chaijs.com/
- **ChromeDriver Downloads**: https://chromedriver.chromium.org/downloads
- **GeckoDriver Releases**: https://github.com/mozilla/geckodriver/releases

## Support

For issues or questions:
1. Check the test logs and screenshots
2. Review common issues section above
3. Consult Selenium WebDriver documentation
4. Open an issue in the project repository
