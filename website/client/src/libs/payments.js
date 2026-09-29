export function setup () { // eslint-disable-line import/prefer-default-export
  const stripeScript = document.createElement('script');
  const firstScript = document.getElementsByTagName('script')[0];
  stripeScript.async = true;
  stripeScript.src = 'https://js.stripe.com/v3/';
  firstScript.parentNode.insertBefore(stripeScript, firstScript);
}
