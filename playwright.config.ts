import { defineConfig } from '@playwright/test';
const preview = process.env.FLUIVIX_PREVIEW === '1';
const baseURL = preview ? 'http://127.0.0.1:4173' : 'http://127.0.0.1:5173';
export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  workers: 1,
  reporter: 'list',
  use: { baseURL, trace: 'retain-on-failure' },
  webServer: {
    command: preview ? 'npm run preview -- --port 4173' : 'npm run dev',
    url: baseURL,
    reuseExistingServer: !process.env.CI,
  },
});
