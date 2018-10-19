import {
  generateRes,
  generateReq,
} from '../../../helpers/api-unit.helper';
import { authWithHeaders as authWithHeadersFactory } from '../../../../website/server/middlewares/auth';
import nconf from 'nconf';
import requireAgain from 'require-again';

describe('auth middleware', () => {
  let res, req, user;
  let pathToAuthMiddleware = '../../../../website/server/middlewares/auth';

  beforeEach(async () => {
    res = generateRes();
    req = generateReq();
    user = await res.locals.user.save();
  });

  describe('auth with headers', () => {
    it('allows to specify a list of user field that we do not want to load', (done) => {
      const authWithHeaders = authWithHeadersFactory({
        userFieldsToExclude: ['items', 'flags', 'auth.timestamps'],
      });

      req.headers['x-api-user'] = user._id;
      req.headers['x-api-key'] = user.apiToken;

      authWithHeaders(req, res, (err) => {
        if (err) return done(err);

        const userToJSON = res.locals.user.toJSON();
        expect(userToJSON.items).to.not.exist;
        expect(userToJSON.flags).to.not.exist;
        expect(userToJSON.auth.timestamps).to.not.exist;
        expect(userToJSON.auth).to.exist;
        expect(userToJSON.notifications).to.exist;
        expect(userToJSON.preferences).to.exist;

        done();
      });
    });
  });

  describe('auth on test servers', () => {
    it('allows all users on non-test servers', (done) => {
      const authWithHeaders = authWithHeadersFactory({
        userFieldsToExclude: [],
      });

      req.headers['x-api-user'] = user._id;
      req.headers['x-api-key'] = user.apiToken;

      authWithHeaders(req, res, (err) => {
        if (err) return done(err);
        done();
      });
    });
    it('doesn\'t allow all users on test servers', async () => {
      sandbox.stub(nconf, 'get').withArgs('IS_TEST_SERVER').returns('true');
      let attachAuth = requireAgain(pathToAuthMiddleware);
      const authWithHeaders = attachAuth.authWithHeaders({
        userFieldsToExclude: [],
      });

      req.headers['x-api-user'] = user._id;
      req.headers['x-api-key'] = user.apiToken;

      await new Promise((resolve, reject) => {
        authWithHeaders(req, res, (err) => {
          if (err.httpCode === 401) {
            resolve();
          }
          reject(err);
        });
      });
    });
  });
});
