import os from 'os';
import nconf from 'nconf';

const IS_PROD = nconf.get('IS_PROD');

// Due to some limitation in the `run-rs` module that is used in development
// In order to connect to the database on Windows the hostname must be used
// instead of `localhost`.
// See https://github.com/vkarpov15/run-rs#notes-on-connecting
// for more info.
//
// This function takes in a connection string and in case it's being run on Windows
// it replaces `localhost` with the hostname.
export function getDevelopmentConnectionUrl (originalConnectionUrl) {
  const isWindows = os.platform() === 'win32';

  if (isWindows) {
    const hostname = os.hostname();
    return originalConnectionUrl.replace('mongodb://localhost', `mongodb://${hostname}`);
  }

  return originalConnectionUrl;
}

export function getDefaultConnectionOptions () {
  const commonOptions = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  };

  return !IS_PROD ? commonOptions : {
    // See https://mongoosejs.com/docs/connections.html#keepAlive
    keepAlive: true,
    keepAliveInitialDelay: 300000,
    ...commonOptions,
  };
}
