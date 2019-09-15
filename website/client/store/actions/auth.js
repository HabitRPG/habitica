import axios from 'axios';

const LOCALSTORAGE_AUTH_KEY = 'habit-mobile-settings';

export async function register (store, params) {
  let url = '/api/v4/user/auth/local/register';

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
  let url = '/api/v4/user/auth/local/login';
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

export async function verifyUsername (store, params) {
  let url = '/api/v4/user/auth/verify-username';
  let result = await axios.post(url, {
    username: params.username,
  });

  return result.data.data;
}

export async function verifyDisplayName (store, params) {
  let url = '/api/v4/user/auth/verify-display-name';
  let result = await axios.post(url, {
    displayName: params.displayName,
  });

  return result.data.data;
}

export async function socialAuth (store, params) {
  let url = '/api/v4/user/auth/social';
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
  localStorage.clear();
  window.location.href = '/logout-server';
}
