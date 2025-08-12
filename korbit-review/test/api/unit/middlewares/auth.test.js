import nconf from 'nconf';
import requireAgain from 'require-again';
import {
  generateRes,
  generateReq,
} from '../../../helpers/api-unit.helper';

const authPath = '../../../../website/server/middlewares/auth';

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
      const authWithHeadersFactory = requireAgain(authPath).authWithHeaders;
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
      const authWithHeadersFactory = requireAgain(authPath).authWithHeaders;
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

    it('errors with InvalidCredentialsError and code when token is wrong', done => {
      const authWithHeadersFactory = requireAgain(authPath).authWithHeaders;
      const authWithHeaders = authWithHeadersFactory({ userFieldsToExclude: [] });

      req.headers['x-api-user'] = user._id;
      req.headers['x-api-key'] = 'totally-wrong-token';

      authWithHeaders(req, res, err => {
        expect(err).to.exist;
        expect(err.name).to.equal('InvalidCredentialsError');
        expect(err.code).to.equal('invalid_credentials');
        expect(err.message).to.equal(res.t('invalidCredentials'));
        return done();
      });
    });

    describe('when ENFORCE_CLIENT_HEADER is true', () => {
      let authFactory;

      beforeEach(() => {
        sandbox.stub(nconf, 'get').withArgs('ENFORCE_CLIENT_HEADER').returns('true');
        authFactory = requireAgain(authPath).authWithHeaders;
      });

      it('errors with missingClientHeader when x-client header is not present', done => {
        const authWithHeaders = authFactory({ userFieldsToExclude: [] });

        req.headers['x-api-user'] = user._id;
        req.headers['x-api-key'] = user;
        authWithHeaders(req, res, err => {
          expect(err).to.exist;
          expect(err.name).to.equal('BadRequest');
          expect(err.message).to.equal(res.t('missingClientHeader'));
          return done();
        });
      });

      it('allows request to pass when x-client header is present', done => {
        const authWithHeaders = authFactory({ userFieldsToExclude: [] });

        req.headers['x-api-user'] = user._id;
        req.headers['x-api-key'] = user.apiToken;
        req.headers['x-client'] = 'habitica-web';

        authWithHeaders(req, res, err => {
          if (err) return done(err);
          expect(res.locals.user).to.exist;
          return done();
        });
      });
    });
  });
});
