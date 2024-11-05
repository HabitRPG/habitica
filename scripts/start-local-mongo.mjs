/* eslint-disable-file */
import { MongoMemoryReplSet } from 'mongodb-memory-server';

import { dirname } from 'node:path';
import { existsSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const TEST_MODE = process.argv.includes('--test-db');
const BUILD_MODE = process.argv.includes('--build-db');

const __dirname = dirname(fileURLToPath(import.meta.url));

const pathSuffix = TEST_MODE ? '-test' : BUILD_MODE ? '-build' : '';

const mongoDbPath = `${__dirname}/../mongodb-data`+pathSuffix;

if (!existsSync(mongoDbPath)) {
  mkdirSync(mongoDbPath);
}

(async () => {
  // async code in where

  // This will create an new instance of "MongoMemoryServer" and automatically start it
  const mongod = await MongoMemoryReplSet.create({
    replSet: {
      count: 3,
      dbName: TEST_MODE ? 'habitica-test' : 'habitica-dev',
      dbPath: mongoDbPath,
      name: 'rs',
    },
    instanceOpts: [
      {
        port: 27017,
      },
      {
        port: 27018,
      },
      {
        port: 27019,
      },
    ],
    dispose: {
      cleanup: !BUILD_MODE && !TEST_MODE,
    }
  });

  const uri = mongod.getUri();

  console.log(`MongoDB running at ${uri}`, mongod.state);

  // Keep the Node.js process running
  setInterval(() => {}, 1000);
})();
