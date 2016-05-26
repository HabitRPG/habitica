'use strict';

const migrationName = '20160524_fix_challenges.js';
const authorName = 'Blade';
const authorUuid = '75f270e8-c5db-4722-a5e6-a83f1b23f76b';

global.Promise = require('bluebird');
const MongoClient = require('mongodb').MongoClient;

// PROD: Enable prod db
// const NODE_DB_URI = 'mongodb://username:password@dsXXXXXX-a0.mlab.com:XXXXX,dsXXXXXX-a1.mlab.com:XXXXX/habitica?replicaSet=rs-dsXXXXXX';
const NODE_DB_URI = 'mongodb://localhost/new-prod-copy';

let db, brokenChallengeTasks, usersWithBrokenTasks, challengesWithBrokenTasks;

MongoClient.connect(NODE_DB_URI, (err, database) => {
	if (err) {
    console.error('Uh oh... Problem connecting to the database');
		throw new Error(err);
	}

  console.log('Connected to the database');

  db = database;

  findBrokenChallengeTasks()
    .then(getDataFromTasks)
    .then(reportData)
    .catch(reportError);
});

function reportError (err) {
  console.error('Uh oh, an error occurred');
  throw err;
}

function unique (array) {
  return Array.from(new Set(array));
}

function findBrokenChallengeTasks () {
  return new Promise((resolve, reject) => {
    let Tasks = db.collection('tasks');

		console.log('looking for broken tasks...');

    Tasks.find({'challenge.broken': 'CHALLENGE_TASK_NOT_FOUND'}).toArray(function(err, docs) {
      if (err) {
        return reject(err);
      }

      resolve(docs);
    });
  });
}

function getDataFromTasks (tasks) {
  return new Promise((resolve, reject) => {

		console.log('collecting data about the tasks...');

    let users = unique(tasks.map(task => task.userId));
    let challenges = unique(tasks.map(task => task.challenge.id));

    resolve({
      users,
      challenges,
			tasks,
    });
  });
}

function reportData (data) {
	console.log('users:', data.users.length);
	console.log('challenges:', data.challenges.length);
	console.log('tasks:', data.tasks.length);

	db.close();
}
