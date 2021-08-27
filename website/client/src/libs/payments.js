import getStore from '@/store';

export function setup () { // eslint-disable-line import/prefer-default-export
  const store = getStore();

  // Set Amazon Payments as ready in the store,
  // Added here to make sure the listener is registered before the script can be executed
  window.onAmazonLoginReady = () => {
    store.state.isAmazonReady = true;
    window.amazon.Login.setClientId(process.env.AMAZON_PAYMENTS_CLIENT_ID);
  };

  // Load the scripts

  // Amazon Payments
  const amazonScript = document.createElement('script');
  let firstScript = document.getElementsByTagName('script')[0];
  amazonScript.type = 'text/javascript';
  amazonScript.async = true;
  amazonScript.src = `https://static-na.payments-amazon.com/OffAmazonPayments/us/${(process.env.AMAZON_PAYMENTS_MODE === 'sandbox' ? 'sandbox/' : '')}js/Widgets.js`;
  firstScript.parentNode.insertBefore(amazonScript, firstScript);

  // Stripe
  const stripeScript = document.createElement('script');
  [firstScript] = document.getElementsByTagName('script');
  stripeScript.async = true;
  stripeScript.src = 'https://js.stripe.com/v3/';
  firstScript.parentNode.insertBefore(stripeScript, firstScript);
}
