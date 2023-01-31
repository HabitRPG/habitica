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
import { // eslint-disable-line import/no-cycle
  buySkuItem,
} from './skuItem';
import { paymentConstants } from './constants';

const api = {};

api.constants = paymentConstants;

api.addSubscriptionToGroupUsers = addSubscriptionToGroupUsers;

api.addSubToGroupUser = addSubToGroupUser;

api.cancelGroupUsersSubscription = cancelGroupUsersSubscription;

api.cancelGroupSubscriptionForUser = cancelGroupSubscriptionForUser;

api.createSubscription = createSubscription;

api.cancelSubscription = cancelSubscription;

api.buyGems = buyGems;

api.buySkuItem = buySkuItem;

export default api;
