import axios from 'axios';
import { socialLogin, socialLogout, setUpAxios } from '@/libs/auth';

const LOCALSTORAGE_AUTH_KEY = 'habit-mobile-settings';

export async function register (store, params) {
  let url = '/api/v4/user/auth/local/register';

  if (params.groupInvite) url += `?groupInvite=${params.groupInvite}`;

  const result = await axios.post(url, {
    username: params.username,
    email: params.email,
    password: params.password,
    confirmPassword: params.passwordConfirm,
  });

  const user = result.data.data;

  const userLocalData = JSON.stringify({
    auth: {
      apiId: user._id,
      apiToken: user.apiToken,
    },
  });
  localStorage.setItem(LOCALSTORAGE_AUTH_KEY, userLocalData);
}

export async function login (store, params) {
  const url = '/api/v4/user/auth/local/login';
  const result = await axios.post(url, {
    username: params.username,
    // email: params.email,
    password: params.password,
  });

  const user = result.data.data;

  const userLocalData = JSON.stringify({
    auth: {
      apiId: user.id,
      apiToken: user.apiToken,
    },
  });

  localStorage.setItem(LOCALSTORAGE_AUTH_KEY, userLocalData);
}

export async function verifyUsername (store, params) {
  if (params.username < 1) {
    return '';
  }
  const url = '/api/v4/user/auth/verify-username';
  const result = await axios.post(url, {
    username: params.username,
  });

  return result.data.data;
}

export async function verifyDisplayName (store, params) {
  const url = '/api/v4/user/auth/verify-display-name';
  const result = await axios.post(url, {
    displayName: params.displayName,
  });

  return result.data.data;
}

export async function socialAuth (store, params) {
  const url = '/api/v4/user/auth/social';
  const result = await axios.post(url, {
    network: params.auth.network,
    authResponse: params.auth.authResponse,
  });

  const user = result.data.data;

  const userLocalData = JSON.stringify({
    auth: {
      apiId: user.id,
      apiToken: user.apiToken,
    },
  });

  localStorage.setItem(LOCALSTORAGE_AUTH_KEY, userLocalData);
}

export async function appleAuth (store, params) {
  const url = '/api/v4/user/auth/apple';
  const result = await axios.get(url, {
    params: {
      code: params.code,
      name: params.name,
    },
  });

  const user = result.data.data;

  const userLocalData = JSON.stringify({
    auth: {
      apiId: user.id,
      apiToken: user.apiToken,
    },
  });

  localStorage.setItem(LOCALSTORAGE_AUTH_KEY, userLocalData);
}

export function logout (store, options = {}) {
  localStorage.clear();
  const query = options.redirectToLogin === true ? '?redirectToLogin=true' : '';
  window.location.href = `/logout-server${query}`;
}

export async function facebookOrGoogleAuth (store, params) {
  const { network, redirectUrl } = params;
  try {
    await socialLogout(network);
  } catch (e) {} // eslint-disable-line

  try {
    const auth = await socialLogin(network, redirectUrl);

    await store.dispatch('auth:socialAuth', {
      auth,
    });

    setUpAxios();
    await store.dispatch('user:fetch', { forceLoad: true });
  } catch (err) {
    console.error(err); // eslint-disable-line no-console
    // logout the user
    await socialLogout(network);
    store.dispatch('auth:facebookAuth', params);
  }
}
