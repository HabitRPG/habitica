import nconf from 'nconf';
import {
 track,
 trackPurchase,
 mockAnalyticsService,
} from '../../libs/api-v3/analyticsService';

function _generateService () {
  let service;

  if (nconf.get('IS_PROD')) {
    service = {
      track,
      trackPurchase,
    };
  } else {
    service = mockAnalyticsService;
  }

  return service;
}

export default function attachAnalytics (req, res, next) {
  res.analytics = _generateService();

  next();
}
