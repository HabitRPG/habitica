/*
let migrationName = 'UserFromProdToTest';
let authorName = 'TheHollidayInn'; // in case script author needs to know when their ...
let authorUuid = ''; // ... own data is done
*/

/*
 * This migraition will copy user data from prod to test
 */

let monk = require('monk');
let testConnectionSting = ''; // FOR TEST DATABASE
let usersTest = monk(testConnectionSting).get('users', { castIds: false });
let groupsTest = monk(testConnectionSting).get('groups', { castIds: false });
let challengesTest = monk(testConnectionSting).get('challenges', { castIds: false });
let tasksTest = monk(testConnectionSting).get('tasks', { castIds: false });

let monk2 = require('monk');
let liveConnectString = ''; // FOR TEST DATABASE
let userLive = monk2(liveConnectString).get('users', { castIds: false });
let groupsLive = monk2(liveConnectString).get('groups', { castIds: false });
let challengesLive = monk2(liveConnectString).get('challenges', { castIds: false });
let tasksLive = monk2(liveConnectString).get('tasks', { castIds: false });

import uniq from 'lodash/uniq';

// Variabls for updating
/*
let userIds = [
  '206039c6-24e4-4b9f-8a31-61cbb9aa3f66',
];
*/

let groupIds = [];
let challengeIds = [];
let tasksIds = [];

async function processUsers () {
  let userPromises = [];
  // {_id: {$in: userIds}}

  return userLive.find({guilds: 'b0764d64-8276-45a1-afa5-5ca9a5c64ca0'})
    .each((user) => {
      if (user.guilds.length > 0) groupIds = groupIds.concat(user.guilds);
      if (user.party._id) groupIds.push(user.party._id);
      if (user.challenges.length > 0) challengeIds = challengeIds.concat(user.challenges);
      if (user.tasksOrder.rewards.length > 0) tasksIds = tasksIds.concat(user.tasksOrder.rewards);
      if (user.tasksOrder.todos.length > 0) tasksIds = tasksIds.concat(user.tasksOrder.todos);
      if (user.tasksOrder.dailys.length > 0) tasksIds = tasksIds.concat(user.tasksOrder.dailys);
      if (user.tasksOrder.habits.length > 0) tasksIds = tasksIds.concat(user.tasksOrder.habits);

      let userPromise = usersTest.update({_id: user._id}, user, {upsert: true});
      userPromises.push(userPromise);
    }).then(() => {
      return Promise.all(userPromises);
    })
    .then(() => {
      console.log('Done User');
    });
}

function processGroups () {
  let promises = [];
  let groupsToQuery = uniq(groupIds);
  return groupsLive.find({_id: {$in: groupsToQuery}})
    .each((group) => {
      let promise = groupsTest.update({_id: group._id}, group, {upsert: true});
      promises.push(promise);
    }).then(() => {
      return Promise.all(promises);
    })
    .then(() => {
      console.log('Done Group');
    });
}

function processChallenges () {
  let promises = [];
  let challengesToQuery = uniq(challengeIds);
  return challengesLive.find({_id: {$in: challengesToQuery}})
    .each((challenge) => {
      let promise = challengesTest.update({_id: challenge._id}, challenge, {upsert: true});
      promises.push(promise);
    }).then(() => {
      return Promise.all(promises);
    })
    .then(() => {
      console.log('Done Challenge');
    });
}

function processTasks () {
  let promises = [];
  let tasksToQuery = uniq(tasksIds);
  return tasksLive.find({_id: {$in: tasksToQuery}})
    .each((task) => {
      let promise = tasksTest.update({_id: task._id}, task, {upsert: true});
      promises.push(promise);
    }).then(() => {
      return Promise.all(promises);
    })
    .then(() => {
      console.log('Done Tasks');
    });
}

module.exports = async function prodToTest () {
  await processUsers();
  await processGroups();
  await processChallenges();
  await processTasks();
};
