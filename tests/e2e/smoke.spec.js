/**
 * smoke.spec.js
 *
 * Simple smoke test to verify Selenium setup is working
 * This test doesn't require the app to be running
 */

import { Builder } from 'selenium-webdriver'
import chrome from 'selenium-webdriver/chrome.js'
import { expect } from 'chai'

describe('Selenium Setup - Smoke Test', function() {
  this.timeout(30000)

  let driver

  before(async function() {
    console.log('\n🔧 Testing Selenium WebDriver setup...\n')
  })

  after(async function() {
    console.log('\n✅ Selenium setup verified!\n')
  })

  afterEach(async function() {
    if (driver) {
      await driver.quit()
      driver = null
    }
  })

  it('should create and quit a Chrome driver', async function() {
    const options = new chrome.Options()
    options.addArguments('--headless')
    options.addArguments('--disable-gpu')
    options.addArguments('--no-sandbox')

    driver = await new Builder()
      .forBrowser('chrome')
      .setChromeOptions(options)
      .build()

    expect(driver).to.exist

    const session = await driver.getSession()
    expect(session).to.exist
    console.log('  ✓ Chrome driver created successfully')
  })

  it('should navigate to Google and verify title', async function() {
    const options = new chrome.Options()
    options.addArguments('--headless')
    options.addArguments('--disable-gpu')
    options.addArguments('--no-sandbox')

    driver = await new Builder()
      .forBrowser('chrome')
      .setChromeOptions(options)
      .build()

    await driver.get('https://www.google.com')
    const title = await driver.getTitle()

    expect(title).to.include('Google')
    console.log('  ✓ Successfully navigated to Google')
    console.log(`  ✓ Page title: ${title}`)
  })

  it('should find elements on a page', async function() {
    const options = new chrome.Options()
    options.addArguments('--headless')
    options.addArguments('--disable-gpu')
    options.addArguments('--no-sandbox')

    driver = await new Builder()
      .forBrowser('chrome')
      .setChromeOptions(options)
      .build()

    await driver.get('https://www.google.com')

    // Try to find the Google logo
    const { By } = await import('selenium-webdriver')
    const logo = await driver.findElement(By.css('img'))

    expect(logo).to.exist
    console.log('  ✓ Successfully found elements on the page')
  })
})
