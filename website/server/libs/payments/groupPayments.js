import nconf from 'nconf';
import _ from 'lodash';
import moment from 'moment';

import { model as User } from '../../models/user';
import {
  model as Group,
  basicFields as basicGroupFields,
} from '../../models/group';
import {
  getUserInfo,
  sendTxn as txnEmail,
} from '../email';

const TECH_ASSISTANCE_EMAIL = nconf.get('EMAILS_TECH_ASSISTANCE_EMAIL');
const JOINED_GROUP_PLAN = 'joined group plan';

function _dateDiff (earlyDate, lateDate) {
  if (!earlyDate || !lateDate || moment(lateDate).isBefore(earlyDate)) return 0;

  return moment(lateDate).diff(earlyDate, 'months', true);
}

/**
 * Add a subscription to members of a group
 *
 * @param  group  The Group Model that is subscribed to a group plan
 *
 * @return undefined
 */
async function addSubscriptionToGroupUsers (group) {
  let members;
  if (group.type === 'guild') {
    members = await User.find({guilds: group._id}).select('_id purchased items auth profile.name notifications').exec();
  } else {
    members = await User.find({'party._id': group._id}).select('_id purchased items auth profile.name notifications').exec();
  }

  let promises = members.map((member) => {
    return this.addSubToGroupUser(member, group);
  });

  await Promise.all(promises);
}

/**
 * Add a subscription to a new member of a group
 *
 * @param  member  The new member of the group
 *
 * @return undefined
 */
async function addSubToGroupUser (member, group) {
  // These EMAIL_TEMPLATE constants are used to pass strings into templates that are
  // stored externally and so their values must not be changed.
  const EMAIL_TEMPLATE_SUBSCRIPTION_TYPE_GOOGLE = 'Google_subscription';
  const EMAIL_TEMPLATE_SUBSCRIPTION_TYPE_IOS = 'iOS_subscription';
  const EMAIL_TEMPLATE_SUBSCRIPTION_TYPE_GROUP_PLAN = 'group_plan_free_subscription';
  const EMAIL_TEMPLATE_SUBSCRIPTION_TYPE_LIFETIME_FREE = 'lifetime_free_subscription';
  const EMAIL_TEMPLATE_SUBSCRIPTION_TYPE_NORMAL = 'normal_subscription';
  const EMAIL_TEMPLATE_SUBSCRIPTION_TYPE_UNKNOWN = 'unknown_type_of_subscription';
  const EMAIL_TEMPLATE_SUBSCRIPTION_TYPE_NONE = 'no_subscription';

  // When changing customerIdsToIgnore or paymentMethodsToIgnore, the code blocks below for
  // the `group-member-join` email template will probably need to be changed.
  let customerIdsToIgnore = [this.constants.GROUP_PLAN_CUSTOMER_ID, this.constants.UNLIMITED_CUSTOMER_ID];
  let paymentMethodsToIgnore = [this.constants.GOOGLE_PAYMENT_METHOD, this.constants.IOS_PAYMENT_METHOD];
  let previousSubscriptionType = EMAIL_TEMPLATE_SUBSCRIPTION_TYPE_NONE;
  let leader = await User.findById(group.leader).exec();

  let data = {
    user: {},
    sub: {
      key: 'group_plan_auto',
    },
    customerId: 'group-plan',
    paymentMethod: 'Group Plan',
    headers: {},
  };

  let plan = {
    planId: 'group_plan_auto',
    customerId: 'group-plan',
    dateUpdated: new Date(),
    gemsBought: 0,
    paymentMethod: 'groupPlan',
    extraMonths: 0,
    dateTerminated: null,
    lastBillingDate: null,
    dateCreated: new Date(),
    mysteryItems: [],
    consecutive: {
      trinkets: 0,
      offset: 0,
      gemCapExtra: 0,
    },
  };

  let memberPlan = member.purchased.plan;
  if (member.isSubscribed()) {
    let customerHasCancelledGroupPlan = memberPlan.customerId === this.constants.GROUP_PLAN_CUSTOMER_ID && !member.hasNotCancelled();
    let ignorePaymentPlan = paymentMethodsToIgnore.indexOf(memberPlan.paymentMethod) !== -1;
    let ignoreCustomerId = customerIdsToIgnore.indexOf(memberPlan.customerId) !== -1;

    if (ignorePaymentPlan) {
      txnEmail({email: TECH_ASSISTANCE_EMAIL}, 'admin-user-subscription-details', [
        {name: 'PROFILE_NAME', content: member.profile.name},
        {name: 'UUID', content: member._id},
        {name: 'EMAIL', content: getUserInfo(member, ['email']).email},
        {name: 'PAYMENT_METHOD', content: memberPlan.paymentMethod},
        {name: 'PURCHASED_PLAN', content: JSON.stringify(memberPlan)},
        {name: 'ACTION_NEEDED', content: 'User has joined group plan and has been told to cancel their subscription then email us. Ensure they do that then give them free sub.'},
        // TODO User won't get email instructions if they've opted out of all emails. See if we can make this email an exception and if not, report here whether they've opted out.
      ]);
    }

    if ((ignorePaymentPlan || ignoreCustomerId) && !customerHasCancelledGroupPlan) {
      // member has been added to group plan but their subscription will not be changed
      // automatically so they need a special message in the email
      if (memberPlan.paymentMethod === this.constants.GOOGLE_PAYMENT_METHOD) {
        previousSubscriptionType = EMAIL_TEMPLATE_SUBSCRIPTION_TYPE_GOOGLE;
      } else if (memberPlan.paymentMethod === this.constants.IOS_PAYMENT_METHOD) {
        previousSubscriptionType = EMAIL_TEMPLATE_SUBSCRIPTION_TYPE_IOS;
      } else if (memberPlan.customerId === this.constants.UNLIMITED_CUSTOMER_ID) {
        previousSubscriptionType = EMAIL_TEMPLATE_SUBSCRIPTION_TYPE_LIFETIME_FREE;
      } else if (memberPlan.customerId === this.constants.GROUP_PLAN_CUSTOMER_ID) {
        previousSubscriptionType = EMAIL_TEMPLATE_SUBSCRIPTION_TYPE_GROUP_PLAN;
      } else {
        // this triggers a generic message in the email template in case we forget
        // to update this code for new special cases
        previousSubscriptionType = EMAIL_TEMPLATE_SUBSCRIPTION_TYPE_UNKNOWN;
      }
      txnEmail(member, 'group-member-join', [
        {name: 'LEADER', content: leader.profile.name},
        {name: 'GROUP_NAME', content: group.name},
        {name: 'PREVIOUS_SUBSCRIPTION_TYPE', content: previousSubscriptionType},
      ]);
      return;
    }

    if (member.hasNotCancelled()) {
      await member.cancelSubscription({cancellationReason: JOINED_GROUP_PLAN});
      previousSubscriptionType = EMAIL_TEMPLATE_SUBSCRIPTION_TYPE_NORMAL;
    }

    let today = new Date();
    plan = member.purchased.plan.toObject();
    let extraMonths = Number(plan.extraMonths);
    if (plan.dateTerminated) extraMonths += _dateDiff(today, plan.dateTerminated);

    _(plan).merge({ // override with these values
      planId: 'group_plan_auto',
      customerId: 'group-plan',
      dateUpdated: today,
      paymentMethod: 'groupPlan',
      extraMonths,
      dateTerminated: null,
      lastBillingDate: null,
      owner: member._id,
    }).defaults({ // allow non-override if a plan was previously used
      gemsBought: 0,
      dateCreated: today,
      mysteryItems: [],
    }).value();
  }

  // save unused hourglass and mystery items
  plan.consecutive.trinkets = memberPlan.consecutive.trinkets;
  plan.mysteryItems = memberPlan.mysteryItems;

  member.purchased.plan = plan;
  member.items.mounts['Jackalope-RoyalPurple'] = true;
  member.markModified('items.mounts');

  data.user = member;
  await this.createSubscription(data);

  txnEmail(data.user, 'group-member-join', [
    {name: 'LEADER', content: leader.profile.name},
    {name: 'GROUP_NAME', content: group.name},
    {name: 'PREVIOUS_SUBSCRIPTION_TYPE', content: previousSubscriptionType},
  ]);
}

/**
 * Cancels subscriptions of members of a group
 *
 * @param  group  The Group Model that is cancelling a group plan
 *
 * @return undefined
 */
async function cancelGroupUsersSubscription (group) {
  let members;
  if (group.type === 'guild') {
    members = await User.find({guilds: group._id}).select('_id guilds purchased').exec();
  } else {
    members = await User.find({'party._id': group._id}).select('_id guilds purchased').exec();
  }

  let promises = members.map((member) => {
    return this.cancelGroupSubscriptionForUser(member, group);
  });

  await Promise.all(promises);
}

async function cancelGroupSubscriptionForUser (user, group, userWasRemoved = false) {
  if (user.purchased.plan.customerId !== this.constants.GROUP_PLAN_CUSTOMER_ID) return;

  let userGroups = user.guilds.toObject();
  if (user.party._id) userGroups.push(user.party._id);

  let index = userGroups.indexOf(group._id);
  userGroups.splice(index, 1);

  let groupPlansQuery = {
    type: {$in: ['guild', 'party']},
    // privacy: 'private',
    _id: {$in: userGroups},
    'purchased.plan.dateTerminated': null,
  };

  let groupFields = `${basicGroupFields} purchased`;
  let userGroupPlans = await Group.find(groupPlansQuery).select(groupFields).exec();

  if (userGroupPlans.length === 0)  {
    let leader = await User.findById(group.leader).exec();
    const email = userWasRemoved ? 'group-member-removed' : 'group-member-cancel';

    txnEmail(user, email, [
      {name: 'LEADER', content: leader.profile.name},
      {name: 'GROUP_NAME', content: group.name},
    ]);
    await this.cancelSubscription({user});
  }
}

module.exports = {
  addSubscriptionToGroupUsers,
  addSubToGroupUser,
  cancelGroupUsersSubscription,
  cancelGroupSubscriptionForUser,
};
