import nconf from 'nconf';
import {
 track,
 trackPurchase,
 mockAnalyticsService,
} from '../libs/analyticsService';

let service;

if (nconf.get('IS_PROD')) {
  service = {
    track,
    trackPurchase,
  };
} else {
  service = mockAnalyticsService;
}

module.exports = function attachAnalytics (req, res, next) {
  res.analytics = service;

  next();
};
