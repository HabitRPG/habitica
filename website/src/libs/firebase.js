var Firebase = require('firebase');
var nconf = require('nconf');
var isProd = nconf.get('NODE_ENV') === 'production';
var firebaseRef;
var firebaseConfig = nconf.get('FIREBASE');

// Setup
if(isProd){
  firebaseRef = new Firebase('https://' + firebaseConfig.APP + '.firebaseio.com');

  firebaseRef.authWithCustomToken(firebaseConfig.SECRET, function(err, authData){
    // TODO it's ok to kill the server here? what if FB is offline?
    if(err) throw new Error('Impossible to authenticate Firebase');
  });
}

var api = module.exports = {};

api.addUserToGroup = function(groupId, userId){
  if(!isProd) return;

  // TODO is throw ok? we don't have callbacks
  if(!userId || !groupId) throw new Error('groupId, userId are required.');

  firebaseRef.child('members/' + groupId + '/' + userId)
    .set(true);

  firebaseRef.child('users/' + userId + '/' + groupId)
    .set(true);
};

api.removeUserFromGroup = function(groupId, userId){
  if(!isProd) return;

  if(!userId || !groupId) throw new Error('groupId, userId are required.');

  firebaseRef.child('members/' + groupId + '/' + userId)
    .set(false);

  firebaseRef.child('users/' + userId + '/' + groupId)
    .set(false);
};

api.userLeaves