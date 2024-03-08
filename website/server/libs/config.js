import nconf from 'nconf';
import cluster from 'cluster';

const IS_PROD = nconf.get('IS_PROD');
const IS_DEV = nconf.get('IS_DEV');
const CORES = Number(nconf.get('WEB_CONCURRENCY')) || 0;

const ENABLE_CLUSTER = CORES !== 0 && cluster.isMaster && (IS_DEV || IS_PROD);

export {
  IS_PROD,
  IS_DEV,
  CORES,
  ENABLE_CLUSTER,
};
