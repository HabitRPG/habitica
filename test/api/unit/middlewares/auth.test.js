import {
  generateRes,
  generateReq,
} from '../../../helpers/api-unit.helper';
import { authWithHeaders as authWithHeadersFactory } from '../../../../website/server/middlewares/auth';

describe('auth middleware', () => {
  let res; let req; let
    user;

  beforeEach(async () => {
    res = generateRes();
    req = generateReq();
    user = await res.locals.user.save();
  });

  describe('auth with headers', () => {
    it('allows to specify a list of user field that we do not want to load', done => {
      const authWithHeaders = authWithHeadersFactory({
        userFieldsToExclude: ['items'],
      });

      req.headers['x-api-user'] = user._id;
      req.headers['x-api-key'] = user.apiToken;

      authWithHeaders(req, res, err => {
        if (err) return done(err);

        const userToJSON = res.locals.user.toJSON();
        expect(userToJSON.items).to.not.exist;
        expect(userToJSON.auth).to.exist;

        return done();
      });
    });

    it('makes sure some fields are always included', done => {
      const authWithHeaders = authWithHeadersFactory({
        userFieldsToExclude: [
          'items', 'auth.timestamps',
          'preferences', 'notifications', '_id', 'flags', 'auth', // these are always loaded
        ],
      });

      req.headers['x-api-user'] = user._id;
      req.headers['x-api-key'] = user.apiToken;

      authWithHeaders(req, res, err => {
        if (err) return done(err);

        const userToJSON = res.locals.user.toJSON();
        expect(userToJSON.items).to.not.exist;
        expect(userToJSON.auth.timestamps).to.exist;
        expect(userToJSON.auth).to.exist;
        expect(userToJSON.notifications).to.exist;
        expect(userToJSON.preferences).to.exist;
        expect(userToJSON._id).to.exist;
        expect(userToJSON.flags).to.exist;

        return done();
      });
    });
  });
});
