export function goToModForm (user) {
  if (!user) return;

  const tenMins = 10 * 60 * 1000;
  let dateTime;
  dateTime = new Date();
  dateTime.setTime(dateTime.getTime() + tenMins);
  const expires = `expires=${dateTime.toGMTString()}`;

  const email = encodeURIComponent(user.auth.local.email);

  const userData = {
    email,
    profileName: user.profile.name,
    uuid: user._id,
  };

  document.cookie = `habiticauserdata=${JSON.stringify(userData)};${expires};domain=.habitica.com;path=/`;

  window.location.href = 'http://contact.habitica.com';
}
