import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './tests/e2e',
  timeout: 90000,
  workers: 1,
  use: { baseURL: 'http://127.0.0.1:4173/PyScope/', headless: true },
  webServer: {
    command: 'npm run preview -- --port 4173',
    url: 'http://127.0.0.1:4173/PyScope/',
    reuseExistingServer: !process.env.CI,
  },
});
