import hello from 'hellojs';

hello.init({
  facebook: process.env.FACEBOOK_KEY, // eslint-disable-line
  // windows: WINDOWS_CLIENT_ID,
  google: process.env.GOOGLE_CLIENT_ID, // eslint-disable-line
});

export async function socialLogin (network, redirectUrl) {
  const result = await hello(network).login({
    scope: 'email',
    redirect_uri: redirectUrl, // eslint-disable-line camelcase
  });
  return result;
}

export async function socialLogout (network) {
  const result = await hello(network).logout();
  return result;
}
