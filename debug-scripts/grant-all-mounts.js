'use strict';

require('babel-register');

let _ = require('lodash');
let updateUser = require('./_helper').updateUser;
let userId = process.argv[2];

if (!userId) {
  console.error('USAGE: node debug-scripts/grant-all-mounts.js <user_id>');
  console.error('EFFECT: Adds all mounts to specified user');
  return;
}

let dropMounts = require('../common').content.mounts;
let questMounts = require('../common').content.questMounts;
let specialMounts = require('../common').content.specialMounts;
let premiumMounts = require('../common').content.premiumPets; // premium mounts isn't exposed on the content object

let userMounts = {};

_.each([ dropMounts, questMounts, specialMounts, premiumMounts ], (set) => {
  _.each(set, (pet, key) => {
    userMounts[key] = true;
  });
})

updateUser(userId, 'items.mounts', userMounts);
