// Register babel hook so we can write the real entry file (server.js) in ES6
require('babel-core/register');

// Only do the minimal amount of work before forking just in case of a dyno restart
var cluster = require('cluster');
var nconf = require('nconf');
var logger = require('./libs/api-v3/logger');

// Initialize configuration
var setupNconf = require('./libs/api-v3/setupNconf');
setupNconf();

var IS_PROD = nconf.get('IS_PROD');
var IS_DEV = nconf.get('IS_DEV');
var cores = Number(nconf.get('WEB_CONCURRENCY')) || 0;

if (IS_DEV) Error.stackTraceLimit = Infinity;

// Setup the cluster module
if (cores !== 0 && cluster.isMaster && (IS_DEV || IS_PROD)) {
  // Fork workers. If config.json has CORES=x, use that - otherwise, use all cpus-1 (production)
  for (var i = 0; i < cores; i += 1) {
    cluster.fork();
  }

  cluster.on('disconnect', (worker) => {
    var w = cluster.fork(); // replace the dead worker

    logger.info('[%s] [master:%s] worker:%s disconnect! new worker:%s fork', new Date(), process.pid, worker.process.pid, w.process.pid);
  });
} else {
  module.exports = require('./server.js');
}
