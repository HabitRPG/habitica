import { authWithHeaders } from '../../middlewares/api-v3/auth';
import { model as Tag } from '../../models/tag';
import * as Tasks from '../../models/task';
import {
  NotFound,
} from '../../libs/api-v3/errors';
import _ from 'lodash';

let api = {};

/**
 * @api {post} /tags Create a new tag
 * @apiVersion 3.0.0
 * @apiName CreateTag
 * @apiGroup Tag
 *
 * @apiSuccess {Object} tag The newly created tag
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
 * @api {get} /tag Get an user's tags
 * @apiVersion 3.0.0
 * @apiName GetTags
 * @apiGroup Tag
 *
 * @apiSuccess {Array} tags An array of tag objects
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
 * @api {get} /tags/:tagId Get a tag given its id
 * @apiVersion 3.0.0
 * @apiName GetTag
 * @apiGroup Tag
 *
 * @apiParam {UUID} tagId The tag _id
 *
 * @apiSuccess {object} tag The tag object
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

    let tag = user.tags.id(req.params.tagId);
    if (!tag) throw new NotFound(res.t('tagNotFound'));
    res.respond(200, tag);
  },
};

/**
 * @api {put} /tag/:tagId Update a tag
 * @apiVersion 3.0.0
 * @apiName UpdateTag
 * @apiGroup Tag
 *
 * @apiParam {UUID} tagId The tag _id
 *
 * @apiSuccess {object} tag The updated tag
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

    let tag = user.tags.id(tagId);
    if (!tag) throw new NotFound(res.t('tagNotFound'));

    _.merge(tag, Tag.sanitize(req.body));

    let savedUser = await user.save();
    res.respond(200, savedUser.tags.id(tagId));
  },
};

/**
 * @api {delete} /tag/:tagId Delete a user tag given its id
 * @apiVersion 3.0.0
 * @apiName DeleteTag
 * @apiGroup Tag
 *
 * @apiParam {UUID} tagId The tag _id
 *
 * @apiSuccess {object} empty An empty object
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

    let tag = user.tags.id(req.params.tagId);
    if (!tag) throw new NotFound(res.t('tagNotFound'));
    tag.remove();

    // Remove from all the tasks TODO test
    await Tasks.Task.update({
      userId: user._id,
    }, {
      $pull: {
        tags: tag._id,
      },
    }, {multi: true}).exec();

    await user.save();
    res.respond(200, {});
  },
};

module.exports = api;
