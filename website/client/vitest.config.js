import { defineConfig, mergeConfig } from 'vitest/config';
import viteConfig from './vite.config.mjs';

export default defineConfig(configEnv => mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      include: ['tests/**'],
      environment: 'jsdom',
    },
    browser: {
      enabled: true,
      headless: true,
      provider: 'playwright',
      instances: [
        {
          browser: 'chromium',
        },
      ],
    },
  }),
));
