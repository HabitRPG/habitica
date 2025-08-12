/* eslint-disable global-require */
import nconf from 'nconf';
import requireAgain from 'require-again';
import {
  generateRes,
  generateReq,
  generateNext,
} from '../../../helpers/api-unit.helper';
import * as analyticsService from '../../../../website/server/libs/analyticsService';

describe('analytics middleware', () => {
  let res; let req; let
    next;
  const pathToAnalyticsMiddleware = '../../../../website/server/middlewares/analytics';

  beforeEach(() => {
    res = generateRes();
    req = generateReq();
    next = generateNext();
  });

  it('attaches analytics object to res', () => {
    const attachAnalytics = requireAgain(pathToAnalyticsMiddleware).default;

    attachAnalytics(req, res, next);

    expect(res.analytics).to.exist;
  });

  it('attaches stubbed methods for non-prod environments', () => {
    sandbox.stub(nconf, 'get').withArgs('IS_PROD').returns(false);
    const attachAnalytics = requireAgain(pathToAnalyticsMiddleware).default;

    attachAnalytics(req, res, next);

    expect(res.analytics.track).to.eql(analyticsService.mockAnalyticsService.track);
    expect(res.analytics.trackPurchase).to.eql(analyticsService.mockAnalyticsService.trackPurchase);
  });

  it('attaches real methods for prod environments', () => {
    sandbox.stub(nconf, 'get').withArgs('IS_PROD').returns(true);

    const attachAnalytics = requireAgain(pathToAnalyticsMiddleware).default;

    attachAnalytics(req, res, next);

    expect(res.analytics.track).to.eql(analyticsService.track);
    expect(res.analytics.trackPurchase).to.eql(analyticsService.trackPurchase);
  });
});
