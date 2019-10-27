import Vue from 'vue';

export function setUpLogging () { // eslint-disable-line import/prefer-default-export
  window.onerror = function windowOnError (message, source, lineno, colno, error) {
    console.error('Unhandled error JS code.');
    console.error('Message:', message);
    console.error('Source:', source);
    console.error('Line:', lineno, 'Column:', colno);
    console.error('Error;', error);
  };

  let _LTracker = window._LTracker || []; // eslint-disable-line
  _LTracker.push({ // eslint-disable-line
    logglyKey: process.env.LOGGLY_CLIENT_TOKEN, // eslint-disable-line no-process-env
    sendConsoleErrors: true,
    tag: 'ClientJS',
    json: true,
  });

  window.onunhandledrejection = event => {
    console.error(`Unhandled promise rejection: ${event.reason}`);
    console.error('Full info:', event);
    _LTracker.push({
      event,
    });
  };

  Vue.config.errorHandler = (err, vm, info) => {
    console.error('Unhandled error in Vue.js code.');
    console.error('Error:', err);
    console.error('Component where it occured:', vm);
    console.error('Info:', info);

    _LTracker.push({
      err,
      vm,
      info,
    });
  };
}
