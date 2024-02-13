/* eslint-disable import/no-commonjs */
/*
let migrationName = 'UserFromProdToTest';
let authorName = 'TheHollidayInn'; // in case script author needs to know when their ...
let authorUuid = ''; // ... own data is done
*/

/*
 * This migraition will copy user data from prod to test
 */

import uniq from 'lodash/uniq';

const monk = require('monk'); // eslint-disable-line import/no-extraneous-dependencies

const testConnectionSting = ''; // FOR TEST DATABASE
const usersTest = monk(testConnectionSting).get('users', { castIds: false });
const groupsTest = monk(testConnectionSting).get('groups', { castIds: false });
const challengesTest = monk(testConnectionSting).get('challenges', { castIds: false });
const tasksTest = monk(testConnectionSting).get('tasks', { castIds: false });

const monk2 = require('monk'); // eslint-disable-line import/no-extraneous-dependencies

const liveConnectString = ''; // FOR TEST DATABASE
const userLive = monk2(liveConnectString).get('users', { castIds: false });
const groupsLive = monk2(liveConnectString).get('groups', { castIds: false });
const challengesLive = monk2(liveConnectString).get('challenges', { castIds: false });
const tasksLive = monk2(liveConnectString).get('tasks', { castIds: false });

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
  const userPromises = [];
  // {_id: {$in: userIds}}

  return userLive.find({ guilds: 'b0764d64-8276-45a1-afa5-5ca9a5c64ca0' })
    .each(user => {
      if (user.guilds.length > 0) groupIds = groupIds.concat(user.guilds);
      if (user.party._id) groupIds.push(user.party._id);
      if (user.challenges.length > 0) challengeIds = challengeIds.concat(user.challenges);
      if (user.tasksOrder.rewards.length > 0) tasksIds = tasksIds.concat(user.tasksOrder.rewards);
      if (user.tasksOrder.todos.length > 0) tasksIds = tasksIds.concat(user.tasksOrder.todos);
      if (user.tasksOrder.dailys.length > 0) tasksIds = tasksIds.concat(user.tasksOrder.dailys);
      if (user.tasksOrder.habits.length > 0) tasksIds = tasksIds.concat(user.tasksOrder.habits);

      const userPromise = usersTest.update({ _id: user._id }, user, { upsert: true });
      userPromises.push(userPromise);
    }).then(() => Promise.all(userPromises))
    .then(() => {
      console.log('Done User');
    });
}

function processGroups () {
  const promises = [];
  const groupsToQuery = uniq(groupIds);
  return groupsLive.find({ _id: { $in: groupsToQuery } })
    .each(group => {
      const promise = groupsTest.update({ _id: group._id }, group, { upsert: true });
      promises.push(promise);
    }).then(() => Promise.all(promises))
    .then(() => {
      console.log('Done Group');
    });
}

function processChallenges () {
  const promises = [];
  const challengesToQuery = uniq(challengeIds);
  return challengesLive.find({ _id: { $in: challengesToQuery } })
    .each(challenge => {
      const promise = challengesTest.update({ _id: challenge._id }, challenge, { upsert: true });
      promises.push(promise);
    }).then(() => Promise.all(promises))
    .then(() => {
      console.log('Done Challenge');
    });
}

function processTasks () {
  const promises = [];
  const tasksToQuery = uniq(tasksIds);
  return tasksLive.find({ _id: { $in: tasksToQuery } })
    .each(task => {
      const promise = tasksTest.update({ _id: task._id }, task, { upsert: true });
      promises.push(promise);
    }).then(() => Promise.all(promises))
    .then(() => {
      console.log('Done Tasks');
    });
}

export default async function prodToTest () {
  await processUsers();
  await processGroups();
  await processChallenges();
  await processTasks();
}
