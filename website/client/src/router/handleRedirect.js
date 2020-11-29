import { CONSTANTS, getLocalSetting, setLocalSetting } from '@/libs/userlocalManager';
import * as Analytics from '@/libs/analytics';

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
      return null;
    }
    case 'stripe-success-checkout': {
      const appState = getLocalSetting(CONSTANTS.savedAppStateValues.SAVED_APP_STATE);
      if (appState) {
        const newAppState = JSON.parse(appState);
        newAppState.paymentCompleted = true;
        setLocalSetting(CONSTANTS.savedAppStateValues.SAVED_APP_STATE, JSON.stringify(newAppState));

        const newGroup = newAppState.group;
        if (newGroup && newGroup._id) {
          // Handle new user signup
          if (newAppState.newSignup === true) {
            Analytics.track({
              hitType: 'event',
              eventCategory: 'group-plans-static',
              eventAction: 'view',
              eventLabel: 'paid-with-stripe',
            });

            return next({
              name: 'groupPlanDetailTaskInformation',
              params: { groupId: newGroup._id },
              query: { showGroupOverview: 'true' },
            });
          }

          return next({
            name: 'groupPlanDetailTaskInformation',
            params: { groupId: newGroup._id },
          });
        }
      }
      return next({ name: 'tasks' });
    }
    case 'stripe-error-checkout': {
      // @TODO
      return null;
    }
    default:
      return next({ name: 'notFound' });
  }
}
