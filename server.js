var port = process.env.PORT || 3000;
if (process.env.NODE_ENV === 'debug' || process.env.NODE_ENV === 'production') {
  // "up" module interferes with node debug & node-inspector. also, nodejitsu (aka, 'production') doesn't like up
  console.log('Running in ' + process.env.NODE_ENV + ': require("./lib/server").listen(' + port + ');');
  require('./lib/server').listen(port);
} else {
  require('derby').run(__dirname + '/lib/server', port);
}