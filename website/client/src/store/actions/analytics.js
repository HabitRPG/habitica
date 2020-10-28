import axios from 'axios';

export async function trackEvent (store, params) {
  const url = '/analytics/track';

  await axios.post(url, params);
}
