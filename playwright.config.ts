import { defineConfig } from '@playwright/test';
const preview = process.env.FLUIVIX_PREVIEW === '1';
const deployedURL = process.env.FLUIVIX_BASE_URL;
const baseURL = deployedURL || (preview ? 'http://127.0.0.1:4173' : 'http://127.0.0.1:5173');
export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  workers: 1,
  reporter: 'list',
  use: { baseURL, trace: 'retain-on-failure' },
  webServer: deployedURL
    ? undefined
    : {
        command: preview
          ? 'npm run preview -- --port 4173 --strictPort'
          : 'npm run dev -- --strictPort',
        url: baseURL,
        reuseExistingServer: !process.env.CI,
      },
});
