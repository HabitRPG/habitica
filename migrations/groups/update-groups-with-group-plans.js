import Bluebird from 'bluebird';

import { model as Group } from '../../website/server/models/group';
import * as payments from '../../website/server/libs/payments';

async function updateGroupsWithGroupPlans () {
    let groups = await Group.find({
      'purchased.plan.customerId': 'group-unlimited',
    }).exec();

    let promises = [];
    groups.forEach(function(group) {
      promises.push(payments.addSubscriptionToGroupUsers(group));
      promises.push(group.save())
    });

    return await Bluebird.all(promises);
};

module.exports = updateGroupsWithGroupPlans;
