const nconf = require('nconf');

const IS_PROD = nconf.get('IS_PROD');
const STACKDRIVER_TRACING_ENABLED = nconf.get('ENABLE_STACKDRIVER_TRACING') === 'true';

let tracer = null;

if (IS_PROD && STACKDRIVER_TRACING_ENABLED) {
  tracer = require('@google-cloud/trace-agent').start(); // eslint-disable-line global-require
}

export default tracer;