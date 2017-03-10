var migrationName = 'ResyncGroupPlanMembers';
var authorName = 'TheHollidayInn'; // in case script author needs to know when their ...
var authorUuid = ''; //... own data is done

/*
 * This migrations will iterate through all groups with a group plan a subscription and resync the free
 * subscription to all members
 */

import Bluebird from 'bluebird';

import { model as Group } from '../../website/server/models/group';
import * as payments from '../../website/server/libs/payments';

async function updateGroupsWithGroupPlans () {
    let groups = await Group.find({
      'purchased.plan.planId': 'group_monthly',
      'purchased.plan.dateTerminated': null,
    }).exec();

    let promises = [];
    groups.forEach(function(group) {
      promises.push(payments.addSubscriptionToGroupUsers(group));
      promises.push(group.save())
    });

    return await Bluebird.all(promises);
};

module.exports = updateGroupsWithGroupPlans;
