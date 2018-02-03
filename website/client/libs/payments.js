import getStore from 'client/store';

const AMAZON_PAYMENTS = process.env.AMAZON_PAYMENTS; // eslint-disable-line
const NODE_ENV = process.env.NODE_ENV; // eslint-disable-line

export function setup () {
  const store = getStore();

  // Set Amazon Payments as ready in the store,
  // Added here to make sure the listener is registered before the script can be executed
  window.onAmazonLoginReady = () => {
    store.state.isAmazonReady = true;
    window.amazon.Login.setClientId(AMAZON_PAYMENTS.CLIENT_ID);
  };

  // Load the scripts

  // Amazon Payments
  const amazonScript = document.createElement('script');
  let firstScript = document.getElementsByTagName('script')[0];
  amazonScript.type = 'text/javascript';
  amazonScript.async = true;
  amazonScript.src = `https://static-na.payments-amazon.com/OffAmazonPayments/us/${(NODE_ENV === 'production' ? '' : 'sandbox/')}js/Widgets.js`;
  firstScript.parentNode.insertBefore(amazonScript, firstScript);

  // Stripe
  const stripeScript = document.createElement('script');
  firstScript = document.getElementsByTagName('script')[0];
  stripeScript.async = true;
  stripeScript.src = '//checkout.stripe.com/v2/checkout.js';
  firstScript.parentNode.insertBefore(stripeScript, firstScript);
}
