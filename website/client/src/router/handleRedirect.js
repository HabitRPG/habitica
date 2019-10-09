import { CONSTANTS, getLocalSetting, setLocalSetting } from '@/libs/userlocalManager';

export default function (to, from, next) {
  const { redirect } = to.params;

  switch (redirect) {
    case 'paypal-success-checkout':
    case 'paypal-success-subscribe': {
      const appState = getLocalSetting(CONSTANTS.savedAppStateValues.SAVED_APP_STATE);
      if (appState) {
        const newAppState = JSON.parse(appState);
        newAppState.paymentCompleted = true;
        setLocalSetting(CONSTANTS.savedAppStateValues.SAVED_APP_STATE, JSON.stringify(newAppState));
      }
      window.close();
      break;
    }
    default:
      next({ name: 'notFound' });
  }
}
