/* eslint-disable global-require, no-process-env, import/no-commonjs */

// Register babel hook so we can write the real entry file (server.js) in ES6
// In production, the es6 code is pre-transpiled so it doesn't need it

if (process.env.NODE_ENV !== 'production') {
  require('@babel/register'); // eslint-disable-line import/no-extraneous-dependencies
}

const cluster = require('cluster');

const setupNconf = require('./libs/setupNconf');

// Initialize configuration BEFORE anything
setupNconf();

// Initialize @google-cloud/trace-agent
require('./libs/gcpTraceAgent');

const logger = require('./libs/logger').default;

const { ENABLE_CLUSTER, CORES } = require('./libs/config');

// Setup the cluster module
if (ENABLE_CLUSTER) {
  // Fork workers. If config.json has WEB_CONCURRENCY=x,
  // use that - otherwise, use all cpus-1 (production)
  for (let i = 0; i < CORES; i += 1) {
    cluster.fork();
  }

  cluster.on('disconnect', worker => {
    const w = cluster.fork(); // replace the dead worker

    logger.info(`[${new Date()}] [master:${process.pid}] worker:${worker.process.pid} disconnect! new worker:${w.process.pid} fork`);
  });
} else {
  module.exports = require('./server');
}
