export function setUpLogging () { // eslint-disable-line import/prefer-default-export
  let _LTracker = window._LTracker || []; // eslint-disable-line
  _LTracker.push({ // eslint-disable-line
    logglyKey: process.env.LOGGLY_CLIENT_TOKEN, // eslint-disable-line no-process-env
    sendConsoleErrors: true,
    tag: 'ClientJS',
    json: true,
  });
}
