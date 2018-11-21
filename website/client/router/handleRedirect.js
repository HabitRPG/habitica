export default function (to, from, next) {
  const redirect = to.params.redirect;

  switch (redirect) {
    case 'paypal-success-checkout':
      console.log('checkout');
      break;
    case 'paypal-success-subscribe':
      console.log('subscribe');
      break;
    default:
      next({name: 'notFound'});
  }
}