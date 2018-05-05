'use strict';

/****************************************
 * Reason: After running the 20160529_fix_challenges.js migration
 * challenge.broken was set to null, which is not a valid value
 * which caused cron to fail and run many times, messing up daily values,
 * history and streaks
 *
 * Note: Part of this code does calculation to look up users that
 * were affected. After the user ids were found, @crookedneighbor
 * pm'ed each user asking if they would like their tasks reset to the previous day
 ***************************************/

global.Promise = require('bluebird');
const MongoClient = require('mongodb').MongoClient;
const TaskQueue = require('cwait').TaskQueue;
const logger = require('./utils/logger');

const TASK_IDS = require('../task_ids.json');
// cached call to getAffectedUsers minus the users I've helped manually
const POSSIBLY_AFFECTED_USERS = require('../users.json');
const AFFECTED_USERS = require('../users_with_bad_history.json');

// PROD: Enable prod db
const OLD_DB_URI = 'mongodb://localhost/new-prod-copy';
const NEW_DB_URI = 'mongodb://username:password@dsXXXXXX-a0.mlab.com:XXXXX,dsXXXXXX-a1.mlab.com:XXXXX/habitica?replicaSet=rs-dsXXXXXX';

let oldDb, newDb, OldTasks, NewTasks, OldUsers, NewUsers;
let count = 0;

var timer = setInterval(function(){
  count++;
  if (count % 30 === 0) {
    logger.warn('Process has been running for', count / 60, 'minutes');
  }
}, 1000);

Promise.all([
  connectToDb(OLD_DB_URI, 'backup'),
  connectToDb(NEW_DB_URI, 'prod'),
])
  .then(assignDbVariables)
  // .then(getAffectedUsersEmail)
  // .then(findAffectedUsers)
  // .then(determineIfTasksNeedAdjusting)
  .then(getValuesOfOldTasksFromBackup)
  .then(updateNewTasks)
  .then(closeDb)
  .catch(reportError)

function connectToDb (dbUri, type) {
  return new Promise((resolve, reject) => {
    MongoClient.connect(dbUri, (err, database) => {
      if (err) {
        logger.error(`Uh oh... Problem connecting to the ${type} database`);
        return reject(err);
      }

      logger.success(`Connected to the ${type} database`);

      resolve(database);
    });
  });
}

function reportError (err) {
  logger.error('Uh oh, an error occurred');
  // closeDb();
  throw err;
}

function assignDbVariables (results) {
  oldDb = results[0];
  OldTasks = oldDb.collection('tasks_backup');
  OldUsers = oldDb.collection('users');

  newDb = results[1];
  NewTasks = newDb.collection('tasks');
  NewUsers = newDb.collection('users');

  return Promise.resolve();
}

function getAffectedUsersEmail () {
  logger.info('Looking up emails and pm-ability for affected users');

  let pmsWithEmail = [];
  let emails = [];
  let missing = [];

  return NewUsers.find({_id: {$in: AFFECTED_USERS}}, ['preferences', 'inbox', 'auth.facebook.email', 'auth.local.email']).toArray().then((users) => {
    users.forEach((user) => {
      if (user.preferences.emailNotifications.newPM && user.inbox.optOut !== true) {
        pmsWithEmail.push(user._id);
      } else {
        if (user.auth && user.auth.local && user.auth.local.email) {
          emails.push(user.auth.local.email);
        } else if (user.auth && user.auth.facebook && user.auth.facebook.email) {
          emails.push(user.auth.facebook.email);
        } else {
          missing.push(user._id);
        }
      }
    });

    logger.log('PMable users with email notification');
    logger.log(pmsWithEmail);

    logger.log('Emailable users');
    logger.log(emails);

    logger.log('Unreachable users');
    logger.log(missing);

    return Promise.resolve();
  });
}

function findAffectedUsers () {
  logger.info('finding affected users');
  return NewTasks.find({_id: {$in: TASK_IDS}}).toArray().then((tasks) => {
    let users = unique(tasks.map(task => task.userId));

    logger.success('Found', users.length, 'users that may have been affected');

    return Promise.resolve(users);
  });
}

function determineIfTasksNeedAdjusting (tasks) {
  return Promise.all([
    OldTasks.find({userId: {$in: POSSIBLY_AFFECTED_USERS}, type: 'daily'}, ['value', 'history', 'userId']).toArray(),
    NewTasks.find({userId: {$in: POSSIBLY_AFFECTED_USERS}, type: 'daily'}, ['value', 'history', 'userId']).toArray(),
  ]).then((results) => {
    let backupTasks = results[0];
    let prodTasks = results[1];

    logger.success(backupTasks.length, 'dailys found in backup db');
    logger.success(prodTasks.length, 'dailys found in prod db');

    let backupTasksAsObject = backupTasks.reduce((object, task) => {
      object[task._id] = task;
      return object;
    }, {});
    let prodTasksGroupedByUser = prodTasks.reduce((object, task) => {
      if (!object[task.userId]) object[task.userId] = [];
      object[task.userId].push(task);
      return object;
    }, {});

    let usersWithBadHistory = POSSIBLY_AFFECTED_USERS.filter((user) => {
      let tasks = prodTasksGroupedByUser[user];
      if (!tasks) return false;

      for (let i = 0; i < tasks.length; i++) {
        let prodTask = tasks[i];
        let backupTask = backupTasksAsObject[prodTask._id];

        if (!backupTask) { continue; }

        let historyDifference = prodTask.history.length - backupTask.history.length;

        if (historyDifference > 4) {
          return true;
        }
      }

      return false;
    });

    logger.info('Total possibly affected users:', POSSIBLY_AFFECTED_USERS.length);
    logger.info('Users with wonky task data:', usersWithBadHistory.length);

    return Promise.resolve(usersWithBadHistory);
  });
}

let usersToRun = [
  // Since this is happening a little at a time as users get back to us, just fill this in with user ids
];

function getValuesOfOldTasksFromBackup () {
  logger.info('looking for tasks');

  return OldTasks.find({userId: {$in: usersToRun}}, ['value', 'streak', 'history']).toArray();
}

function updateNewTasks (oldTasks) {
  let queue = new TaskQueue(Promise, 300);
  let promiseCount = 0;

  logger.info('About to update', oldTasks.length, 'user tasks');

  function updateTaskById (task) {
    promiseCount++;

    if (promiseCount % 100=== 0) {
      logger.info(promiseCount, 'updates started');
    }

    return NewTasks.findOneAndUpdate({_id: task._id}, {$set: {value: task.value, streak: task.streak, history: task.history}}, {returnOriginal: false})
  }

  return Promise.map(oldTasks, queue.wrap(updateTaskById)).then((result) => {
    let updates = result.filter(res => res.lastErrorObject && res.lastErrorObject.updatedExisting)
    let failures = result.filter(res => !(res.lastErrorObject && res.lastErrorObject.updatedExisting));

    logger.success(updates.length, 'tasks have been fixed');

    if (failures.length > 0) {
      logger.error(failures.length, 'tasks could not be found');
    }

    return Promise.resolve();
  });
}

function unique (array) {
  return Array.from(new Set(array));
}

function closeDb () {
  logger.success('The process took ' + count + ' seconds');

  clearInterval(timer)

  oldDb.close();
  newDb.close();
}
