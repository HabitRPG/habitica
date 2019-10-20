// @TODO: I have abstracted this in another PR. Use that function when merged
function getApiKey () {
  let AUTH_SETTINGS = localStorage.getItem('habit-mobile-settings');

  if (AUTH_SETTINGS) {
    AUTH_SETTINGS = JSON.parse(AUTH_SETTINGS);

    if (AUTH_SETTINGS.auth && AUTH_SETTINGS.auth.apiId && AUTH_SETTINGS.auth.apiToken) {
      return AUTH_SETTINGS.auth.apiToken;
    }
  }

  return null;
}

export function goToModForm (user) { // eslint-disable-line import/prefer-default-export
  if (!user) return;

  const apiKey = getApiKey();
  if (!apiKey) return;

  const tenMins = 10 * 60 * 1000;
  const dateTime = new Date();
  dateTime.setTime(dateTime.getTime() + tenMins);
  const expires = `expires=${dateTime.toGMTString()}`;

  const email = encodeURIComponent(user.auth.local.email);

  const userData = {
    email,
    profileName: user.profile.name,
    uuid: user._id,
    apiKey,
  };

  document.cookie = `habiticauserdata=${JSON.stringify(userData)};${expires};domain=.habitica.com;path=/`;

  window.location.href = 'https://contact.habitica.com';
}
