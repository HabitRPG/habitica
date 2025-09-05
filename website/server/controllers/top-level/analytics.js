import {
  NotAuthorized,
} from '../../libs/errors';
import {
  authWithHeaders,
} from '../../middlewares/auth';

const api = {};

/**
 * @apiIgnore Analytics are considered part of the private API
 * @api {post} /analytics/track/:eventName Track a generic analytics event
 * @apiName AnalyticsTrack
 * @apiGroup Analytics
 *
 * @apiSuccess {Object} data An empty object
 * */
api.trackEvent = {
  method: 'POST',
  url: '/analytics/track/:eventName',
  // we authenticate these requests to make sure they actually came from a real user
  middlewares: [authWithHeaders()],
  async handler (req, res) {
    if (req.headers['x-client'] !== 'habitica-web'
      && req.headers['x-client'] !== 'habitica-ios'
      && req.headers['x-client'] !== 'habitica-android') {
      throw new NotAuthorized('Only official clients are allowed to track analytics events.');
    }

    const { user } = res.locals;
    const eventProperties = req.body;

    res.analytics.track(req.params.eventName, {
      user,
      uuid: user._id,
      headers: req.headers,
      category: 'behavior',
      ...eventProperties,
    });

    // not using res.respond
    // because we don't want to send back notifications and other user-related data
    res.status(200).send({});
  },
};

api.updateUserProperties = {
  method: 'POST',
  url: '/analytics/update',
  // we authenticate these requests to make sure they actually came from a real user
  middlewares: [authWithHeaders()],
  async handler (req, res) {
    if (req.headers['x-client'] !== 'habitica-web'
      && req.headers['x-client'] !== 'habitica-ios'
      && req.headers['x-client'] !== 'habitica-android') {
      throw new NotAuthorized('Only official clients are allowed to track analytics events.');
    }

    const { user } = res.locals;
    const properties = req.body;

    res.analytics.track(req.params.eventName, {
      user,
      uuid: user._id,
      properties,
    });

    // not using res.respond
    // because we don't want to send back notifications and other user-related data
    res.status(200).send({});
  },
};

export default api;
