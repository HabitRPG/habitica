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
export function checkOnboardingStatus (user) {
  if (hasCompletedOnboarding(user) && user.addNotification) {
    user.addNotification('ONBOARDING_COMPLETE');
    onOnboardingComplete(user);
  }
}
