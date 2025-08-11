import nconf from 'nconf';
import path from 'path';
import { defineConfig } from 'vite'
import { ViteS3 } from '@froxz/vite-plugin-s3'
import { compression } from 'vite-plugin-compression2';
import vue from '@vitejs/plugin-vue2'
import { fileURLToPath } from 'node:url'
import setupNconf from '../server/libs/setupNconf';

const configFile = path.join(path.resolve(__dirname, '../../config.json'));
setupNconf(configFile, nconf);
const DEV_BASE_URL = nconf.get('BASE_URL');

let S3_URL = nconf.get('S3_URL');
if (S3_URL && !S3_URL.endsWith('/')) {
  S3_URL += '/';
}

const ENABLE_S3 = S3_URL && nconf.get('S3_ACCESS_KEY') && nconf.get('S3_SECRET_KEY');


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
  'PLAY_CONSOLE_ORDERS_BASE_URL',
];

const envObject = {};

envVars
  .forEach(key => {
    envObject[`import.meta.env.${key}`] = `'${nconf.get(key)}'`;
    envObject[`process.env.${key}`] = `'${nconf.get(key)}'`;
  });
if (nconf.get('BASE_URL').indexOf('//habitica.com') !== -1) {
  envObject['import.meta.env.DEBUG_ENABLED'] = `false`;
  envObject['import.meta.env.TIME_TRAVEL_ENABLED'] = `false`;
}

// https://vitejs.dev/config/
export default defineConfig({
  define: envObject,
  resolve: {
    alias: [
      { find: '@', replacement: fileURLToPath(new URL('./src', import.meta.url)) },
      { find: '~', replacement: fileURLToPath(new URL('./node_modules', import.meta.url)) },
    ],
    extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.vue'],
    dedupe: ['moment', 'lodash', 'moment-recur'],
  },
  plugins: [
    vue(),
    compression({
      filename: 'compressed/[base]',
      compressionOptions: { level: 9 },
      skipIfLargerOrEqual: false,
    }),
    ViteS3(ENABLE_S3, {
      include: [/compressed\/.*/],
      basePath: nconf.get('S3_BASE_PATH'),
      clientConfig: {
        credentials: {
          accessKeyId: nconf.get('S3_ACCESS_KEY'),
          secretAccessKey: nconf.get('S3_SECRET_KEY'),
        },
        region: nconf.get('S3_REGION'),
      },
      uploadOptions: {
        Bucket: nconf.get('S3_BUCKET_NAME'),
        ContentEncoding: 'gzip',
      }
    }),
    ViteS3(ENABLE_S3, {
      include: [/.*\.(png|jpg|jpeg|gif|svg|webp|ico)/],
      basePath: nconf.get('S3_BASE_PATH'),
      clientConfig: {
        credentials: {
          accessKeyId: nconf.get('S3_ACCESS_KEY'),
          secretAccessKey: nconf.get('S3_SECRET_KEY'),
        },
        region: nconf.get('S3_REGION'),
      },
      uploadOptions: {
        Bucket: nconf.get('S3_BUCKET_NAME'),
      }
    })
  ],
  experimental: {
    renderBuiltUrl(filename, { hostType }) {
      if (ENABLE_S3) {
        if (hostType === 'js' && (filename.endsWith('.js') || filename.endsWith('.css'))) {
          return { relative: true }
        } else if (filename.endsWith('.js') || filename.endsWith('.css')) {
          const name = filename.replace('assets/', 'compressed/')
          return `${S3_URL}${name}`
        }
        return `${S3_URL}${filename}`
      } else {
        return { relative: true }
      }
    }
  },
  optimizeDeps: {
    include: ['moment-recur']
  },
  build: {
    commonjsOptions: {
      include: [/moment-recur/, /node_modules/]
    },
    rollupOptions: {
      output: {
        experimentalMinChunkSize: 1000
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
