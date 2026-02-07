# E2E Tests with Playwright

This directory contains end-to-end tests for the Nexus Dashboard application using Playwright.

## Prerequisites

- Node.js and npm installed
- Nexus Dashboard frontend running on port 3001
- Backend API running (default: http://localhost:3000)

## Setup

1. Install dependencies (already done during main project setup):
```bash
npm install
```

2. Install Playwright browsers:
```bash
npx playwright install chromium
```

## Running Tests

### Run all E2E tests (headless mode)
```bash
npm run test:e2e
```

### Run tests with Playwright UI (interactive mode)
```bash
npm run test:e2e:ui
```

### Run tests in headed mode (see browser window)
```bash
npm run test:e2e:headed
```

### Run specific test file
```bash
npx playwright test e2e/auth.spec.ts
```

### Run tests in debug mode
```bash
npx playwright test --debug
```

## Test Structure

### Auth Tests (`auth.spec.ts`)
Tests for authentication flows:
- User registration
- User login
- User logout
- Form validation
- Protected route access
- Callback URL preservation

### Project Tests (`projects.spec.ts`)
Tests for project management:
- Creating projects
- Viewing project list
- Viewing project details
- Project metadata display
- Data persistence

## Configuration

The Playwright configuration is defined in `playwright.config.ts` at the root of the project.

Key settings:
- Base URL: http://localhost:3001
- Test directory: ./e2e
- Browser: Chromium
- Web server: Automatically starts the Next.js dev server

## Environment Variables

The tests use the following environment variables:
- `NEXT_PUBLIC_API_URL`: Backend API URL (defaults to http://localhost:3000)

## Viewing Test Reports

After running tests, view the HTML report:
```bash
npx playwright show-report
```

## Debugging Failed Tests

1. Run tests in debug mode:
```bash
npx playwright test --debug
```

2. Use the Playwright UI mode for interactive debugging:
```bash
npm run test:e2e:ui
```

3. Check screenshots and traces in the `test-results` directory

## CI/CD Integration

The tests are configured to run in CI environments:
- Retries: 2 retries on CI
- Workers: 1 worker on CI (sequential execution)
- Reporter: HTML report

## Notes

- Tests create unique users for each test run using timestamps to avoid conflicts
- The dev server is automatically started before tests if not already running
- Tests are fully isolated - each test has its own browser context
- Storage (cookies, localStorage) is cleared before each test
