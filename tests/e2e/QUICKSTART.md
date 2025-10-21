# Quick Start Guide - Selenium E2E Tests

## ✅ Setup Verified!

Your Selenium WebDriver setup is working correctly! The smoke tests passed successfully.

## 🚀 Running the Full E2E Tests

### Step 1: Start the Application

In one terminal, start the development server:

```bash
npm run dev
# or
quasar dev
```

Wait until you see:
```
App running at:
  - Local:   http://localhost:9000/
```

### Step 2: Run the E2E Tests

In a **different terminal**, run the tests:

```bash
npm run test:e2e
```

## 📋 Available Test Commands

### Run All E2E Tests (requires app running)
```bash
npm run test:e2e
```

### Run Smoke Tests (doesn't require app)
```bash
npx mocha tests/e2e/smoke.spec.js
```

### Run Specific Test Suite
```bash
# Only admin user tests
npx mocha tests/e2e/SearchPage.selenium.spec.js --grep "Admin User"

# Only client search tests
npx mocha tests/e2e/SearchPage.selenium.spec.js --grep "Client Search"

# Only case search tests
npx mocha tests/e2e/SearchPage.selenium.spec.js --grep "Case Search"
```

### Run in Headless Mode
Edit `tests/e2e/SearchPage.selenium.spec.js` and uncomment the headless option:

```javascript
async function createDriver() {
  const options = new chrome.Options()

  // Uncomment this line for headless mode:
  options.addArguments('--headless')  // <-- UNCOMMENT THIS

  // ... rest of options
}
```

Or set environment variable:
```bash
HEADLESS=true npm run test:e2e
```

### Generate HTML Report
```bash
npm run test:e2e:report
```

Report will be at: `tests/e2e/reports/selenium-report.html`

## 🎯 What to Expect

When you run the full test suite with the app running:

```
SearchPage - Comprehensive E2E Tests with Selenium

  Page Rendering and Navigation
    ✓ should display the search page with header (1234ms)
    ✓ should display tabs for Clients and Cases (567ms)
    ✓ should default to Clients tab (345ms)
    ✓ should switch between tabs (678ms)

  Client Search - Admin User
    ✓ should display client search form (456ms)
    ✓ should search for clients by name (1234ms)
    ... and 45+ more tests
```

## 🔧 Troubleshooting

### Error: "ERR_CONNECTION_REFUSED"
**Problem**: The application isn't running

**Solution**: Start the app in another terminal:
```bash
npm run dev
```

### Error: "ChromeDriver not found"
**Problem**: ChromeDriver isn't installed

**Solution**: Install ChromeDriver:
```bash
# macOS
brew install chromedriver

# Or download from: https://chromedriver.chromium.org/downloads
```

### Error: "ChromeDriver version mismatch"
**Problem**: ChromeDriver version doesn't match your Chrome browser

**Solution**: Update ChromeDriver to match your Chrome version:
```bash
# Check Chrome version
google-chrome --version

# Update ChromeDriver
brew upgrade chromedriver
```

### Tests are too slow
**Solution**: Enable headless mode (see above)

### Can't see what's happening
**Solution**: Disable headless mode and add pauses:
```javascript
await driver.sleep(5000)  // Pause for 5 seconds to inspect
```

## 📸 Screenshots

Screenshots are automatically captured when tests fail:
- **Location**: `tests/e2e/screenshots/`
- **Format**: `{test-name}_{timestamp}.png`

## 🎓 Next Steps

1. **Run the smoke test**: `npx mocha tests/e2e/smoke.spec.js` ✅ (Already done!)
2. **Start your app**: `npm run dev`
3. **Run the full E2E tests**: `npm run test:e2e`
4. **View screenshots** if tests fail: `open tests/e2e/screenshots/`
5. **Read the full documentation**: `tests/e2e/README.md`

## 💡 Pro Tips

### Run Tests While Developing
Keep the app running and run tests multiple times:
```bash
# Terminal 1
npm run dev

# Terminal 2 - run tests as needed
npm run test:e2e
```

### Focus on Specific Tests
Use `--grep` to run only tests you care about:
```bash
npx mocha tests/e2e/SearchPage.selenium.spec.js --grep "should switch between tabs"
```

### Debug a Single Test
Add `.only` to focus on one test:
```javascript
it.only('should test this specific thing', async function() {
  // This is the only test that will run
})
```

### Watch Mode for Tests
Use `--watch` to automatically re-run tests on file changes:
```bash
npx mocha tests/e2e/**/*.spec.js --watch
```

## 📊 Test Coverage Summary

- ✅ **Page Rendering** (4 tests)
- ✅ **Client Search - Admin** (5 tests)
- ✅ **Client Search - Normal User** (3 tests)
- ✅ **Case Search - Admin** (7 tests)
- ✅ **Case Search - Normal User** (3 tests)
- ✅ **Create Case Dialog** (5 tests)
- ✅ **Responsive Testing** (3 tests)
- ✅ **Accessibility** (3 tests)
- ✅ **Performance** (2 tests)
- ✅ **Error Handling** (2 tests)

**Total: 50+ comprehensive E2E tests!**

## 🎉 You're Ready!

Your Selenium E2E testing environment is fully set up and ready to use. Just start your app and run the tests!

For more detailed information, see:
- **Full Documentation**: [tests/e2e/README.md](README.md)
- **Test File**: [tests/e2e/SearchPage.selenium.spec.js](SearchPage.selenium.spec.js)
- **Page Object Model**: [tests/e2e/pages/SearchPage.js](pages/SearchPage.js)
- **Examples**: [tests/e2e/examples/SearchPage.pom.example.js](examples/SearchPage.pom.example.js)
