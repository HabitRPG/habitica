export function hasCompletedOnboarding (user) {
  return (
    user.achievements.createdTask === true
    && user.achievements.completedTask === true
    && user.achievements.hatchedPet === true
    && user.achievements.fedPet === true
    && user.achievements.purchasedEquipment === true
  );
}

export function checkOnboardingStatus (user) {
  if (hasCompletedOnboarding(user)) {
    // Award gold
    user.stats.gp += 100;
    // Add notification
    if (user.addNotification) {
      user.addNotification('ONBOARDING_COMPLETED');
    }
  }
}
