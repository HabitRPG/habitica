import nconf from 'nconf';
import { RegistrationEventModel } from '../models/analytics/registrationEvent';
import { SubscriptionEventModel } from '../models/analytics/subscriptionEvent';

const LOCAL_ANALYTICS = nconf.get('LOCAL_ANALYTICS');

function getAuthenticationMethod (user) {
  if (user.auth.google) return 'google';
  if (user.auth.facebook) return 'facebook';
  if (user.auth.apple) return 'apple';
  if (user.auth.local) return 'local';
  return 'unknown';
}

export async function trackRegistrationEvent (eventData) {
  if (!LOCAL_ANALYTICS) return null;

  const { user, ipAddress } = eventData;

  const registrationEvent = new RegistrationEventModel({
    userId: user._id,
    ipAddress,
    authenticationMethod: getAuthenticationMethod(user),
    platform: user.registeredThrough,
  });
  return registrationEvent.save();
}

export async function trackSubscriptionEvent (eventData) {
  if (!LOCAL_ANALYTICS) return null;

  const {
    eventType,
    user,
    paymentMethod,
    customerId,
    planId,
    cancellationReason,
  } = eventData;

  const subscriptionEvent = new SubscriptionEventModel({
    userId: user._id,
    eventType,
    paymentMethod,
    customerId,
    planId,
    cancellationReason,
  });
  return subscriptionEvent.save();
}
