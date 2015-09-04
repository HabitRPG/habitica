var Firebase = require('firebase');
var nconf = require('nconf');
var isProd = nconf.get('NODE_ENV') === 'production';
var firebaseRef;
var firebaseConfig = nconf.get('FIREBASE');

// Setup
if(isProd){
  firebaseRef = new Firebase('https://' + firebaseConfig.APP + '.firebaseio.com');

  firebaseRef.on('value', function(snapshot){
    console.log(snapshot.val());
  });
}

var api = module.exports = {};