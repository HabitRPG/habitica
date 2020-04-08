import AppleAuth from 'apple-auth';
import nconf from 'nconf';
import jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';
import util from 'util';

const APPLE_PRIVATE_KEY = nconf.get('APPLE_AUTH_PRIVATE_KEY');
const APPLE_AUTH_CLIENT_ID = nconf.get('APPLE_AUTH_CLIENT_ID');
const APPLE_TEAM_ID = nconf.get('APPLE_TEAM_ID');
const APPLE_AUTH_KEY_ID = nconf.get('APPLE_AUTH_KEY_ID');
const BASE_URL = nconf.get('BASE_URL');

const appleAuth = new AppleAuth(JSON.stringify({
  client_id: APPLE_AUTH_CLIENT_ID, // eslint-disable-line camelcase
  team_id: APPLE_TEAM_ID, // eslint-disable-line camelcase
  key_id: APPLE_AUTH_KEY_ID, // eslint-disable-line camelcase
  redirect_uri: `${BASE_URL}/api/v4/user/auth/apple`, // eslint-disable-line camelcase
  scope: 'name email',
}), APPLE_PRIVATE_KEY, 'text');

const APPLE_PUBLIC_KEYS_URL = 'https://appleid.apple.com/auth/keys';

const appleJwksClient = jwksClient({
  jwksUri: APPLE_PUBLIC_KEYS_URL,
});

const getAppleSigningKey = util.promisify(appleJwksClient.getSigningKey);

export async function appleProfile (req) {
  const code = req.body.code ? req.body.code : req.query.code;
  const passedToken = req.body.id_token ? req.body.id_token : req.query.id_token;
  let idToken;

  if (code) {
    const response = await appleAuth.accessToken(code);
    idToken = response.id_token;
  } else if (passedToken) {
    idToken = passedToken;
  }

  const decodedToken = jwt.decode(idToken, { complete: true });
  const signingKey = await getAppleSigningKey(decodedToken.header.kid);
  const applePublicKey = signingKey.getPublicKey();

  const verifiedPayload = await jwt.verify(idToken, applePublicKey, { algorithms: 'RS256' });

  return {
    id: verifiedPayload.sub,
    emails: [{ value: verifiedPayload.email }],
    name: verifiedPayload.name || req.body.name || req.query.name,
  };
}
