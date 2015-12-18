import { authWithHeaders } from '../../middlewares/api-v3/auth';
import Q from 'q';
import _ from 'lodash';
import cron from '../../middlewares/api-v3/cron';
import { model as Group } from '../../models/group';
import {
  NotFound,
  BadRequest,
} from '../../libs/api-v3/errors';

let api = {};

/**
 * @api {get} /groups Get groups
 * @apiVersion 3.0.0
 * @apiName GetGroups
 * @apiGroup Group
 *
 * @apiParam {string} type The type of groups to retrieve. Must be a query string representing a list of values like 'tavern,party'. Possible values are party, privateGuilds, publicGuilds, tavern
 *
 * @apiSuccess {Array} groups An array of the requested groups
 */
api.getGroups = {
  method: 'GET',
  url: '/groups',
  middlewares: [authWithHeaders(), cron],
  handler (req, res, next) {
    let user = res.locals.user;

    req.checkQuery('type', res.t('groupTypesRequired')).notEmpty(); // TODO better validation

    let validationErrors = req.validationErrors();
    if (validationErrors) return next(validationErrors);

    // TODO validate types are acceptable? probably not necessary
    let types = req.query.type.split(',');
    let groupFields = 'name description memberCount balance leader';
    let sort = '-memberCount';
    let queries = [];

    types.forEach(type => {
      switch (type) {
        case 'party':
          queries.push(Group.getGroup(user, 'party', groupFields));
          break;
        case 'privateGuilds':
          queries.push(Group.find({
            type: 'guild',
            privacy: 'private',
            _id: {$in: user.guilds},
          }).select(groupFields).sort(sort).exec()); // TODO isMember
          break;
        case 'publicGuilds':
          queries.push(Group.find({
            type: 'guild',
            privacy: 'public',
          }).select(groupFields).sort(sort).exec()); // TODO use lean? isMember
          break;
        case 'tavern':
          queries.push(Group.getGroup(user, 'habitrpg', groupFields));
          break;
      }
    });

    // If no valid value for type was supplied, return an error
    if (queries.length === 0) return next(new BadRequest(res.t('groupTypesRequired')));

    Q.all(queries) // TODO we would like not to return a single big array but Q doesn't support the funtionality https://github.com/kriskowal/q/issues/328
    .then(results => {
      res.respond(200, _.reduce(results, (m, v) => {
        if (_.isEmpty(v)) return m;
        return m.concat(Array.isArray(v) ? v : [v]);
      }, []));
    })
    .catch(next);
  },
};

/**
 * @api {get} /groups/:groupId Get group
 * @apiVersion 3.0.0
 * @apiName GetGroup
 * @apiGroup Group
 *
 * @apiParam {UUID} groupId The group _id
 *
 * @apiSuccess {Object} group The group object
 */
api.getGroup = {
  method: 'GET',
  url: '/groups/:groupId',
  middlewares: [authWithHeaders(), cron],
  handler (req, res, next) {
    let user = res.locals.user;

    req.checkParams('groupId', res.t('groupIdRequired')).notEmpty();

    let validationErrors = req.validationErrors();
    if (validationErrors) return next(validationErrors);

    Group.getGroup(user, req.params.groupId, true)
    .then(group => {
      if (!group) throw new NotFound(res.t('groupNotFound'));

      res.respond(200, group);
    })
    .catch(next);
  },
};

export default api;
