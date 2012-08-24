if (process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'debug') {
  // "up" module interferes with node debug & node-inspector
  // also, nodejitsu (aka, 'production') doesn't like up
  port = process.env.PORT || 3000;
  require('./lib/server').listen(port);
} else {
  require('derby').run(__dirname + '/lib/server');
}