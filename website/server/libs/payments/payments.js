import {
  addSubscriptionToGroupUsers,
  addSubToGroupUser,
  cancelGroupUsersSubscription,
  cancelGroupSubscriptionForUser,
} from './groupPayments';
import {
  createSubscription,
  cancelSubscription,
} from './subscriptions';
import {
  buyGems,
} from './gems';

let api = {};

api.constants = {
  UNLIMITED_CUSTOMER_ID: 'habitrpg', // Users with the customerId have an unlimted free subscription
  GROUP_PLAN_CUSTOMER_ID: 'group-plan',
  GROUP_PLAN_PAYMENT_METHOD: 'Group Plan',
  GOOGLE_PAYMENT_METHOD: 'Google',
  IOS_PAYMENT_METHOD: 'Apple',
};

api.addSubscriptionToGroupUsers = addSubscriptionToGroupUsers;

api.addSubToGroupUser = addSubToGroupUser;

api.cancelGroupUsersSubscription = cancelGroupUsersSubscription;

api.cancelGroupSubscriptionForUser = cancelGroupSubscriptionForUser;

api.createSubscription = createSubscription;

api.cancelSubscription = cancelSubscription;

api.buyGems = buyGems;

module.exports = api;
