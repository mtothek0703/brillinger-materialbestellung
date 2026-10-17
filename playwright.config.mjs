import { defineConfig, devices } from '@playwright/test';
export default defineConfig({
  testDir: './tests',
  timeout: 30000,
  retries: process.env.CI ? 1 : 0,
  use: { baseURL: 'http://127.0.0.1:4173', trace: 'retain-on-failure', screenshot: 'only-on-failure' },
  projects: [
    { name: 'mobile-chromium', use: { ...devices['iPhone 13'], browserName: 'chromium' } },
    { name: 'mobile-webkit', use: { ...devices['iPhone 13'], browserName: 'webkit' } },
    { name: 'small-mobile-chromium', use: { ...devices['iPhone SE'], browserName: 'chromium', viewport: { width: 320, height: 568 } } },
    { name: 'desktop-chromium', use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 800 } } }
  ],
  webServer: { command: 'python3 -m http.server 4173 --bind 127.0.0.1', url: 'http://127.0.0.1:4173', reuseExistingServer: !process.env.CI, timeout: 20000 }
});
