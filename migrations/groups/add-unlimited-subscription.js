/*
let migrationName = 'AddUnlimitedSubscription';
let authorName = 'TheHollidayInn'; // in case script author needs to know when their ...
let authorUuid = ''; // ... own data is done
*/

/*
 * This migrations will add a free subscription to a specified group
 */
import moment from 'moment';

import { model as Group } from '../../website/server/models/group';

// @TODO: this should probably be a GroupManager library method
async function addUnlimitedSubscription (groupId, dateTerminated) {
  const group = await Group.findOne({ _id: groupId });

  group.purchased.plan.customerId = 'group-unlimited';
  group.purchased.plan.dateCreated = new Date();
  group.purchased.plan.dateUpdated = new Date();
  group.purchased.plan.paymentMethod = 'Group Unlimited';
  group.purchased.plan.planId = 'group_monthly';
  group.purchased.plan.dateTerminated = null;
  if (dateTerminated) {
    const dateToEnd = moment(dateTerminated).toDate();
    group.purchased.plan.dateTerminated = dateToEnd;
  }
  // group.purchased.plan.owner = ObjectId();
  group.purchased.plan.subscriptionId = '';

  return group.save();
}

export default async function addUnlimitedSubscriptionCreator () {
  const groupId = process.argv[2];

  if (!groupId) throw Error('Group ID is required');

  const dateTerminated = process.argv[3];

  await addUnlimitedSubscription(groupId, dateTerminated);
}
