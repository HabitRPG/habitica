import nconf from 'nconf';
import requireAgain from 'require-again';
import {
  generateRes,
  generateReq,
  generateNext,
} from '../../../helpers/api-unit.helper';

describe('redirects middleware', () => {
  let res; let req; let
    next;
  const pathToRedirectsMiddleware = '../../../../website/server/middlewares/redirects';

  beforeEach(() => {
    res = generateRes();
    req = generateReq();
    next = generateNext();
  });

  context('forceSSL', () => {
    it('sends http requests to https', () => {
      const nconfStub = sandbox.stub(nconf, 'get');
      nconfStub.withArgs('BASE_URL').returns('https://habitica.com');
      nconfStub.withArgs('IS_PROD').returns(true);
      req.protocol = 'http';
      req.originalUrl = '/static/front';

      const attachRedirects = requireAgain(pathToRedirectsMiddleware);

      attachRedirects.forceSSL(req, res, next);

      expect(res.redirect).to.be.calledOnce;
      expect(res.redirect).to.be.calledWith('https://habitica.com/static/front');
    });

    it('does not redirect https forwarded requests', () => {
      const nconfStub = sandbox.stub(nconf, 'get');
      nconfStub.withArgs('BASE_URL').returns('https://habitica.com');
      nconfStub.withArgs('IS_PROD').returns(true);
      req.protocol = 'https';
      req.originalUrl = '/static/front';

      const attachRedirects = requireAgain(pathToRedirectsMiddleware);

      attachRedirects.forceSSL(req, res, next);

      expect(res.redirect).to.have.not.been.called;
    });

    it('does not redirect outside of production environments', () => {
      const nconfStub = sandbox.stub(nconf, 'get');
      nconfStub.withArgs('BASE_URL').returns('https://habitica.com');
      nconfStub.withArgs('IS_PROD').returns(false);
      req.protocol = 'http';
      req.originalUrl = '/static/front';

      const attachRedirects = requireAgain(pathToRedirectsMiddleware);

      attachRedirects.forceSSL(req, res, next);

      expect(res.redirect).to.have.not.been.called;
    });

    it('does not redirect if base URL is not https', () => {
      const nconfStub = sandbox.stub(nconf, 'get');
      nconfStub.withArgs('BASE_URL').returns('http://habitica.com');
      nconfStub.withArgs('IS_PROD').returns(true);
      req.protocol = 'http';
      req.originalUrl = '/static/front';

      const attachRedirects = requireAgain(pathToRedirectsMiddleware);

      attachRedirects.forceSSL(req, res, next);

      expect(res.redirect).to.have.not.been.called;
    });

    it('does not redirect if passed skip ssl request param is passed with corrrect key', () => {
      const nconfStub = sandbox.stub(nconf, 'get');
      nconfStub.withArgs('BASE_URL').returns('https://habitica.com');
      nconfStub.withArgs('IS_PROD').returns(true);
      nconfStub.withArgs('SKIP_SSL_CHECK_KEY').returns('test-key');

      req.protocol = 'http';
      req.originalUrl = '/static/front';
      req.query.skipSSLCheck = 'test-key';

      const attachRedirects = requireAgain(pathToRedirectsMiddleware);
      attachRedirects.forceSSL(req, res, next);

      expect(res.redirect).to.have.not.been.called;
    });

    it('does redirect if skip ssl request param is passed with incorrrect key', () => {
      const nconfStub = sandbox.stub(nconf, 'get');
      nconfStub.withArgs('BASE_URL').returns('https://habitica.com');
      nconfStub.withArgs('IS_PROD').returns(true);
      nconfStub.withArgs('SKIP_SSL_CHECK_KEY').returns('test-key');

      req.protocol = 'http';
      req.originalUrl = '/static/front?skipSSLCheck=INVALID';
      req.query.skipSSLCheck = 'INVALID';

      const attachRedirects = requireAgain(pathToRedirectsMiddleware);
      attachRedirects.forceSSL(req, res, next);

      expect(res.redirect).to.be.calledOnce;
      expect(res.redirect).to.be.calledWith('https://habitica.com/static/front?skipSSLCheck=INVALID');
    });

    it('does redirect if skip ssl check key is not set', () => {
      const nconfStub = sandbox.stub(nconf, 'get');
      nconfStub.withArgs('BASE_URL').returns('https://habitica.com');
      nconfStub.withArgs('IS_PROD').returns(true);
      nconfStub.withArgs('SKIP_SSL_CHECK_KEY').returns(null);

      req.protocol = 'http';
      req.originalUrl = '/static/front';
      req.query.skipSSLCheck = 'INVALID';

      const attachRedirects = requireAgain(pathToRedirectsMiddleware);
      attachRedirects.forceSSL(req, res, next);

      expect(res.redirect).to.be.calledOnce;
      expect(res.redirect).to.be.calledWith('https://habitica.com/static/front');
    });
  });

  context('forceHabitica', () => {
    it('sends requests with differing hostname to base URL host', () => {
      const nconfStub = sandbox.stub(nconf, 'get');
      nconfStub.withArgs('BASE_URL').returns('https://habitica.com');
      nconfStub.withArgs('IGNORE_REDIRECT').returns('false');
      nconfStub.withArgs('IS_PROD').returns(true);
      req.hostname = 'www.habitica.com';
      req.method = 'GET';
      req.originalUrl = '/static/front';
      req.url = '/static/front';

      const attachRedirects = requireAgain(pathToRedirectsMiddleware);

      attachRedirects.forceHabitica(req, res, next);

      expect(res.redirect).to.be.calledOnce;
      expect(res.redirect).to.be.calledWith(301, 'https://habitica.com/static/front');
    });

    it('does not redirect outside of production environments', () => {
      const nconfStub = sandbox.stub(nconf, 'get');
      nconfStub.withArgs('BASE_URL').returns('https://habitica.com');
      nconfStub.withArgs('IGNORE_REDIRECT').returns('false');
      nconfStub.withArgs('IS_PROD').returns(false);
      req.hostname = 'www.habitica.com';
      req.method = 'GET';
      req.originalUrl = '/static/front';
      req.url = '/static/front';

      const attachRedirects = requireAgain(pathToRedirectsMiddleware);

      attachRedirects.forceHabitica(req, res, next);

      expect(res.redirect).to.have.not.been.called;
    });

    it('does not redirect if env is set to ignore redirection', () => {
      const nconfStub = sandbox.stub(nconf, 'get');
      nconfStub.withArgs('BASE_URL').returns('https://habitica.com');
      nconfStub.withArgs('IGNORE_REDIRECT').returns('true');
      nconfStub.withArgs('IS_PROD').returns(true);
      req.hostname = 'www.habitica.com';
      req.method = 'GET';
      req.originalUrl = '/static/front';
      req.url = '/static/front';

      const attachRedirects = requireAgain(pathToRedirectsMiddleware);

      attachRedirects.forceHabitica(req, res, next);

      expect(res.redirect).to.have.not.been.called;
    });

    it('does not redirect if request hostname matches base URL host', () => {
      const nconfStub = sandbox.stub(nconf, 'get');
      nconfStub.withArgs('BASE_URL').returns('https://habitica.com');
      nconfStub.withArgs('IGNORE_REDIRECT').returns('false');
      nconfStub.withArgs('IS_PROD').returns(true);
      req.hostname = 'habitica.com';
      req.method = 'GET';
      req.originalUrl = '/static/front';
      req.url = '/static/front';

      const attachRedirects = requireAgain(pathToRedirectsMiddleware);

      attachRedirects.forceHabitica(req, res, next);

      expect(res.redirect).to.have.not.been.called;
    });

    it('does not redirect if request is an API URL', () => {
      const nconfStub = sandbox.stub(nconf, 'get');
      nconfStub.withArgs('BASE_URL').returns('https://habitica.com');
      nconfStub.withArgs('IGNORE_REDIRECT').returns('false');
      nconfStub.withArgs('IS_PROD').returns(true);
      req.hostname = 'www.habitica.com';
      req.method = 'GET';
      req.originalUrl = '/api/v3/challenges';
      req.url = '/api/v3/challenges';

      const attachRedirects = requireAgain(pathToRedirectsMiddleware);

      attachRedirects.forceHabitica(req, res, next);

      expect(res.redirect).to.have.not.been.called;
    });

    it('does not redirect if request method is not GET', () => {
      const nconfStub = sandbox.stub(nconf, 'get');
      nconfStub.withArgs('BASE_URL').returns('https://habitica.com');
      nconfStub.withArgs('IGNORE_REDIRECT').returns('false');
      nconfStub.withArgs('IS_PROD').returns(true);
      req.hostname = 'www.habitica.com';
      req.method = 'POST';
      req.originalUrl = '/static/front';
      req.url = '/static/front';

      const attachRedirects = requireAgain(pathToRedirectsMiddleware);

      attachRedirects.forceHabitica(req, res, next);

      expect(res.redirect).to.have.not.been.called;
    });
  });
});
