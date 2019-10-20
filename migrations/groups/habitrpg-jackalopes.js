/* let migrationName = 'Jackalopes for Unlimited Subscribers'; */

/*
 * This migration will find users with unlimited subscriptions who are also eligible
 * for Jackalope mounts, and award them
 */

import { model as Group } from '../../website/server/models/group';
import { model as User } from '../../website/server/models/user';

async function handOutJackalopes () {
  const promises = [];
  const cursor = User.find({
    'purchased.plan.customerId': 'habitrpg',
  }).cursor();

  cursor.on('data', async user => {
    console.log(`User: ${user._id}`);

    let groupList = [];
    if (user.party._id) groupList.push(user.party._id);
    groupList = groupList.concat(user.guilds);

    const subscribedGroup = await Group.findOne({
      _id: { $in: groupList },
      'purchased.plan.planId': 'group_monthly',
      'purchased.plan.dateTerminated': null,
    },
    { _id: 1 });

    if (subscribedGroup) {
      User.update({ _id: user._id }, { $set: { 'items.mounts.Jackalope-RoyalPurple': true } }).exec();
      promises.push(user.save());
    }
  });

  cursor.on('close', async () => {
    console.log('done');
    return Promise.all(promises);
  });
}

export default handOutJackalopes;
