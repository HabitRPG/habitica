'use strict';
/* eslint-disable global-require, no-process-env */

// Register babel hook so we can write the real entry file (server.js) in ES6
// In production, the es6 code is pre-transpiled so it doesn't need it
if (process.env.NODE_ENV !== 'production') {
  require('babel-register');
}

// The BabelJS polyfill is needed in production too
require('babel-polyfill');

// Only do the minimal amount of work before forking just in case of a dyno restart
const cluster = require('cluster');
const nconf = require('nconf');
const logger = require('./libs/api-v3/logger');

// Initialize configuration
const setupNconf = require('./libs/api-v3/setupNconf');
setupNconf();

const IS_PROD = nconf.get('IS_PROD');
const IS_DEV = nconf.get('IS_DEV');
const CORES = Number(nconf.get('WEB_CONCURRENCY')) || 0;

// Initialize New Relic
if (IS_PROD && nconf.get('NEW_RELIC_ENABLED') === 'true') require('newrelic');

// Setup the cluster module
if (CORES !== 0 && cluster.isMaster && (IS_DEV || IS_PROD)) {
  // Fork workers. If config.json has CORES=x, use that - otherwise, use all cpus-1 (production)
  for (let i = 0; i < CORES; i += 1) {
    cluster.fork();
  }

  cluster.on('disconnect', function onWorkerDisconnect (worker) {
    let w = cluster.fork(); // replace the dead worker

    logger.info('[%s] [master:%s] worker:%s disconnect! new worker:%s fork', new Date(), process.pid, worker.process.pid, w.process.pid);
  });
} else {
  module.exports = require('./server.js');
}
