import { defineConfig } from 'cypress';
import viteDevServer from '@cypress/vite-dev-server';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:5173',
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'cypress/support/e2e.{js,jsx,ts,tsx}',
    async setupNodeEvents(on, config) {
      await viteDevServer(on, config);
      return config;
    },
  },
});
