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
      return null;
    }
    case 'stripe-success-checkout': {
      const appState = getLocalSetting(CONSTANTS.savedAppStateValues.SAVED_APP_STATE);
      if (appState) {
        const newAppState = JSON.parse(appState);
        newAppState.paymentCompleted = true;
        setLocalSetting(CONSTANTS.savedAppStateValues.SAVED_APP_STATE, JSON.stringify(newAppState));

        if (newAppState.isStripeEdit) {
          if (newAppState.paymentType === 'subscription') {
            return next({ name: 'subscription' });
          }

          if (newAppState.paymentType === 'groupPlan') {
            return next({
              name: 'groupPlanBilling',
              params: { groupId: newAppState.groupId },
            });
          }
        }

        const newGroup = newAppState.group;
        if (newGroup && newGroup._id) {
          // Handle new user signup
          if (newAppState.newSignup === true) {
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
      const appState = getLocalSetting(CONSTANTS.savedAppStateValues.SAVED_APP_STATE);
      if (appState) {
        const newAppState = JSON.parse(appState);
        const {
          paymentType,
          gift,
          newGroup,
          group,
          isStripeEdit,
          groupId,
        } = newAppState;

        if (paymentType === 'subscription') {
          return next({ name: 'subscription' });
        }

        if (paymentType === 'groupPlan') {
          if (isStripeEdit) {
            return next({
              name: 'groupPlanBilling',
              params: { groupId },
            });
          }

          if (newGroup) {
            return next({ name: 'groupPlan' });
          }

          if (group.type === 'party') {
            return next({
              name: 'party',
            });
          }

          return next({
            name: 'guild',
            params: { groupId: group._id },
          });
        }
        if (paymentType.indexOf('gift-') === 0) {
          return next({ name: 'userProfile', params: { userId: gift.uuid } });
        }
        if (paymentType === 'gems') {
          return next({ name: 'tasks', query: { openGemsModal: true } });
        }
      }

      return next({ name: 'tasks' });
    }
    default:
      return next({ name: 'notFound' });
  }
}
