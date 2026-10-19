import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            {
              name: 'react',
              test: /node_modules[\\/](?:react|react-dom|scheduler|react-router)[\\/]/,
            },
            { name: 'ui', test: /node_modules[\\/](?:@radix-ui|sonner|lucide-react)[\\/]/ },
            { name: 'validation', test: /node_modules[\\/]zod[\\/]/ },
          ],
        },
      },
    },
  },
  test: {
    environment: 'jsdom',
    include: ['src/**/*.test.{ts,tsx}'],
    setupFiles: ['./src/test/setup.ts'],
  },
});
