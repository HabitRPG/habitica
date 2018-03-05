export function getModFormLink (user) {
  if (!user) return '';
  const email = encodeURIComponent(user.auth.local.email);
  return `http://contact.habitica.com/?email=${email}&profileName=${user.profile.name}&uuid=${user._id}`;
}
