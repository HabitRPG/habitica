/* eslint-disable global-require */
import {
  generateRes,
  generateReq,
  generateNext,
} from '../../../../helpers/api-unit.helper';
import analyticsService from '../../../../../website/server/libs/analyticsService';
import nconf from 'nconf';
import requireAgain from 'require-again';

describe('analytics middleware', () => {
  let res, req, next;
  let pathToAnalyticsMiddleware = '../../../../../website/server/middlewares/analytics';

  beforeEach(() => {
    res = generateRes();
    req = generateReq();
    next = generateNext();
  });

  it('attaches analytics object res.locals', () => {
    let attachAnalytics = requireAgain(pathToAnalyticsMiddleware);

    attachAnalytics(req, res, next);

    expect(res.analytics).to.exist;
  });

  it('attaches stubbed methods for non-prod environments', () => {
    sandbox.stub(nconf, 'get').withArgs('IS_PROD').returns(false);
    let attachAnalytics = requireAgain(pathToAnalyticsMiddleware);

    attachAnalytics(req, res, next);

    expect(res.analytics.track).to.eql(analyticsService.mockAnalyticsService.track);
    expect(res.analytics.trackPurchase).to.eql(analyticsService.mockAnalyticsService.trackPurchase);
  });

  it('attaches real methods for prod environments', () => {
    sandbox.stub(nconf, 'get').withArgs('IS_PROD').returns(true);

    let attachAnalytics = requireAgain(pathToAnalyticsMiddleware);

    attachAnalytics(req, res, next);

    expect(res.analytics.track).to.eql(analyticsService.track);
    expect(res.analytics.trackPurchase).to.eql(analyticsService.trackPurchase);
  });
});
