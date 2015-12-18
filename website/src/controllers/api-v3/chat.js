import { authWithHeaders } from '../../middlewares/api-v3/auth';
import cron from '../../middlewares/api-v3/cron';
import { model as Group } from '../../models/group';
import {
  NotFound,
} from '../../libs/api-v3/errors';

let api = {};

/**
 * @api {get} /groups/:groupId/chat Get chat messages from a group
 * @apiVersion 3.0.0
 * @apiName GetChat
 * @apiGroup Chat
 *
 * @apiParam {UUID} groupId The group _id
 *
 * @apiSuccess {Array} chat An array of chat messages
 */
api.getChat = {
  method: 'GET',
  url: '/groups/:groupId/chat',
  middlewares: [authWithHeaders(), cron],
  handler (req, res, next) {
    let user = res.locals.user;
    let groupId = req.params.groupId;

    req.checkParams('groupId', res.t('groupIdRequired')).notEmpty();

    let validationErrors = req.validationErrors();
    if (validationErrors) return next(validationErrors);

    let query;

    if (groupId === 'party' || user.party._id === groupId) {
      query = {type: 'party', _id: user.party._id};
    } else if (user.guilds.indexOf(groupId)) {
      query = {type: 'guild', _id: groupId};
    } else {
      query = {type: 'guild', privacy: 'public', _id: groupId};
    }

    Group
    .findOne(query, 'chat').exec()
    .then(group => {
      if (!group) throw new NotFound(res.t('groupNotFound'));

      res.respond(200, group.chat);
    })
    .catch(next);
  },
};

export default api;
