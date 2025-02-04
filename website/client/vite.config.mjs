import nconf from 'nconf';
import path from 'path';
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue2'
import { fileURLToPath } from 'node:url'
import prerender from '@prerenderer/rollup-plugin'

import setupNconf from '../server/libs/setupNconf';
import localePlugin from './localePlugin';
import { approvedLanguages } from '../common/script/libs/i18n';

const configFile = path.join(path.resolve(__dirname, '../../config.json'));
setupNconf(configFile, nconf);
const DEV_BASE_URL = nconf.get('BASE_URL');

const envVars = [
  'AMAZON_PAYMENTS_SELLER_ID',
  'AMAZON_PAYMENTS_CLIENT_ID',
  'AMAZON_PAYMENTS_MODE',
  'EMAILS_COMMUNITY_MANAGER_EMAIL',
  'EMAILS_TECH_ASSISTANCE_EMAIL',
  'EMAILS_PRESS_ENQUIRY_EMAIL',
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
if (nconf.get('BASE_URL').indexOf('//habitica.com') !== -1) {
  envObject['import.meta.env.DEBUG_ENABLED'] = `false`;
  envObject['import.meta.env.TIME_TRAVEL_ENABLED'] = `false`;
}

const base_pages = ['/static/home', '/static/faq'];
const localed_pages = [];
approvedLanguages.forEach((lang) => {
  base_pages.forEach((page) => {
    localed_pages.push(`${page}?lang=${lang}`);
  });
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
    localePlugin(),
    vue(),
    prerender({
      routes: localed_pages,
      renderer: '@prerenderer/renderer-puppeteer',
      indexPath: 'index-static.html',
      entryPath: 'index-static.html',
      postProcess (renderedRoute) {
        // Replace all http with https urls and localhost to your site url
        renderedRoute.html = renderedRoute.html.replace(
          /http:/ig,
          'https:',
        ).replace(
          /(https:\/\/)?(localhost|127\.0\.0\.1):\d*/ig,
          (process.env.BASE_URL || ''),
        );

        const language = renderedRoute.originalRoute.split('?')[1].split('=')[1];
        renderedRoute.outputPath = path.join(renderedRoute.route, `index.${language}.html`);
        if (renderedRoute.outputPath.indexOf('/') === 0) {
          renderedRoute.outputPath = renderedRoute.outputPath.slice(1);
        }
        console.log(`Prerendered ${renderedRoute.outputPath} - ${renderedRoute.html.length} bytes - ${renderedRoute.route}`);
      },
      rendererOptions: {
        inject: {
          prerendered: true,
        },
      }
    }),
  ],
  optimizeDeps: {
    include: ['moment-recur']
  },
  build: {
    commonjsOptions: {
      include: [/moment-recur/, /node_modules/]
    },
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
        'index-static.html': path.resolve(__dirname, 'index-static.html'),
      }
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
