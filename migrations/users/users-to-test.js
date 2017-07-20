var migrationName = 'UserFromProdToTest';
var authorName = 'TheHollidayInn'; // in case script author needs to know when their ...
var authorUuid = ''; //... own data is done

/*
 * This migraition will copy user data from prod to test
 */

var monk = require('monk');
var testConnectionSting = ''; // FOR TEST DATABASE
var usersTest = monk(testConnectionSting).get('users', { castIds: false });
var groupsTest = monk(testConnectionSting).get('groups', { castIds: false });
var challengesTest = monk(testConnectionSting).get('challenges', { castIds: false });
var tasksTest = monk(testConnectionSting).get('tasks', { castIds: false });

var monk2 = require('monk');
var liveConnectString = ''; // FOR TEST DATABASE
var userLive = monk2(liveConnectString).get('users', { castIds: false });
var groupsLive = monk2(liveConnectString).get('groups', { castIds: false });
var challengesLive = monk2(liveConnectString).get('challenges', { castIds: false });
var tasksLive = monk2(liveConnectString).get('tasks', { castIds: false });

import uniq from 'lodash/uniq';
import Bluebird from 'bluebird';

// Variabls for updating
let userIds = [
  '206039c6-24e4-4b9f-8a31-61cbb9aa3f66',
];

let groupIds = [];
let challengeIds = [];
let tasksIds = [];

async function processUsers () {
  let userPromises = [];
  //{_id: {$in: userIds}}

  return userLive.find({guilds: 'b0764d64-8276-45a1-afa5-5ca9a5c64ca0'})
    .each((user, {close, pause, resume}) => {
      if (user.guilds.length > 0) groupIds = groupIds.concat(user.guilds);
      if (user.party._id) groupIds.push(user.party._id);
      if (user.challenges.length > 0) challengeIds = challengeIds.concat(user.challenges);
      if (user.tasksOrder.rewards.length > 0) tasksIds = tasksIds.concat(user.tasksOrder.rewards);
      if (user.tasksOrder.todos.length > 0) tasksIds = tasksIds.concat(user.tasksOrder.todos);
      if (user.tasksOrder.dailys.length > 0) tasksIds = tasksIds.concat(user.tasksOrder.dailys);
      if (user.tasksOrder.habits.length > 0) tasksIds = tasksIds.concat(user.tasksOrder.habits);

      let userPromise = usersTest.update({'_id': user._id}, user, {upsert:true});
      userPromises.push(userPromise);
    }).then(() => {
      return Bluebird.all(userPromises);
    })
    .then(() => {
      console.log("Done User");
    });
}

function processGroups () {
  let promises = [];
  let groupsToQuery = uniq(groupIds);
  return groupsLive.find({_id: {$in: groupsToQuery}})
    .each((group, {close, pause, resume}) => {
      let promise = groupsTest.update({_id: group._id}, group, {upsert:true});
      promises.push(promise);
    }).then(() => {
      return Bluebird.all(promises);
    })
    .then(() => {
      console.log("Done Group");
    });
}

function processChallenges () {
  let promises = [];
  let challengesToQuery = uniq(challengeIds);
  return challengesLive.find({_id: {$in: challengesToQuery}})
    .each((challenge, {close, pause, resume}) => {
      let promise = challengesTest.update({_id: challenge._id}, challenge, {upsert:true});
      promises.push(promise);
    }).then(() => {
      return Bluebird.all(promises);
    })
    .then(() => {
      console.log("Done Challenge");
    });
}

function processTasks () {
  let promises = [];
  let tasksToQuery = uniq(tasksIds);
  return tasksLive.find({_id: {$in: tasksToQuery}})
    .each((task, {close, pause, resume}) => {
      let promise = tasksTest.update({_id: task._id}, task, {upsert:true});
      promises.push(promise);
    }).then(() => {
      return Bluebird.all(promises);
    })
    .then(() => {
      console.log("Done Tasks");
    });
}

module.exports = async function prodToTest () {
  await processUsers();
  await processGroups();
  await processChallenges();
  await processTasks();
};
