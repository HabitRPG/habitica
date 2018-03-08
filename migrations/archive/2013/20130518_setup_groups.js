/**
 * In adding the Guilds feature (which supports the Challenges feature), we are consolidating parties and guilds
 * into one collection: groups, with group.type either 'party' or 'guild'. We are also creating the 'habitrpg' guild,
 * which everyone is auto-subscribed to, and moving tavern chat into that guild
 *
 * mongo habitrpg ./node_modules/lodash/lodash.js ./migrations/20130518_setup_groups.js
 */

/**
 * TODO
 * 1) rename collection parties => groups
 * 2) add group.type = 'party' for each current group
 * 3) create habitrpg group, .type='guild'
 * 4) move tavern.chat.chat into habitrpg guild
 * 5) subscribe everyone to habitrpg (be sure to set that for default user too!)
 */

db.parties.renameCollection('groups', true);
// db.parties.dropCollection(); // doesn't seem to do this step during rename...
// db.parties.ensureIndex( { 'members': 1,  'background': 1} );

db.groups.update({}, {$set: {type: 'party'}}, {multi: true});

// migrate invitation mechanisms
db.users.update(
  {},
  {
    $remove: {party: 1},
    $set: {invitations: {party: null, guilds: []}},
  },
  {multi: 1}
);

tavern = db.tavern.findOne();
db.tavern.drop();

// TODO make as a callback of previous, or make sure group.type is still 'guild' for habitrpg in the end
db.groups.insert({
  _id: 'habitrpg',
  leader: '9',
  type: 'guild',
  name: 'HabitRPG',
  chat: tavern.messages,
  info: {
    blurb: '',
    websites: [],
  },
});