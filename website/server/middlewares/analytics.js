import {
  getAnalyticsServiceByEnvironment,
} from '../libs/analyticsService';

const service = getAnalyticsServiceByEnvironment();

export default function attachAnalytics (req, res, next) {
  res.analytics = service;

  next();
}
