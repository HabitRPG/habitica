import axios from 'axios';
import moment from 'moment';

export function setUpAxios (AUTH_SETTINGS) {
  if (!AUTH_SETTINGS) {
    AUTH_SETTINGS = localStorage.getItem('habit-mobile-settings');
    if (!AUTH_SETTINGS) return false;
    AUTH_SETTINGS = JSON.parse(AUTH_SETTINGS);
  }

  let browserTimezoneOffset = moment().zone();

  if (AUTH_SETTINGS.auth && AUTH_SETTINGS.auth.apiId && AUTH_SETTINGS.auth.apiToken) {
    axios.defaults.headers.common['x-api-user'] = AUTH_SETTINGS.auth.apiId;
    axios.defaults.headers.common['x-api-key'] = AUTH_SETTINGS.auth.apiToken;

    axios.defaults.headers.common['x-user-timezoneOffset'] = browserTimezoneOffset;

    return true;
  }

  return false;
}
