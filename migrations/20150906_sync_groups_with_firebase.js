/*
 * Sync groups with Firebase
 */

var mongo = require('mongoskin');
var Firebase = require('Firebase');

var dbserver = 'mongodb://url';
var dbname = 'db';

var db = mongo.db(dbserver + '/' + dbname + '?auto_reconnect');
var dbGroups = db.collection('groups');
var countGroups = 0;

var firebaseRef = new Firebase('https://' + 'firebase-app' + '.firebaseio.com');

// TODO handle sync errors with firebase?
firebaseRef.authWithCustomToken('firebase-secret', function(err, authData){
  if(err) throw new Error('Impossible to authenticate Firebase');

  console.log('Firebase connected, begins work on db');

  dbGroups.findEach({}, {_id: 1, members: 1}, {batchSize: 100}, function(err, group){
    if(err) throw err;
    if(group._id !== 'habitrpg') return;

    countGroups++;
    console.log('Group: ', countGroups);

    firebaseRef.child('rooms/' + group._id)
      .set({
        name: group.name
      });

    group.members.forEach(function(member){
      firebaseRef.child('members/' + group._id + '/' + userId)
        .set(true);

      firebaseRef.child('users/' + member + '/rooms/' + group._id)
        .set(true);
    });
  });
});