import nconf from 'nconf';
import { RegistrationEventModel } from '../models/analytics/registrationEvent';
import { SubscriptionEventModel } from '../models/analytics/subscriptionEvent';

const LOCAL_ANALYTICS = !nconf.get('DISABLE_LOCAL_ANALYTICS');

function getAuthenticationMethod (user) {
  if (user.auth.google && user.auth.google.id) return 'google';
  if (user.auth.facebook && user.auth.facebook.id) return 'facebook';
  if (user.auth.apple && user.auth.apple.id) return 'apple';
  return 'local';
}

export async function trackRegistrationEvent (eventData) {
  if (!LOCAL_ANALYTICS) return null;

  const { user, ipAddress, method } = eventData;

  const registrationEvent = new RegistrationEventModel({
    userId: user._id,
    ipAddress,
    authenticationMethod: method || getAuthenticationMethod(user),
    platform: user.registeredThrough,
    language: user.preferences.language,
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
