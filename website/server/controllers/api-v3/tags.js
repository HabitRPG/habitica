import { authWithHeaders } from '../../middlewares/auth';
import { model as Tag } from '../../models/tag';
import * as Tasks from '../../models/task';
import {
  NotFound,
} from '../../libs/errors';
import _ from 'lodash';
import { removeFromArray } from '../../libs/collectionManipulators';

/**
 * @apiDefine TagNotFound
 * @apiError (404) {NotFound} TagNotFound The specified tag could not be found.
 */

let api = {};

/**
 * @api {post} /api/v3/tags Create a new tag
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
 * @api {get} /api/v3/tags Get a user's tags
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
 * @apiName GetTag
 * @apiGroup Tag
 *
 * @apiParam {UUID} tagId The tag _id
 *
 * @apiSuccess {Object} data The tag object
 *
 * @apiUse TagNotFound
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
 * @apiName UpdateTag
 * @apiGroup Tag
 *
 * @apiParam {UUID} tagId The tag _id
 *
 * @apiSuccess {Object} data The updated tag
 *
 * @apiUse TagNotFound
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
 * @apiName ReorderTags
 * @apiGroup Tag
 *
 * @apiParam {UUID} tagId Id of the tag to move
 * @apiParam {Number} to Position the tag is moving to
 *
 * @apiSuccess {Object} data An empty object
 *
 * @apiUse TagNotFound
 */
api.reorderTags = {
  method: 'POST',
  url: '/reorder-tags',
  middlewares: [authWithHeaders()],
  async handler (req, res) {
    let user = res.locals.user;

    req.checkBody('to', res.t('toRequired')).notEmpty();
    req.checkBody('tagId', res.t('tagIdRequired')).notEmpty();

    let validationErrors = req.validationErrors();
    if (validationErrors) throw validationErrors;

    let tagIndex = _.findIndex(user.tags, function findTag (tag) {
      return tag.id === req.body.tagId;
    });
    if (tagIndex === -1) throw new NotFound(res.t('tagNotFound'));
    user.tags.splice(req.body.to, 0, user.tags.splice(tagIndex, 1)[0]);

    await user.save();
    res.respond(200, {});
  },
};

/**
 * @api {delete} /api/v3/tag/:tagId Delete a user tag given its id
 * @apiName DeleteTag
 * @apiGroup Tag
 *
 * @apiParam {UUID} tagId The tag _id
 *
 * @apiSuccess {Object} data An empty object
 *
 * @apiUse TagNotFound
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
