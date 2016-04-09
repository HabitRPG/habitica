import Firebase from 'firebase';
import nconf from 'nconf';
const FIREBASE_CONFIG = nconf.get('FIREBASE');
const FIREBASE_ENABLED = FIREBASE_CONFIG.ENABLED === 'true';

let firebaseRef;

if (FIREBASE_ENABLED) {
  firebaseRef = new Firebase(`https://${FIREBASE_CONFIG.APP}.firebaseio.com`);

  // TODO what happens if an op is sent before client is authenticated?
  firebaseRef.authWithCustomToken(FIREBASE_CONFIG.SECRET, (err) => {
    // TODO it's ok to kill the server here? what if FB is offline?
    if (err) throw new Error('Impossible to authenticate Firebase');
  });
}

export function updateGroupData (group) {
  if (!FIREBASE_ENABLED) return;
  // TODO is throw ok? we don't have callbacks
  if (!group) throw new Error('group obj is required.');
  // Return in case of tavern (comparison working because we use string for _id)
  if (group._id === 'habitrpg') return;

  firebaseRef.child(`rooms/${group._id}`)
    .set({
      name: group.name,
    });
}

export function addUserToGroup (groupId, userId) {
  if (!FIREBASE_ENABLED) return;
  if (!userId || !groupId) throw new Error('groupId, userId are required.');
  if (groupId === 'habitrpg') return;

  firebaseRef.child(`members/${groupId}/${userId}`).set(true);
  firebaseRef.child(`users/${userId}/rooms/${groupId}`).set(true);
}

export function removeUserFromGroup (groupId, userId) {
  if (!FIREBASE_ENABLED) return;
  if (!userId || !groupId) throw new Error('groupId, userId are required.');
  if (groupId === 'habitrpg') return;

  firebaseRef.child(`members/${groupId}/${userId}`).remove();
  firebaseRef.child(`users/${userId}/rooms/${groupId}`).remove();
}

export function deleteGroup (groupId) {
  if (!FIREBASE_ENABLED) return;
  if (!groupId) throw new Error('groupId is required.');
  if (groupId === 'habitrpg') return;

  firebaseRef.child(`members/${groupId}`).remove();
  // FIXME not really necessary as long as we only store room data,
  // as empty objects are automatically deleted (/members/... in future...)
  firebaseRef.child(`rooms/${groupId}`).remove();
}

// FIXME not really necessary as long as we only store room data,
// as empty objects are automatically deleted
export function deleteUser (userId) {
  if (!FIREBASE_ENABLED) return;
  if (!userId) throw new Error('userId is required.');

  firebaseRef.child(`users/${userId}`).remove();
}