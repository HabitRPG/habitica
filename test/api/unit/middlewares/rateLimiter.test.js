import nconf from 'nconf';
import { RateLimiterMemory } from 'rate-limiter-flexible';
import requireAgain from 'require-again';
import {
  generateRes,
  generateReq,
  generateNext,
} from '../../../helpers/api-unit.helper';
import { TooManyRequests } from '../../../../website/server/libs/errors';
import apiError from '../../../../website/server/libs/apiError';
import logger from '../../../../website/server/libs/logger';

describe('rateLimiter middleware', () => {
  const pathToRateLimiter = '../../../../website/server/middlewares/rateLimiter';

  let res; let req; let next; let nconfGetStub;

  beforeEach(() => {
    nconfGetStub = sandbox.stub(nconf, 'get');

    nconfGetStub.withArgs('NODE_ENV').returns('test');
    nconfGetStub.withArgs('IS_TEST').returns(true);

    res = generateRes();
    req = generateReq();
    next = generateNext();
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('is disabled when the env var is not defined', () => {
    nconfGetStub.withArgs('RATE_LIMITER_ENABLED').returns(undefined);
    const attachRateLimiter = requireAgain(pathToRateLimiter).default;
    attachRateLimiter(req, res, next);

    expect(next).to.have.been.calledOnce;
    const calledWith = next.getCall(0).args;
    expect(typeof calledWith[0] === 'undefined').to.equal(true);
    expect(res.set).to.not.have.been.called;
  });

  it('is disabled when the env var is an not "true"', () => {
    nconfGetStub.withArgs('RATE_LIMITER_ENABLED').returns('false');
    const attachRateLimiter = requireAgain(pathToRateLimiter).default;
    attachRateLimiter(req, res, next);

    expect(next).to.have.been.calledOnce;
    const calledWith = next.getCall(0).args;
    expect(typeof calledWith[0] === 'undefined').to.equal(true);
    expect(res.set).to.not.have.been.called;
  });

  it('does not throw when there are available points', async () => {
    nconfGetStub.withArgs('RATE_LIMITER_ENABLED').returns('true');
    const attachRateLimiter = requireAgain(pathToRateLimiter).default;
    await attachRateLimiter(req, res, next);

    expect(next).to.have.been.calledOnce;
    const calledWith = next.getCall(0).args;
    expect(typeof calledWith[0] === 'undefined').to.equal(true);

    expect(res.set).to.have.been.calledOnce;
    expect(res.set).to.have.been.calledWithMatch({
      'X-RateLimit-Limit': 30,
      'X-RateLimit-Remaining': 29,
      'X-RateLimit-Reset': sinon.match(Date),
    });
  });

  it('does not throw when an unknown error is thrown by the rate limiter', async () => {
    nconfGetStub.withArgs('RATE_LIMITER_ENABLED').returns('true');
    sandbox.stub(logger, 'error');
    sandbox.stub(RateLimiterMemory.prototype, 'consume')
      .returns(Promise.reject(new Error('Unknown error.')));

    const attachRateLimiter = requireAgain(pathToRateLimiter).default;
    await attachRateLimiter(req, res, next);

    expect(next).to.have.been.calledOnce;
    const calledWith = next.getCall(0).args;
    expect(typeof calledWith[0] === 'undefined').to.equal(true);
    expect(res.set).to.not.have.been.called;

    expect(logger.error).to.be.calledOnce;
    expect(logger.error).to.have.been.calledWithMatch(Error, 'Rate Limiter Error');
  });

  it('throws when there are no available points remaining', async () => {
    nconfGetStub.withArgs('RATE_LIMITER_ENABLED').returns('true');
    const attachRateLimiter = requireAgain(pathToRateLimiter).default;

    // call for 31 times
    for (let i = 0; i < 31; i += 1) {
      await attachRateLimiter(req, res, next); // eslint-disable-line no-await-in-loop
    }

    expect(next).to.have.been.callCount(31);
    const calledWith = next.getCall(30).args;
    expect(calledWith[0].message).to.equal(apiError('clientRateLimited'));
    expect(calledWith[0] instanceof TooManyRequests).to.equal(true);

    expect(res.set).to.have.been.callCount(31);
    expect(res.set).to.have.been.calledWithMatch({
      'Retry-After': sinon.match(Number),
      'X-RateLimit-Limit': 30,
      'X-RateLimit-Remaining': 0,
      'X-RateLimit-Reset': sinon.match(Date),
    });
  });

  it('uses the user id if supplied or the ip address', async () => {
    nconfGetStub.withArgs('RATE_LIMITER_ENABLED').returns('true');
    const attachRateLimiter = requireAgain(pathToRateLimiter).default;

    req.ip = 1;
    await attachRateLimiter(req, res, next);

    req.headers['x-api-user'] = 'user-1';
    await attachRateLimiter(req, res, next);
    await attachRateLimiter(req, res, next);

    // user id an ip are counted as separate sources
    expect(res.set).to.have.been.calledWithMatch({
      'X-RateLimit-Limit': 30,
      'X-RateLimit-Remaining': 28, // 2 calls with user id
      'X-RateLimit-Reset': sinon.match(Date),
    });

    req.headers['x-api-user'] = undefined;
    await attachRateLimiter(req, res, next);
    await attachRateLimiter(req, res, next);

    expect(res.set).to.have.been.calledWithMatch({
      'X-RateLimit-Limit': 30,
      'X-RateLimit-Remaining': 27, // 3 calls with only ip
      'X-RateLimit-Reset': sinon.match(Date),
    });
  });
});
