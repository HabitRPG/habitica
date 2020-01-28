import axios from 'axios';
import moment from 'moment';

export function setUpAxios (AUTH_SETTINGS) { // eslint-disable-line import/prefer-default-export
  if (!AUTH_SETTINGS) {
    AUTH_SETTINGS = localStorage.getItem('habit-mobile-settings'); // eslint-disable-line no-param-reassign, max-len
    if (!AUTH_SETTINGS) return false;
    AUTH_SETTINGS = JSON.parse(AUTH_SETTINGS); // eslint-disable-line no-param-reassign
  }

  const browserTimezoneOffset = moment().zone();

  if (AUTH_SETTINGS.auth && AUTH_SETTINGS.auth.apiId && AUTH_SETTINGS.auth.apiToken) {
    axios.defaults.headers.common['x-api-user'] = AUTH_SETTINGS.auth.apiId;
    axios.defaults.headers.common['x-api-key'] = AUTH_SETTINGS.auth.apiToken;

    axios.defaults.headers.common['x-user-timezoneOffset'] = browserTimezoneOffset;

    return true;
  }

  return false;
}

export const appleAuthProvider = {
  oauth: {
    version: '2',
    auth: '',
    grant: 'https://appleid.apple.com/auth/token',
    response_type: 'code',
  },
  scope: {
    name: 'name',
    email: 'email',
  },
  scope_delim: ' ',
  id: process.env.APPLE_AUTH_CLIENT_ID,
};

export function buildAppleAuthUrl () {
  const redirectUrl = 'https://habitrpg-delta.herokuapp.com/api/v4/user/auth/apple-redirect';
  return `https://appleid.apple.com/auth/authorize?response_mode=form_post&scope=email&response_type=code&version=2&redirect_uri=${redirectUrl}&client_id=${process.env.APPLE_AUTH_CLIENT_ID}`;
}
