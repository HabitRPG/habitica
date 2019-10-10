import nconf from 'nconf';

const IS_PROD = nconf.get('IS_PROD');
const STACKDRIVER_TRACING_ENABLED = nconf.get('ENABLE_STACKDRIVER_TRACING') === 'true';

const tracer = IS_PROD && STACKDRIVER_TRACING_ENABLED
  ? require('@google-cloud/trace-agent').start()
  : null;

export default tracer;
