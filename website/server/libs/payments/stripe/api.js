import stripeModule from 'stripe';
import nconf from 'nconf';

let stripe = stripeModule(nconf.get('STRIPE_API_KEY'), {
  apiVersion: '2020-08-27',
});

function setStripeApi (stripeInc) {
  stripe = stripeInc;
}

function getStripeApi () {
  return stripe;
}

export { getStripeApi, setStripeApi };
