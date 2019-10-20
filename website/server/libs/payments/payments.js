import { // eslint-disable-line import/no-cycle
  addSubscriptionToGroupUsers,
  addSubToGroupUser,
  cancelGroupUsersSubscription,
  cancelGroupSubscriptionForUser,
} from './groupPayments';
import { // eslint-disable-line import/no-cycle
  createSubscription,
  cancelSubscription,
} from './subscriptions';
import { // eslint-disable-line import/no-cycle
  buyGems,
} from './gems';

const api = {};

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

export default api;
