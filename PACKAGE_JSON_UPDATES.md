# Package.json Updates for Selenium E2E Tests

## Required Dependencies

Add the following to your `package.json`:

```json
{
  "scripts": {
    "test:e2e": "mocha tests/e2e/**/*.selenium.spec.js",
    "test:e2e:headless": "HEADLESS=true mocha tests/e2e/**/*.selenium.spec.js",
    "test:e2e:report": "mocha tests/e2e/**/*.selenium.spec.js --reporter mochawesome --reporter-options reportDir=tests/e2e/reports,reportFilename=selenium-report"
  },
  "devDependencies": {
    "selenium-webdriver": "^4.17.0",
    "mocha": "^10.2.0",
    "chai": "^4.3.10",
    "mochawesome": "^7.1.3"
  }
}
```

## Installation Command

```bash
npm install --save-dev selenium-webdriver mocha chai mochawesome
```

## Full Package.json Example

```json
{
  "name": "fma-skeckit-app",
  "version": "0.0.1",
  "description": "Manages files and folders",
  "productName": "File Management App",
  "author": "mokwen <mokwen@groupon.com>",
  "type": "module",
  "private": true,
  "scripts": {
    "lint": "eslint -c ./eslint.config.js \"./src*/**/*.{js,cjs,mjs,vue}\"",
    "format": "prettier --write \"**/*.{js,vue,scss,html,md,json}\" --ignore-path .gitignore",
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage",
    "test:e2e": "mocha tests/e2e/**/*.selenium.spec.js",
    "test:e2e:headless": "HEADLESS=true mocha tests/e2e/**/*.selenium.spec.js",
    "test:e2e:report": "mocha tests/e2e/**/*.selenium.spec.js --reporter mochawesome --reporter-options reportDir=tests/e2e/reports,reportFilename=selenium-report",
    "dev": "quasar dev",
    "build": "quasar build",
    "postinstall": "quasar prepare"
  },
  "dependencies": {
    "@pinia/testing": "^1.0.2",
    "@quasar/extras": "^1.16.4",
    "@vitest/ui": "^3.2.4",
    "@vue/test-utils": "^2.4.6",
    "@vuelidate/core": "^2.0.3",
    "@vuelidate/validators": "^2.0.4",
    "apexcharts": "^5.3.5",
    "axios": "^1.2.1",
    "fuse.js": "^7.1.0",
    "happy-dom": "^20.0.0",
    "pinia": "^3.0.3",
    "quasar": "^2.16.0",
    "vitest": "^3.2.4",
    "vue": "3.5.20",
    "vue-i18n": "^11.0.0",
    "vue-router": "^4.0.0",
    "vue3-apexcharts": "^1.9.0"
  },
  "devDependencies": {
    "@eslint/js": "^9.14.0",
    "@intlify/unplugin-vue-i18n": "^4.0.0",
    "@quasar/app-vite": "^2.1.0",
    "@vue/eslint-config-prettier": "^10.1.0",
    "autoprefixer": "^10.4.2",
    "chai": "^4.3.10",
    "eslint": "^9.14.0",
    "eslint-plugin-vue": "^10.4.0",
    "globals": "^16.4.0",
    "mocha": "^10.2.0",
    "mochawesome": "^7.1.3",
    "postcss": "^8.4.14",
    "prettier": "^3.3.3",
    "selenium-webdriver": "^4.17.0",
    "vite-plugin-checker": "^0.10.3",
    "vue-eslint-parser": "^10.2.0"
  }
}
```

## Script Explanations

### `test:e2e`
Runs all Selenium E2E tests in the `tests/e2e/` directory.

```bash
npm run test:e2e
```

### `test:e2e:headless`
Runs tests in headless mode (no browser window visible). Useful for CI/CD.

```bash
npm run test:e2e:headless
```

### `test:e2e:report`
Runs tests and generates an HTML report using Mochawesome.

```bash
npm run test:e2e:report
```

The report will be generated at: `tests/e2e/reports/selenium-report.html`

## Environment Variables

You can also pass environment variables directly:

```bash
# Custom base URL
BASE_URL=http://localhost:8080 npm run test:e2e

# Headless mode
HEADLESS=true npm run test:e2e

# Combine multiple variables
BASE_URL=http://staging.example.com HEADLESS=true npm run test:e2e
```

## Optional: Mocha Configuration File

Create `.mocharc.json` in project root for persistent Mocha configuration:

```json
{
  "timeout": 60000,
  "slow": 10000,
  "reporter": "spec",
  "require": [],
  "spec": "tests/e2e/**/*.selenium.spec.js",
  "recursive": true,
  "exit": true
}
```

With this file, you can simply run:
```bash
npx mocha
```
