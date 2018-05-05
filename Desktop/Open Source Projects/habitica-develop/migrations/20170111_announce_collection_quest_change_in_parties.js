'use strict';

/****************************************
 * Author: @Alys
 *
 * Reason: Collection quests are being changed
 * to require fewer items collected:
 * https://github.com/HabitRPG/habitrpg/pull/7987
 * This will cause existing quests to end sooner
 * than the party is expecting.
 * This script inserts an explanatory `system`
 * message into the chat for affected parties.
 ***************************************/

global.Promise = require('bluebird');
const uuid = require('uuid');
const TaskQueue = require('cwait').TaskQueue;
const logger = require('./utils/logger');
const Timer = require('./utils/timer');
const connectToDb = require('./utils/connect').connectToDb;
const closeDb = require('./utils/connect').closeDb;

const message = '`This party\'s collection quest has been made easier! For details, refer to http://habitica.wikia.com/wiki/User_blog:LadyAlys/Collection_Quests_are_Now_Easier`';

const timer = new Timer();

// PROD: Enable prod db
// const DB_URI = 'mongodb://username:password@dsXXXXXX-a0.mlab.com:XXXXX,dsXXXXXX-a1.mlab.com:XXXXX/habitica?replicaSet=rs-dsXXXXXX';
const DB_URI = 'mongodb://localhost/habitrpg';

const COLLECTION_QUESTS = [
  'vice2',
  'egg',
  'moonstone1',
  'goldenknight1',
  'dilatoryDistress1',
];

let Groups;

connectToDb(DB_URI).then((db) => {
  Groups = db.collection('groups');

  return Promise.resolve();
})
.then(findPartiesWithCollectionQuest)
// .then(displayGroups) // for testing only
.then(addMessageToGroups)
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

function findPartiesWithCollectionQuest () {
  logger.info('Looking up groups on collection quests...');

  return Groups.find({'quest.key': {$in: COLLECTION_QUESTS}}, ['name','quest']).toArray().then((groups) => {
    logger.success('Found', groups.length, 'parties on collection quests');

    return Promise.resolve(groups);
  })
}

function displayGroups (groups) { // for testing only
  logger.info('Displaying parties...');
  console.log(groups);
  return Promise.resolve(groups);
}

function updateGroupById (group) {
  var newMessage = {
    'id' : uuid.v4(),
    'text' : message,
    'timestamp': Date.now(),
    'likes': {},
    'flags': {},
    'flagCount': 0,
    'uuid': 'system'
  };
  return Groups.findOneAndUpdate({_id: group._id}, {$push:{"chat" :{$each: [newMessage], $position:0}}}, {returnOriginal: false});
  // Does not set the newMessage flag for all party members because I don't think it's essential and
  // I don't want to run the extra code (extra database load, extra opportunity for bugs).
}

function addMessageToGroups (groups) {
  let queue = new TaskQueue(Promise, 300);

  logger.info('About to update', groups.length, 'parties...');

  return Promise.map(groups, queue.wrap(updateGroupById)).then((result) => {
    let updates = result.filter(res => res.lastErrorObject && res.lastErrorObject.updatedExisting)
    let failures = result.filter(res => !(res.lastErrorObject && res.lastErrorObject.updatedExisting));

    logger.success(updates.length, 'parties have been notified');

    if (failures.length > 0) {
      logger.error(failures.length, 'parties could not be notified');
    }

    return Promise.resolve();
  });
}

