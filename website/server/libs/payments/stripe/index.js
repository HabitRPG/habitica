import stripeConstants from './constants';
import { handleWebhooks } from './webhooks'; // eslint-disable-line import/no-cycle
import { // eslint-disable-line import/no-cycle
  createCheckoutSession,
  createEditCardCheckoutSession,
} from './checkout';
import { // eslint-disable-line import/no-cycle
  chargeForAdditionalGroupMember,
  cancelSubscription,
} from './subscriptions';
import { setStripeApi } from './api';

const api = {};

api.constants = { ...stripeConstants };

api.setStripeApi = setStripeApi;

/**
 * Allows for purchasing a user subscription, group subscription or gems with Stripe
 *
 * @param  options
 * @param  options.user  The user object who is purchasing
 * @param  options.gift  The gift details if any
 * @param  options.gift  The gem block object, if any
 * @param  options.sub  The subscription data to purchase
 * @param  options.groupId  The id of the group purchasing a subscription
 * @param  options.coupon  The coupon code, if any
 *
 * @return undefined
 */
api.createCheckoutSession = createCheckoutSession;

/**
 * Create a Stripe checkout session to edit a subscription payment method
 *
 * @param  options
 * @param  options.user  The user object who is making the request
 * @param  options.groupId  If editing a group plan, its id
 *
 * @return undefined
 */
api.createEditCardCheckoutSession = createEditCardCheckoutSession;

/**
 * Cancels a subscription created by Stripe
 *
 * @param  options
 * @param  options.user  The user object who is purchasing
 * @param  options.groupId  The id of the group purchasing a subscription
 * @param  options.cancellationReason  A text string to control sending an email
 *
 * @return undefined
 */
api.cancelSubscription = cancelSubscription;

/**
 * Update the quantity for a group plan subscription on Stripe
 *
 * @param  grouo The affected group object
 *
 * @return undefined
 */
api.chargeForAdditionalGroupMember = chargeForAdditionalGroupMember;

/**
 * Handle webhooks from stripes
 *
 * @param  options
 * @param  options.body  The raw request body
 * @param  options.groupId  The request's headers
 *
 * @return undefined
 */
api.handleWebhooks = handleWebhooks;

export default api;
