import axios from 'axios';
import moment from 'moment';

export function setUpAxios (AUTH_SETTINGS) { // eslint-disable-line import/prefer-default-export
  if (!AUTH_SETTINGS) {
    AUTH_SETTINGS = localStorage.getItem('habit-mobile-settings'); // eslint-disable-line no-param-reassign, max-len
    if (!AUTH_SETTINGS) return false;
    AUTH_SETTINGS = JSON.parse(AUTH_SETTINGS); // eslint-disable-line no-param-reassign
  }

  const browserTimezoneUtcOffset = moment().utcOffset();

  if (AUTH_SETTINGS.auth && AUTH_SETTINGS.auth.apiId && AUTH_SETTINGS.auth.apiToken) {
    axios.defaults.headers.common['x-api-user'] = AUTH_SETTINGS.auth.apiId;
    axios.defaults.headers.common['x-api-key'] = AUTH_SETTINGS.auth.apiToken;

    // Communicate in "old" timezone variant for backwards compatibility
    axios.defaults.headers.common['x-user-timezoneOffset'] = -browserTimezoneUtcOffset;

    return true;
  }

  return false;
}

export function buildAppleAuthUrl () {
  const redirectUrl = encodeURIComponent(`${window.location.protocol}//${window.location.host}/api/v4/user/auth/apple`);
  return `https://appleid.apple.com/auth/authorize?response_mode=form_post&scope=name%20email&response_type=code&version=2&redirect_uri=${redirectUrl}&client_id=${process.env.APPLE_AUTH_CLIENT_ID}`;
}
