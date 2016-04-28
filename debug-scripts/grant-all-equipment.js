'use strict';

require('babel-register');

let _ = require('lodash');
let updateUser = require('./_helper').updateUser;

let userId = process.argv[2];

if (!userId) {
  console.error('USAGE: node debug-scripts/grant-all-equipment.js <user_id>');
  console.error('EFFECT: Adds all gear to specified user');
  return;
}

let gearFlat = require('../common').content.gear.flat;

let userGear = {};

_.each(gearFlat, (piece, key) => {
  userGear[key] = true;
});

updateUser(userId, 'items.gear.owned', userGear);
