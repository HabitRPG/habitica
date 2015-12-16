let api = {};

/**
 * @api {get} /groups/:groupId Get a group by its id
 * @apiVersion 3.0.0
 * @apiName GetGroup
 * @apiGroup Group
 *
 * @apiSuccess {Object} group The group object
 */
api.getGroup = {
  method: 'GET',
  url: '/groups/:groupId',
  middlewares: [authWithHeaders()],
  handler (req, res, next) {
    // ...
  },
};

export default api;
