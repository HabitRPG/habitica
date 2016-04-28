'use strict';

require('babel-register');

let _ = require('lodash');
let updateUser = require('./_helper').updateUser;
let userId = process.argv[2];

if (!userId) {
  console.error('USAGE: node debug-scripts/grant-all-pets.js <user_id>');
  console.error('EFFECT: Adds all pets to specified user');
  return;
}

let dropPets = require('../common').content.pets;
let questPets = require('../common').content.questPets;
let specialPets = require('../common').content.specialPets;
let premiumPets = require('../common').content.premiumPets;

let userPets = {};

_.each([ dropPets, questPets, specialPets, premiumPets ], (set) => {
  _.each(set, (pet, key) => {
    userPets[key] = 95;
  });
})

updateUser(userId, 'items.pets', userPets);
