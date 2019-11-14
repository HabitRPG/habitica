export function hasCompletedOnboarding (user) {
  return (
    !user.achievements.createdTask
    || !user.achievements.completedTask
    || !user.achievements.hatchedPet
    || !user.achievements.fedPet
    || !user.achievements.purchasedEquipment
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
