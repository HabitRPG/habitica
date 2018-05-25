'use strict';

/****************************************
 * Author: Blade Barringer @crookedneighbor
 *
 * Reason: The android app uses quest.progress.collect
 * And is failing because it's mapping a number value
 * to an object. This creates a new property collectionItems
 * and transfers a group's progress to it
 ***************************************/

global.Promise = require('bluebird');
const TaskQueue = require('cwait').TaskQueue;
const logger = require('./utils/logger');
const Timer = require('./utils/timer');
const connectToDb = require('./utils/connect').connectToDb;
const closeDb = require('./utils/connect').closeDb;

const timer = new Timer();

// PROD: Enable prod db
// const DB_URI = 'mongodb://username:password@dsXXXXXX-a0.mlab.com:XXXXX,dsXXXXXX-a1.mlab.com:XXXXX/habitica?replicaSet=rs-dsXXXXXX';
const DB_URI = 'mongodb://localhost/new-prod-copy';

const COLLECTION_QUESTS = [
  'evilsanta2',
  'vice2',
  'egg',
  'atom1',
  'moonstone1',
  'goldenknight1',
  'dilatoryDistress1',
]

let Users, Groups;

connectToDb(DB_URI).then((db) => {
  Users = db.collection('users');
  Groups = db.collection('groups');

  return Promise.resolve();
})
.then(findUsersWithCollectionData)
.then(getUsersCollectionData)
.then(transferCollectionData)
.then(cleanUpBadCollectionData)
.then(() => {
  timer.stop();
  closeDb();
}).catch(reportError);

function reportError (err) {
  logger.error('Uh oh, an error occurred');
  closeDb();
  timer.stop();
  throw err;
}

function findUsersWithCollectionData () {
  logger.info('Looking up groups on collection quests...');

  return Groups.find({'quest.key': {$in: COLLECTION_QUESTS }}, ['quest.members']).toArray().then((groups) => {
    logger.success('Found', groups.length, 'parties on collection quests');
    logger.info('Parsing member data...');

    let members = groups.reduce((array, party) => {
      let questers = Object.keys(party.quest.members);
      array.push.apply(array, questers);
      return array;
    }, []);

    logger.success('Found', members.length, 'users on collection quests');

    return Promise.resolve(members);
  })
}

function getUsersCollectionData (users) {
  logger.info('Fetching collection data from users...');

  return Users.find({_id: {$in: users}}, ['party.quest.progress']).toArray().then((docs) => {
    let items = docs.reduce((array, user) => {
      let total = 0;
      let collect = user.party && user.party.quest && user.party.quest.progress && user.party.quest.progress.collect;

      if (!collect) return array;

      array.push({_id: user._id, collect});

      return array;
    }, []);

    return Promise.resolve(items);
  });
}

function updateUserById (user) {
  return Users.findOneAndUpdate({_id: user._id}, {$set: {'party.quest.progress.collectedItems': user.collect}}, {returnOriginal: false})
}


function transferCollectionData (users) {
  let queue = new TaskQueue(Promise, 300);

  logger.info('About to update', users.length, 'user collection items...');

  return Promise.map(users, queue.wrap(updateUserById)).then((result) => {
    let updates = result.filter(res => res.lastErrorObject && res.lastErrorObject.updatedExisting)
    let failures = result.filter(res => !(res.lastErrorObject && res.lastErrorObject.updatedExisting));

    logger.success(updates.length, 'users have been fixed');

    if (failures.length > 0) {
      logger.error(failures.length, 'users could not be found');
    }

    return Promise.resolve();
  });
}

function cleanUpBadCollectionData () {
  logger.info('Updating All Users');

  return Users.updateMany({}, {$set: {'party.quest.progress.collect': {}}}).then((r) => {
    let updates = r.result.n;

    logger.success(updates, 'users have been fixed');

    return Promise.resolve();
  });
}
