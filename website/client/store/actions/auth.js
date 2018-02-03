import axios from 'axios';

const LOCALSTORAGE_AUTH_KEY = 'habit-mobile-settings';
const LOCALSTORAGE_SOCIAL_AUTH_KEY = 'hello'; // Used by hello.js for social auth

export async function register (store, params) {
  let url = '/api/v3/user/auth/local/register';

  if (params.groupInvite) url += `?groupInvite=${params.groupInvite}`;

  let result = await axios.post(url, {
    username: params.username,
    email: params.email,
    password: params.password,
    confirmPassword: params.passwordConfirm,
  });

  let user = result.data.data;

  let userLocalData = JSON.stringify({
    auth: {
      apiId: user._id,
      apiToken: user.apiToken,
    },
  });
  localStorage.setItem(LOCALSTORAGE_AUTH_KEY, userLocalData);
}

export async function login (store, params) {
  let url = '/api/v3/user/auth/local/login';
  let result = await axios.post(url, {
    username: params.username,
    // email: params.email,
    password: params.password,
  });

  let user = result.data.data;

  let userLocalData = JSON.stringify({
    auth: {
      apiId: user.id,
      apiToken: user.apiToken,
    },
  });

  localStorage.setItem(LOCALSTORAGE_AUTH_KEY, userLocalData);
}

export async function socialAuth (store, params) {
  let url = '/api/v3/user/auth/social';
  let result = await axios.post(url, {
    network: params.auth.network,
    authResponse: params.auth.authResponse,
  });

  let user = result.data.data;

  let userLocalData = JSON.stringify({
    auth: {
      apiId: user.id,
      apiToken: user.apiToken,
    },
  });

  localStorage.setItem(LOCALSTORAGE_AUTH_KEY, userLocalData);
}

export function logout () {
  localStorage.removeItem(LOCALSTORAGE_AUTH_KEY);
  localStorage.removeItem(LOCALSTORAGE_SOCIAL_AUTH_KEY);
  window.location.href = '/logout';
}
