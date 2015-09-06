var Firebase = require('firebase');
var nconf = require('nconf');
var isProd = true;
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

  firebaseRef.child('users/' + userId + '/rooms/' + groupId)
    .set(true);
};

api.removeUserFromGroup = function(groupId, userId){
  if(!isProd) return;
  if(!userId || !groupId) throw new Error('groupId, userId are required.');

  firebaseRef.child('members/' + groupId + '/' + userId)
    .remove();

  firebaseRef.child('users/' + userId + '/rooms/' + groupId)
    .remove();
};

// FIXME not really necessary as long as we only store room data,
// as empty objects are automatically deleted (/members/... in future...)
api.deleteGroup = function(groupId){
  if(!isProd) return;
  if(!groupId) throw new Error('groupId is required.');

  firebaseRef.child('members/' + groupId)
    .remove();
};

// FIXME not really necessary as long as we only store room data,
// as empty objects are automatically deleted
api.deleteUser = function(userId){
  if(!isProd) return;
  if(!userId) throw new Error('userId is required.');

  firebaseRef.child('users/' + userId)
    .remove();
};

api.userLeaves