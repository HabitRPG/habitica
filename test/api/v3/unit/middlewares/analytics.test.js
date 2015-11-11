import {
  generateRes,
  generateReq,
  generateNext,
} from '../../../../helpers/api-unit.helper';
import analyticsService from '../../../../../website/src/libs/api-v3/analyticsService'
import nconf from 'nconf';
import attachAnalytics from '../../../../../website/src/middlewares/api-v3/analytics';

describe('analytics middleware', function() {
  let res, req, next;

  beforeEach(() => {
    res = generateRes();
    req = generateReq();
    next = generateNext();
  });

  it('attaches analytics object res.locals', function() {
    attachAnalytics(req, res, next);

    expect(res.analytics).to.exist;
  });

  context('non-prod', () => {
    let old_is_prod = nconf.get('IS_PROD');

    beforeEach(() => {
      nconf.set('IS_PROD', false);
    });

    afterEach(() => {
      nconf.set('IS_PROD', old_is_prod);
    });

    it('attaches stubbed methods', () => {
      attachAnalytics(req, res, next);

      expect(res.analytics.track).to.eql(analyticsService.mockAnalyticsService.track);
      expect(res.analytics.trackPurchase).to.eql(analyticsService.mockAnalyticsService.trackPurchase);
    });
  });

  context('prod', () => {
    let old_is_prod = nconf.get('IS_PROD');

    beforeEach(() => {
      nconf.set('IS_PROD', true);
    });

    afterEach(() => {
      nconf.set('IS_PROD', old_is_prod);
    });

    it('attaches stubbed methods', () => {
      attachAnalytics(req, res, next);

      expect(res.analytics.track).to.eql(analyticsService.track);
      expect(res.analytics.trackPurchase).to.eql(analyticsService.trackPurchase);
    });
  });
});

