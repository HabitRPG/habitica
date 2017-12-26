let api = {};

/**
 * @api {post} /api/v3/news/tell-me-later Get latest Bailey announcement in a second moment
 * @apiName TellMeLaterNews
 * @apiGroup News
 *
 *
 * @apiSuccess {Object} data An empty Object
 *
 */
api.tellMeLaterNews = {
  method: 'POST',
  url: '/news/tell-me-later',
  async handler (req, res) {
    const user = req.locals.user;

    user.flags.newStuff = false;
    user.addNotification('NEW_STUFF', {}, true); // seen by default

    await user.save();
    res.respond(200, {});
  },
};

module.exports = api;