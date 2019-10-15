/*
let migrationName = 'ResyncGroupPlanMembers';
let authorName = 'TheHollidayInn'; // in case script author needs to know when their ...
let authorUuid = ''; // ... own data is done
*/

/*
 * This migrations will iterate through all groups with a group plan
 * a subscription and resync the free subscription to all members
 */

import { model as Group } from '../../website/server/models/group';
import payments from '../../website/server/libs/payments/payments';

async function updateGroupsWithGroupPlans () {
  const cursor = Group.find({
    'purchased.plan.planId': 'group_monthly',
    'purchased.plan.dateTerminated': null,
  }).cursor();

  const promises = [];

  cursor.on('data', group => {
    promises.push(payments.addSubscriptionToGroupUsers(group));
    promises.push(group.save());
  });

  cursor.on('close', async () => Promise.all(promises));
}

export default updateGroupsWithGroupPlans;
