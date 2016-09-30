export function profileName ({ state }) {
  let userProfileName = state.user.profile && state.user.profile.name;

  if (!userProfileName) {
    if (state.user.auth.local && state.user.auth.local.username) {
      userProfileName = state.user.auth.local.username;
    } else if (state.user.auth.facebook) {
      userProfileName = state.user.auth.facebook.displayName || state.user.auth.facebook.username;
    } else {
      userProfileName = 'Anonymous';
    }
  }

  return userProfileName;
}