import {
  generateRes,
  generateReq,
  generateNext,
} from '../../../../helpers/api-unit.helper';
import nconf from 'nconf';
import requireAgain from 'require-again';

describe('redirects middleware', () => {
  let res, req, next;
  let pathToRedirectsMiddleware = '../../../../../website/server/middlewares/redirects';

  beforeEach(() => {
    res = generateRes();
    req = generateReq();
    next = generateNext();
  });

  context('forceSSL', () => {
    it('sends http requests to https', () => {
      let nconfStub = sandbox.stub(nconf, 'get');
      nconfStub.withArgs('BASE_URL').returns('https://habitica.com');
      nconfStub.withArgs('IS_PROD').returns(true);
      req.header = sandbox.stub().withArgs('x-forwarded-proto').returns('http');
      req.originalUrl = '/static/front';

      let attachRedirects = requireAgain(pathToRedirectsMiddleware);

      attachRedirects.forceSSL(req, res, next);

      expect(res.redirect).to.be.calledOnce;
      expect(res.redirect).to.be.calledWith('https://habitica.com/static/front');
    });

    it('does not redirect https forwarded requests', () => {
      let nconfStub = sandbox.stub(nconf, 'get');
      nconfStub.withArgs('BASE_URL').returns('https://habitica.com');
      nconfStub.withArgs('IS_PROD').returns(true);
      req.header = sandbox.stub().withArgs('x-forwarded-proto').returns('https');
      req.originalUrl = '/static/front';

      let attachRedirects = requireAgain(pathToRedirectsMiddleware);

      attachRedirects.forceSSL(req, res, next);

      expect(res.redirect).to.be.notCalled;
    });

    it('does not redirect outside of production environments', () => {
      let nconfStub = sandbox.stub(nconf, 'get');
      nconfStub.withArgs('BASE_URL').returns('https://habitica.com');
      nconfStub.withArgs('IS_PROD').returns(false);
      req.header = sandbox.stub().withArgs('x-forwarded-proto').returns('http');
      req.originalUrl = '/static/front';

      let attachRedirects = requireAgain(pathToRedirectsMiddleware);

      attachRedirects.forceSSL(req, res, next);

      expect(res.redirect).to.be.notCalled;
    });

    it('does not redirect if base URL is not https', () => {
      let nconfStub = sandbox.stub(nconf, 'get');
      nconfStub.withArgs('BASE_URL').returns('http://habitica.com');
      nconfStub.withArgs('IS_PROD').returns(true);
      req.header = sandbox.stub().withArgs('x-forwarded-proto').returns('http');
      req.originalUrl = '/static/front';

      let attachRedirects = requireAgain(pathToRedirectsMiddleware);

      attachRedirects.forceSSL(req, res, next);

      expect(res.redirect).to.be.notCalled;
    });
  });

  context('forceHabitica', () => {
    it('sends requests with differing hostname to base URL host', () => {
      let nconfStub = sandbox.stub(nconf, 'get');
      nconfStub.withArgs('BASE_URL').returns('https://habitica.com');
      nconfStub.withArgs('IGNORE_REDIRECT').returns('false');
      nconfStub.withArgs('IS_PROD').returns(true);
      req.hostname = 'www.habitica.com';
      req.method = 'GET';
      req.originalUrl = '/static/front';
      req.url = '/static/front';

      let attachRedirects = requireAgain(pathToRedirectsMiddleware);

      attachRedirects.forceHabitica(req, res, next);

      expect(res.redirect).to.be.calledOnce;
      expect(res.redirect).to.be.calledWith(301, 'https://habitica.com/static/front');
    });

    it('does not redirect outside of production environments', () => {
      let nconfStub = sandbox.stub(nconf, 'get');
      nconfStub.withArgs('BASE_URL').returns('https://habitica.com');
      nconfStub.withArgs('IGNORE_REDIRECT').returns('false');
      nconfStub.withArgs('IS_PROD').returns(false);
      req.hostname = 'www.habitica.com';
      req.method = 'GET';
      req.originalUrl = '/static/front';
      req.url = '/static/front';

      let attachRedirects = requireAgain(pathToRedirectsMiddleware);

      attachRedirects.forceHabitica(req, res, next);

      expect(res.redirect).to.be.notCalled;
    });

    it('does not redirect if env is set to ignore redirection', () => {
      let nconfStub = sandbox.stub(nconf, 'get');
      nconfStub.withArgs('BASE_URL').returns('https://habitica.com');
      nconfStub.withArgs('IGNORE_REDIRECT').returns('true');
      nconfStub.withArgs('IS_PROD').returns(true);
      req.hostname = 'www.habitica.com';
      req.method = 'GET';
      req.originalUrl = '/static/front';
      req.url = '/static/front';

      let attachRedirects = requireAgain(pathToRedirectsMiddleware);

      attachRedirects.forceHabitica(req, res, next);

      expect(res.redirect).to.be.notCalled;
    });

    it('does not redirect if request hostname matches base URL host', () => {
      let nconfStub = sandbox.stub(nconf, 'get');
      nconfStub.withArgs('BASE_URL').returns('https://habitica.com');
      nconfStub.withArgs('IGNORE_REDIRECT').returns('false');
      nconfStub.withArgs('IS_PROD').returns(true);
      req.hostname = 'habitica.com';
      req.method = 'GET';
      req.originalUrl = '/static/front';
      req.url = '/static/front';

      let attachRedirects = requireAgain(pathToRedirectsMiddleware);

      attachRedirects.forceHabitica(req, res, next);

      expect(res.redirect).to.be.notCalled;
    });

    it('does not redirect if request is an API URL', () => {
      let nconfStub = sandbox.stub(nconf, 'get');
      nconfStub.withArgs('BASE_URL').returns('https://habitica.com');
      nconfStub.withArgs('IGNORE_REDIRECT').returns('false');
      nconfStub.withArgs('IS_PROD').returns(true);
      req.hostname = 'www.habitica.com';
      req.method = 'GET';
      req.originalUrl = '/api/v3/challenges';
      req.url = '/api/v3/challenges';

      let attachRedirects = requireAgain(pathToRedirectsMiddleware);

      attachRedirects.forceHabitica(req, res, next);

      expect(res.redirect).to.be.notCalled;
    });

    it('does not redirect if request method is not GET', () => {
      let nconfStub = sandbox.stub(nconf, 'get');
      nconfStub.withArgs('BASE_URL').returns('https://habitica.com');
      nconfStub.withArgs('IGNORE_REDIRECT').returns('false');
      nconfStub.withArgs('IS_PROD').returns(true);
      req.hostname = 'www.habitica.com';
      req.method = 'POST';
      req.originalUrl = '/static/front';
      req.url = '/static/front';

      let attachRedirects = requireAgain(pathToRedirectsMiddleware);

      attachRedirects.forceHabitica(req, res, next);

      expect(res.redirect).to.be.notCalled;
    });
  });
});
