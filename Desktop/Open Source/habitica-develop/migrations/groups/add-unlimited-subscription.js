var migrationName = 'AddUnlimitedSubscription';
var authorName = 'TheHollidayInn'; // in case script author needs to know when their ...
var authorUuid = ''; //... own data is done

/*
 * This migrations will add a free subscription to a specified group
 */
import moment from 'moment';

import { model as Group } from '../../website/server/models/group';

// @TODO: this should probably be a GroupManager library method
async function addUnlimitedSubscription (groupId, dateTerminated) {
    let group = await Group.findById(groupId);

    group.purchased.plan.customerId = "group-unlimited";
    group.purchased.plan.dateCreated = new Date();
    group.purchased.plan.dateUpdated = new Date();
    group.purchased.plan.paymentMethod = "Group Unlimited";
    group.purchased.plan.planId = "group_monthly";
    group.purchased.plan.dateTerminated = null;
    if (dateTerminated) {
        let dateToEnd = moment(dateTerminated).toDate();
        group.purchased.plan.dateTerminated = dateToEnd;
    }
    // group.purchased.plan.owner = ObjectId();
    group.purchased.plan.subscriptionId = "";

    return group.save();
};

module.exports = async function addUnlimitedSubscriptionCreator () {
    let groupId = process.argv[2];

    if (!groupId) throw Error('Group ID is required');

    let dateTerminated = process.argv[3];

    let result = await addUnlimitedSubscription(groupId, dateTerminated);
};
