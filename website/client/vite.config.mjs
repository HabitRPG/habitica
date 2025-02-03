import nconf from 'nconf';
import path from 'path';
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue2'
import { fileURLToPath } from 'node:url'

const configFile = path.join(path.resolve(__dirname, '../../config.json'));

// TODO abstract from server
nconf.file('user', configFile)

const DEV_BASE_URL = nconf.get('BASE_URL');

const envVars = [
  'AMAZON_PAYMENTS_SELLER_ID',
  'AMAZON_PAYMENTS_CLIENT_ID',
  'AMAZON_PAYMENTS_MODE',
  'EMAILS_COMMUNITY_MANAGER_EMAIL',
  'EMAILS_TECH_ASSISTANCE_EMAIL',
  'EMAILS_PRESS_ENQUIRY_EMAIL',
  'BASE_URL',
  'GA_ID',
  'STRIPE_PUB_KEY',
  'GOOGLE_CLIENT_ID',
  'APPLE_AUTH_CLIENT_ID',
  'AMPLITUDE_KEY',
  'LOGGLY_CLIENT_TOKEN',
  'TRUSTED_DOMAINS',
  'TIME_TRAVEL_ENABLED',
  'DEBUG_ENABLED',
  'CONTENT_SWITCHOVER_TIME_OFFSET',
  // TODO necessary? if yes how not to mess up with vue cli? 'NODE_ENV'
];

const envObject = {};

envVars
  .forEach(key => {
    envObject[`import.meta.env.${key}`] = `'${nconf.get(key)}'`;
  });

// https://vitejs.dev/config/
export default defineConfig({
  define: envObject,
  resolve: {
      alias: [
        { find: '@', replacement: fileURLToPath(new URL('./src', import.meta.url)) },
        { find: '~', replacement: fileURLToPath(new URL('./node_modules', import.meta.url)) },
      ],
      extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.vue']
    },
    plugins: [
      vue()
    ],
    optimizeDeps: {
      include: ['moment-recur']
    },
    build: {
      commonjsOptions: {
        include: [/moment-recur/, /node_modules/]
      }
    },
    base: '/',
    server: {
      headers: { 'Cache-Control': 'no-store' },
    proxy: {
      // proxy all requests to the server at IP:PORT as specified in the top-level config
      '^/api/v3': {
        target: DEV_BASE_URL,
        changeOrigin: true,
      },
      '^/api/v4': {
        target: DEV_BASE_URL,
        changeOrigin: true,
      },
      '^/stripe': {
        target: DEV_BASE_URL,
        changeOrigin: true,
      },
      '^/amazon': {
        target: DEV_BASE_URL,
        changeOrigin: true,
      },
      '^/paypal': {
        target: DEV_BASE_URL,
        changeOrigin: true,
      },
      '^/logout-server': {
        target: DEV_BASE_URL,
        changeOrigin: true,
      },
      '^/export': {
        target: DEV_BASE_URL,
        changeOrigin: true,
      },
      '^/analytics': {
        target: DEV_BASE_URL,
        changeOrigin: true,
      },
    }
  }
})
