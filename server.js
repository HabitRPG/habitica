if (process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'debug') {
  // "up" module interferes with node debug & node-inspector
  // also, nodejitsu (aka, 'production') doesn't like up
  console.log("Using require('./lib/server').listen(3000) without Up");
  require('./lib/server').listen(3000);
} else {
  require('derby').run(__dirname + '/lib/server');
}