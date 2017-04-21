var migrationName = 'Jackalopes for Unlimited Subscribers';

/*
 * This migration will find users with unlimited subscriptions who are also eligible for Jackalope mounts, and award them
 */
import Bluebird from 'bluebird';

import { model as Group } from '../../website/server/models/group';
import { model as User } from '../../website/server/models/user';
import * as payments from '../../website/server/libs/payments';

async function handOutJackalopes () {
  let promises = [];
  let cursor = User.find({
    'purchased.plan.customerId':'habitrpg',
  }).cursor();

  cursor.on('data', async function(user) {
    console.log('User: ' + user._id);

    let groupList = [];
    if (user.party._id) groupList.push(user.party._id);
    groupList = groupList.concat(user.guilds);

    let subscribedGroup =
      await Group.findOne({
        '_id': {$in: groupList},
        'purchased.plan.planId': 'group_monthly',
        'purchased.plan.dateTerminated': null,
      },
      {'_id':1}
    );

    if (subscribedGroup) {
      User.update({'_id':user._id},{$set:{'items.mounts.Jackalope-RoyalPurple':true}}).exec();
      promises.push(user.save());
    }
  });

  cursor.on('close', async function() {
    console.log('done');
    return await Bluebird.all(promises);
  });
};

module.exports = handOutJackalopes;
