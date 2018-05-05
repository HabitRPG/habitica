'use strict';

/****************************************
 * Reason: After the api v3 maintenance migration, some challenge tasks
 * became unlinked from their challenges. We're still not sure why,
 * but this re-links them
 *
 * Note: We ran this on a local backup of the DB, and from that, grabbed
 * the ids of the tasks that could be fixed and the updates that would
 * be applied to them. We only ran the `updateTasks` promise task.
 *
 * IMPORTANT - Setting challenge.broken to null caused issues
 * see https://github.com/HabitRPG/habitrpg/issues/7546
 ***************************************/

const authorName = 'Blade';
const authorUuid = '75f270e8-c5db-4722-a5e6-a83f1b23f76b';

global.Promise = require('bluebird');
const MongoClient = require('mongodb').MongoClient;
const TaskQueue = require('cwait').TaskQueue;
const logger = require('./utils/logger');

// PROD: Enable prod db
// const NODE_DB_URI = 'mongodb://username:password@dsXXXXXX-a0.mlab.com:XXXXX,dsXXXXXX-a1.mlab.com:XXXXX/habitica?replicaSet=rs-dsXXXXXX';
const NODE_DB_URI = 'mongodb://localhost/new-prod-copy';

// Cached ids from running the findBrokenChallengeTasks query on a local copy of the db
// These are all the ids that _are_ fixable
const TASK_IDS = require('../fixable_task_ids.json');
const TASK_UPDATE_DATA = require('../challenge_fixes.json');

let db;
let count = 0;

var timer = setInterval(function(){
  count++;
  if (count % 30 === 0) {
    logger.warn('Process has been running for', count / 60, 'minutes');
  }
}, 1000);

connectToDb()
  // .then(findBrokenChallengeTasks)
  // .then(getDataFromTasks)
  // .then(getUserChallenges)
  // .then(getChallengeTasks)
  // .then(correctUserTasks)
  .then(updateTasks)
  .then(closeDb)
  .catch(reportError)

function connectToDb () {
  return new Promise((resolve, reject) => {
    MongoClient.connect(NODE_DB_URI, (err, database) => {
      if (err) {
        logger.error('Uh oh... Problem connecting to the new database');
        return reject(err);
      }

      logger.success('Connected to the database');

      db = database;

      resolve(db);
    });
  });
}

function reportError (err) {
  logger.error('Uh oh, an error occurred');
  closeDb();
  throw err;
}

function unique (array) {
  return Array.from(new Set(array));
}

function findBrokenChallengeTasks () {
  logger.info('Looking for broken tasks...');

  // return db.collection('tasks').find({'challenge.broken': 'CHALLENGE_TASK_NOT_FOUND'}).toArray()
  return db.collection('tasks').find({'_id': { '$in': TASK_IDS }}).toArray()
		.then((tasks) => {
			logger.success('Found', tasks.length, 'broken tasks.');
			return Promise.resolve(tasks);
		});
}

function getDataFromTasks (tasks) {
  logger.info('Collecting data about the tasks...');

  let userTasks = {};

  tasks.forEach((task) => {
    let userId = task.userId;

    if (!userTasks[userId]) {
      userTasks[userId] = [];
    }
    userTasks[userId].push(task);
  });

  let users = unique(tasks.map(task => task.userId));

  return Promise.resolve({
    users,
    userTasks,
    tasks,
  });
}

function getUserChallenges (data) {
  logger.info('Collecting user challenges...');

  return db.collection('users').find({_id: { '$in': data.users }}, {challenges: 1}).toArray().then((docs) => {
    logger.success('Found', docs.length, 'users from broken challenge tasks.');

    let challenges = [];
    docs.forEach((user) => {
      challenges.push.apply(challenges, user.challenges);
    });

    challenges = unique(challenges);

    let userChallenges = {};

    docs.forEach((user) => {
      let userId = user._id;
      if (!userChallenges[userId]) {
        userChallenges[userId] = [];
      }
      userChallenges[userId].push.apply(userChallenges[userId], user.challenges);
    });

    data.userChallenges = userChallenges;
    data.challenges = challenges;

    logger.success('Found', challenges.length, 'unique challenges.');

    return Promise.resolve(data);
  });
}

function getChallengeTasks (data) {
  logger.info('Looking up original challenge tasks...');

  return db.collection('tasks').find({'userId': null, 'challenge.id': { '$in': data.challenges }}, [ 'text', 'type', 'challenge', '_legacyId' ]).toArray().then((docs) => {
    logger.success('Found', docs.length, 'challenge tasks.');

    let challengeTasks = {};

    docs.forEach((task) => {
      let chalId = task.challenge.id;
      if (!challengeTasks[chalId]) {
        challengeTasks[chalId] = [];
      }
      challengeTasks[chalId].push(task);
    });
    data.challengeTasks = challengeTasks;

    return Promise.resolve(data);
  });
}

function correctUserTasks (data) {
  logger.info('Correcting user tasks...');

  let tasksToUpdate = {};
  let duplicateTasks = {};

  for (let user in data.userChallenges) {
    if (user === authorUuid) {
      logger.success('Processing data for', authorName);
    }
    if (data.userChallenges.hasOwnProperty(user)) {
      let challenges = data.userChallenges[user];

      challenges.forEach((chal) => {
        let challengeTasks = data.challengeTasks[chal];
        let userTasks = data.userTasks[user];

        if (challengeTasks) {
          challengeTasks.forEach((challengeTask) => {
            let text = challengeTask.text;
            let type = challengeTask.type;
            let taskId = challengeTask._id;
            let legacyId = challengeTask._legacyId;

            let foundTask = userTasks.find((task) => {
              return TASK_IDS.indexOf(task._id) > -1 && task._legacyId === legacyId && task.type === type && task.text === text;
            })

            if (foundTask && !tasksToUpdate[foundTask._id]) {
              tasksToUpdate[foundTask._id] = {
                id: chal,
                broken: null, // NOTE: this caused a lot of problems
                taskId,
              }
            } else if (foundTask && taskId !== tasksToUpdate[foundTask._id].taskId) {
              logger.error('Duplicate task found, id:', foundTask._id);
              duplicateTasks[foundTask._id] = duplicateTasks[foundTask._id] || [tasksToUpdate[foundTask._id].taskId];
              duplicateTasks[foundTask._id].push(taskId);
            }
          });
        }
      });
    }
  }

  let numberOfDuplicateTasksFound = Object.keys(duplicateTasks).length;

  if (numberOfDuplicateTasksFound > 0) {
    logger.error('Found', numberOfDuplicateTasksFound, 'duplicate taks');
  }


  data.tasksToUpdate = tasksToUpdate;

  return Promise.resolve(data);
}

function updateTasks (data) {
  let tasksToUpdate = TASK_UPDATE_DATA;
  let taskIdsToUpdate = Object.keys(tasksToUpdate);
  let queue = new TaskQueue(Promise, 300);
  let promiseCount = 0;

  logger.info('About to update', taskIdsToUpdate.length, 'user tasks');

  function updateTaskById (taskId) {
    promiseCount++;

    if (promiseCount % 500 === 0) {
      logger.info(promiseCount, 'updates started');
    }

    return db.collection('tasks').findOneAndUpdate({_id: taskId, 'challenge.broken': 'CHALLENGE_TASK_NOT_FOUND'}, {$set: {challenge: tasksToUpdate[taskId]}}, {returnOriginal: false})
  }

  return Promise.map(taskIdsToUpdate, queue.wrap(updateTaskById)).then((result) => {
    let updates = result.filter(res => res.lastErrorObject.updatedExisting)
    let failures = result.filter(res => !res.lastErrorObject.updatedExisting);

    logger.success(updates.length, 'tasks have been fixed');

    if (failures.length > 0) {
      logger.error(failures.length, 'tasks could not be updated');
      logger.error('Manually check these results');
      logger.error(failures);
    }

    return Promise.resolve(data);
  });
}

function closeDb (data) {
  logger.success('The process took ' + count + ' seconds');

  clearInterval(timer)

  db.close();
}
