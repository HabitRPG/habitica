export default function sleep (user, req = {}, analytics) {
  user.preferences.sleep = !user.preferences.sleep;

  if (analytics) {
    analytics.track('sleep', {
      uuid: user._id,
      status: user.preferences.sleep,
      category: 'behavior',
      headers: req.headers,
    });
  }

  return [user.preferences.sleep];
}
