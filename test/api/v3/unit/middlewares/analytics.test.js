/* eslint-disable global-require */
import {
  generateRes,
  generateReq,
  generateNext,
} from '../../../../helpers/api-unit.helper';
import analyticsService from '../../../../../website/src/libs/api-v3/analyticsService';
import nconf from 'nconf';

describe('analytics middleware', () => {
  let res, req, next;
  let pathToAnalyticsMiddleware = '../../../../../website/src/middlewares/api-v3/analytics';

  beforeEach(() => {
    res = generateRes();
    req = generateReq();
    next = generateNext();
  });

  afterEach(() => {
    // The nconf.get('IS_PROD') occurs when the file is required
    // Since node caches IS_PROD, we have to delete it from the cache
    // to test prod vs non-prod behaviors
    delete require.cache[require.resolve(pathToAnalyticsMiddleware)];
  });

  it('attaches analytics object res.locals', () => {
    let attachAnalytics = require(pathToAnalyticsMiddleware);

    attachAnalytics(req, res, next);

    expect(res.analytics).to.exist;
  });

  it('attaches stubbed methods for non-prod environments', () => {
    sandbox.stub(nconf, 'get').withArgs('IS_PROD').returns(false);
    let attachAnalytics = require(pathToAnalyticsMiddleware);

    attachAnalytics(req, res, next);

    expect(res.analytics.track).to.eql(analyticsService.mockAnalyticsService.track);
    expect(res.analytics.trackPurchase).to.eql(analyticsService.mockAnalyticsService.trackPurchase);
  });

  it('attaches real methods for prod environments', () => {
    sandbox.stub(nconf, 'get').withArgs('IS_PROD').returns(true);

    let attachAnalytics = require(pathToAnalyticsMiddleware);

    attachAnalytics(req, res, next);

    expect(res.analytics.track).to.eql(analyticsService.track);
    expect(res.analytics.trackPurchase).to.eql(analyticsService.trackPurchase);
  });
});
