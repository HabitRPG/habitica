var Amplitude = require('amplitude');
var amplitude;

var analytics = {
  init: init,
  track: track
}

function init(options) {
  if(!options) { throw 'No options provided' }

  if(options.amplitudeToken) {
    amplitude = new Amplitude(options.amplitudeToken, options.uuid);
  }
}

function track(data) {
  if(!amplitude) throw 'Amplitude not initialized';
  amplitude.track(data);
}

module.exports = analytics;
