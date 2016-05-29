'use strict';

const authorName = 'Blade';
const authorUuid = '75f270e8-c5db-4722-a5e6-a83f1b23f76b';

global.Promise = require('bluebird');
const MongoClient = require('mongodb').MongoClient;
const chalk = require('chalk');

const logger = {
  info: _logger('info', 'cyan'),
  success: _logger('info', 'green'),
  error: _logger('error', 'red'),
  log: _logger('log', 'white'),
  warn: _logger('warn', 'yellow'),
}

function _logger (type, color) {
  return function () {
    let args = Array.from(arguments).map(arg => chalk[color](arg));
    console[type].apply(null, args);
  }
}

// PROD: Enable prod db
// const NODE_DB_URI = 'mongodb://username:password@dsXXXXXX-a0.mlab.com:XXXXX,dsXXXXXX-a1.mlab.com:XXXXX/habitica?replicaSet=rs-dsXXXXXX';
const NODE_DB_URI = 'mongodb://localhost/new-prod-copy';

// Cached ids from running the findBrokenChallengeTasks query on a local copy of the db
const TASK_IDS = require('../taskids.json');

let db;
let count = 0;

var timer = setInterval(function(){
  count++;
  if (count % 30 === 0) {
    logger.warn('Process has been running for', count / 60, 'minutes');
  }
}, 1000);

connectToDb()
  .then(findBrokenChallengeTasks)
  .then(getDataFromTasks)
  .then(getUserChallenges)
  .then(getChallengeTasks)
  .then(correctUserTasks)
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

  return db.collection('tasks').find({'userId': null, 'challenge.id': { '$in': data.challenges }}, [ 'text', 'type', 'challenge' ]).toArray().then((docs) => {
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

  let nonExistantChallenges = [];
  let tasksToUpdate = [];

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

            let foundTask = userTasks.find((task) => {
              return task.type === type && task.text === text;
            })

            if (foundTask) {
              foundTask.challenge.id = chal;
              foundTask.challenge.broken = null;
              foundTask.challenge.taskId = taskId;

              tasksToUpdate.push(foundTask);
            }
          });
        } else {
          nonExistantChallenges.push(chal);
        }
      });
    }
  }

  data.tasksToUpdate = tasksToUpdate;
  data.nonExistantChallenges = unique(nonExistantChallenges);

  logger.success('Found', tasksToUpdate.length, 'tasks to update.');
  logger.error('Found', data.nonExistantChallenges.length, 'challenge ids that do not belong to a challenge.');

  return Promise.resolve(data);
}

function updateTasks (data) {
  logger.info('About to update', data.tasksToUpdate.length, 'tasks...');

  let tasksToUpdate = data.tasksToUpdate;
  let promises = tasksToUpdate.map((task) => {
    return db.collection('tasks').findOneAndUpdate({_id: task._id, 'challenge.broken': 'CHALLENGE_TASK_NOT_FOUND'}, {$set: {challenge: task.challenge}}, {returnOriginal: false})
  })

  return Promise.all(promises).then((result) => {
    logger.success('Tasks have been fixed');
    return Promise.resolve(data);
  });
}

function closeDb (data) {
  logger.success('The process took ' + count + ' seconds');

  clearInterval(timer)

  db.close();
}
