export function hasCompletedOnboarding (user) {
  return (
    user.achievements.createdTask === true
    && user.achievements.completedTask === true
    && user.achievements.hatchedPet === true
    && user.achievements.fedPet === true
    && user.achievements.purchasedEquipment === true
  );
}

export function onOnboardingComplete (user) {
  // Award gold
  user.stats.gp += 100;
}

// Add notification and awards (server)
export function checkOnboardingStatus (user, req, analytics) {
  if (hasCompletedOnboarding(user) && user.addNotification) {
    user.addNotification('ONBOARDING_COMPLETE');
    if (analytics) {
      analytics.track('onboarding complete', {
        uuid: user._id,
        hitType: 'event',
        category: 'behavior',
        headers: req.headers,
      });
    }
    onOnboardingComplete(user);
  }
}
