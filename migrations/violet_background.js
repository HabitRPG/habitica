var migrationName = 'violet_backgrounds.js';

/*
 * This migration will find users with unlimited subscriptions who are also eligible for Jackalope mounts, and award them
 */
import Bluebird from 'bluebird';

import { model as Group } from '../../website/server/models/group';
import { model as User } from '../../website/server/models/user';
import * as payments from '../../website/server/libs/payments';

async function addVioletBGs () {
  let userCount = 0;
  let promises = [];
  let cursor = User.find({
    'purchased.background.violet': {$ne: true},
  }).cursor();

  cursor.on('data', function(user) {
    userCount++;
    if (userCount % 1000 === 0) {
      console.log(userCount + ' ' + user._id);
    }
    User.update({'_id': user._id}, {$set: {
      'purchased.background.violet': true,
      'migration': migrationName,
    }}).exec();
    promises.push(user.save());
  });

  cursor.on('close', async function() {
    console.log('all users found');
    return await Bluebird.all(promises);
  });
};

module.exports = addVioletBGs;
