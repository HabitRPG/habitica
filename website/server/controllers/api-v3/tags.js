import { authWithHeaders } from '../../middlewares/api-v3/auth';
import { model as Tag } from '../../models/tag';
import * as Tasks from '../../models/task';
import {
  NotFound,
} from '../../libs/api-v3/errors';
import _ from 'lodash';
import { removeFromArray } from '../../libs/api-v3/collectionManipulators';

let api = {};

/**
 * @api {post} /api/v3/tags Create a new tag
 * @apiVersion 3.0.0
 * @apiName CreateTag
 * @apiGroup Tag
 *
 * @apiSuccess {Object} data The newly created tag
 */
api.createTag = {
  method: 'POST',
  url: '/tags',
  middlewares: [authWithHeaders()],
  async handler (req, res) {
    let user = res.locals.user;

    user.tags.push(Tag.sanitize(req.body));
    let savedUser = await user.save();

    let l = savedUser.tags.length;
    let tag = savedUser.tags[l - 1];
    res.respond(201, tag);
  },
};

/**
 * @api {get} /api/v3/tag Get a user's tags
 * @apiVersion 3.0.0
 * @apiName GetTags
 * @apiGroup Tag
 *
 * @apiSuccess {Array} data An array of tags
 */
api.getTags = {
  method: 'GET',
  url: '/tags',
  middlewares: [authWithHeaders()],
  async handler (req, res) {
    let user = res.locals.user;
    res.respond(200, user.tags);
  },
};

/**
 * @api {get} /api/v3/tags/:tagId Get a tag given its id
 * @apiVersion 3.0.0
 * @apiName GetTag
 * @apiGroup Tag
 *
 * @apiParam {UUID} tagId The tag _id
 *
 * @apiSuccess {object} data The tag object
 */
api.getTag = {
  method: 'GET',
  url: '/tags/:tagId',
  middlewares: [authWithHeaders()],
  async handler (req, res) {
    let user = res.locals.user;

    req.checkParams('tagId', res.t('tagIdRequired')).notEmpty().isUUID();

    let validationErrors = req.validationErrors();
    if (validationErrors) throw validationErrors;

    let tag = _.find(user.tags, {id: req.params.tagId});
    if (!tag) throw new NotFound(res.t('tagNotFound'));
    res.respond(200, tag);
  },
};

/**
 * @api {put} /api/v3/tag/:tagId Update a tag
 * @apiVersion 3.0.0
 * @apiName UpdateTag
 * @apiGroup Tag
 *
 * @apiParam {UUID} tagId The tag _id
 *
 * @apiSuccess {object} data The updated tag
 */
api.updateTag = {
  method: 'PUT',
  url: '/tags/:tagId',
  middlewares: [authWithHeaders()],
  async handler (req, res) {
    let user = res.locals.user;

    req.checkParams('tagId', res.t('tagIdRequired')).notEmpty().isUUID();

    let tagId = req.params.tagId;

    let validationErrors = req.validationErrors();
    if (validationErrors) throw validationErrors;

    let tag = _.find(user.tags, {id: tagId});
    if (!tag) throw new NotFound(res.t('tagNotFound'));

    _.merge(tag, Tag.sanitize(req.body));

    let savedUser = await user.save();
    res.respond(200, _.find(savedUser.tags, {id: tagId}));
  },
};

/**
 * @api {post} /api/v3/reorder-tags Reorder a tag
 * @apiVersion 3.0.0
 * @apiName ReorderTags
 * @apiGroup Tag
 *
 * @apiParam {from} number Position the tag is moving from
 * @apiParam {to} number Position the tag is moving to
 *
 * @apiSuccess {object} data An empty object
 */
api.reorderTags = {
  method: 'POST',
  url: '/reorder-tags',
  middlewares: [authWithHeaders()],
  async handler (req, res) {
    let user = res.locals.user;

    req.checkBody('from', res.t('fromRequired')).notEmpty();
    req.checkBody('to', res.t('toRequired')).notEmpty();

    let validationErrors = req.validationErrors();
    if (validationErrors) throw validationErrors;

    user.tags.splice(req.body.to, 0, user.tags.splice(req.body.from, 1)[0]);

    let savedUser = await user.save();
    res.respond(200, {});
  },
};

/**
 * @api {delete} /api/v3/tag/:tagId Delete a user tag given its id
 * @apiVersion 3.0.0
 * @apiName DeleteTag
 * @apiGroup Tag
 *
 * @apiParam {UUID} tagId The tag _id
 *
 * @apiSuccess {object} data An empty object
 */
api.deleteTag = {
  method: 'DELETE',
  url: '/tags/:tagId',
  middlewares: [authWithHeaders()],
  async handler (req, res) {
    let user = res.locals.user;

    req.checkParams('tagId', res.t('tagIdRequired')).notEmpty().isUUID();

    let validationErrors = req.validationErrors();
    if (validationErrors) throw validationErrors;

    let tag = removeFromArray(user.tags, { id: req.params.tagId });
    if (!tag) throw new NotFound(res.t('tagNotFound'));

    // Remove from all the tasks TODO test
    await Tasks.Task.update({
      userId: user._id,
    }, {
      $pull: {
        tags: tag.id,
      },
    }, {multi: true}).exec();

    await user.save();
    res.respond(200, {});
  },
};

module.exports = api;
