import pick from 'lodash/pick';
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
    // As of now only web can track events using this route
    if (req.headers['x-client'] !== 'habitica-web') {
      throw new NotAuthorized('Only habitica.com is allowed to track analytics events.');
    }

    const { user } = res.locals;
    const eventProperties = req.body;

    res.analytics.track(req.params.eventName, {
      user: pick(user, ['preferences', 'registeredThrough']),
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

export default api;
