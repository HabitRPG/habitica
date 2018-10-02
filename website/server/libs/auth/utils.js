import nconf from 'nconf';
import shortid from 'short-uuid';

import { NotAuthorized } from '../errors';

const COMMUNITY_MANAGER_EMAIL = nconf.get('EMAILS:COMMUNITY_MANAGER_EMAIL');
const translator = shortid('0123456789abcdefghijklmnopqrstuvwxyz');

function generateUsername () {
  return `hb-${translator.new()}`;
}

function loginRes (user, req, res) {
  if (user.auth.blocked) throw new NotAuthorized(res.t('accountSuspended', {communityManagerEmail: COMMUNITY_MANAGER_EMAIL, userId: user._id}));

  const responseData = {
    id: user._id,
    apiToken: user.apiToken,
    newUser: user.newUser || false,
    username: user.auth.local.username,
  };

  return res.respond(200, responseData);
}

module.exports = {
  generateUsername,
  loginRes,
};
