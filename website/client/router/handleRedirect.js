import { CONSTANTS, removeLocalSetting } from 'client/libs/userlocalManager';

export default function (to, from, next) {
  const redirect = to.params.redirect;

  switch (redirect) {
    case 'paypal-success-checkout':
    case 'paypal-success-subscribe':
      removeLocalSetting(CONSTANTS.savedAppStateValues.SAVED_APP_STATE);
      window.close();
      break;
    default:
      next({name: 'notFound'});
  }
}