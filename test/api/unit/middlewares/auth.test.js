import {
  generateRes,
  generateReq,
} from '../../../helpers/api-unit.helper';
import { authWithHeaders as authWithHeadersFactory } from '../../../../website/server/middlewares/auth';

describe('auth middleware', () => {
  let res, req, user;

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
});
