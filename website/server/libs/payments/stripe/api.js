import stripeModule from 'stripe';
import nconf from 'nconf';

let stripe = stripeModule(nconf.get('STRIPE_API_KEY'));

function setStripeApi (stripeInc) {
  stripe = stripeInc;
}

module.exports = { stripe, setStripeApi };
