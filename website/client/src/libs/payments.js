export function setup () { // eslint-disable-line import/prefer-default-export
  // Load the payment scripts

  // Stripe
  const stripeScript = document.createElement('script');
  const firstScript = document.getElementsByTagName('script')[0];
  stripeScript.async = true;
  stripeScript.src = 'https://js.stripe.com/v3/';
  firstScript.parentNode.insertBefore(stripeScript, firstScript);
}
