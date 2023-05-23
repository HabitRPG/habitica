import _ from 'lodash';
import find from 'lodash/find';
import { authWithHeaders } from '../../middlewares/auth';
import { model as Tag } from '../../models/tag';
import * as Tasks from '../../models/task';
import {
  NotFound,
} from '../../libs/errors';

/**
 * @apiDefine TagNotFound
 * @apiError (404) {NotFound} TagNotFound The specified tag could not be found.
 */

/**
 * @apiDefine InvalidUUID
 * @apiError (400) {BadRequest} InvalidRequestParameters "tagId" must be a valid UUID
 *                                                       corresponding to a tag
 *                                                       belonging to the user.
 */

const api = {};

/**
 * @api {post} /api/v3/tags Create a new tag
 * @apiName CreateTag
 * @apiGroup Tag
 *
 * @apiParam (Body) {string} name The name of the tag to be added.
 *
 * @apiParamExample {json} Example body:
 * {"name":"practicetag"}
 *
 * @apiSuccess (201) {Object} data The newly created tag
 *
 * @apiSuccessExample {json} Example return:
 * {"success":true,"data":{"name":"practicetag","id":"8bc0afbf-ab8e-49a4-982d-67a40557ed1a"},
 * "notifications":[]}
 */
api.createTag = {
  method: 'POST',
  url: '/tags',
  middlewares: [authWithHeaders()],
  async handler (req, res) {
    const { user } = res.locals;

    user.tags.push(Tag.sanitize(req.body));
    const savedUser = await user.save();

    const l = savedUser.tags.length;
    const tag = savedUser.tags[l - 1];
    res.respond(201, tag);
  },
};

/**
 * @api {get} /api/v3/tags Get a user's tags
 * @apiName GetTags
 * @apiGroup Tag
 *
 * @apiSuccess {Array} data An array of tags
 *
 * @apiSuccessExample {json} Example return:
 * {"success":true,"data":[{"name":"Work",
 * "id":"3d5d324d-a042-4d5f-872e-0553e228553e"},
 * {"name":"apitester","challenge":"true","id":"f23c12f2-5830-4f15-9c36-e17fd729a812"},
 * {"name":"practicetag","id":"8bc0afbf-ab8e-49a4-982d-67a40557ed1a"}],"notifications":[]}
 */
api.getTags = {
  method: 'GET',
  url: '/tags',
  middlewares: [authWithHeaders()],
  async handler (req, res) {
    const { user } = res.locals;
    res.respond(200, user.tags);
  },
};

/**
 * @api {get} /api/v3/tags/:tagId Get a tag
 * @apiName GetTag
 * @apiGroup Tag
 *
 * @apiParam (Path) {UUID} tagId The tag _id
 *
 * @apiSuccess {Object} data The tag object
 *
 * @apiSuccessExample {json} Example return:
 * {"success":true,"data":{"name":"practicetag",
 * "id":"8bc0afbf-ab8e-49a4-982d-67a40557ed1a"},"notifications":[]}
 *
 * @apiUse TagNotFound
 * @apiUSe InvalidUUID
 */
api.getTag = {
  method: 'GET',
  url: '/tags/:tagId',
  middlewares: [authWithHeaders()],
  async handler (req, res) {
    const { user } = res.locals;

    req.checkParams('tagId', res.t('tagIdRequired')).notEmpty().isUUID();

    const validationErrors = req.validationErrors();
    if (validationErrors) throw validationErrors;

    const tag = _.find(user.tags, { id: req.params.tagId });
    if (!tag) throw new NotFound(res.t('tagNotFound'));
    res.respond(200, tag);
  },
};

/**
 * @api {put} /api/v3/tags/:tagId Update a tag
 * @apiName UpdateTag
 * @apiGroup Tag
 *
 * @apiParam (Path) {UUID} tagId The tag _id
 * @apiParam (Body) {string} name The new name of the tag.
 *
 * @apiParamExample {json} Example body:
 * {"name":"prac-tag"}
 *
 * @apiSuccess {Object} data The updated tag
 *
 * @apiSuccessExample {json} Example result:
 * {"success":true,"data":{"name":"practice-tag",
 * "id":"8bc0afbf-ab8e-49a4-982d-67a40557ed1a"},"notifications":[]}
 *
 * @apiUse TagNotFound
 * @apiUSe InvalidUUID
 */
api.updateTag = {
  method: 'PUT',
  url: '/tags/:tagId',
  middlewares: [authWithHeaders()],
  async handler (req, res) {
    const { user } = res.locals;

    req.checkParams('tagId', res.t('tagIdRequired')).notEmpty().isUUID();

    const { tagId } = req.params;

    const validationErrors = req.validationErrors();
    if (validationErrors) throw validationErrors;

    const tag = _.find(user.tags, { id: tagId });
    if (!tag) throw new NotFound(res.t('tagNotFound'));

    _.merge(tag, Tag.sanitize(req.body));

    const savedUser = await user.save();
    res.respond(200, _.find(savedUser.tags, { id: tagId }));
  },
};

/**
 * @api {post} /api/v3/reorder-tags Reorder a tag
 * @apiName ReorderTags
 * @apiGroup Tag
 *
 * @apiParam (Body) {UUID} tagId Id of the tag to move
 * @apiParam (Body) {Number} to Position the tag is moving to
 *
 * @apiParamExample {json} Example request:
 * {"tagId":"c6855fae-ca15-48af-a88b-86d0c65ead47","to":0}
 *
 * @apiSuccess {Object} data An empty object
 *
 * @apiSuccessExample {json} Example return:
 * {"success":true,"data":{},"notifications":[]}
 *
 * @apiUse TagNotFound
 */
api.reorderTags = {
  method: 'POST',
  url: '/reorder-tags',
  middlewares: [authWithHeaders()],
  async handler (req, res) {
    const { user } = res.locals;

    req.checkBody('to', res.t('toRequired')).notEmpty();
    req.checkBody('tagId', res.t('tagIdRequired')).notEmpty();

    const validationErrors = req.validationErrors();
    if (validationErrors) throw validationErrors;

    const tagIndex = _.findIndex(user.tags, tag => tag.id === req.body.tagId);
    if (tagIndex === -1) throw new NotFound(res.t('tagNotFound'));

    const removedItem = user.tags.splice(tagIndex, 1)[0];

    user.tags.splice(req.body.to, 0, removedItem);

    await user.save();
    res.respond(200, {});
  },
};

/**
 * @api {delete} /api/v3/tags/:tagId Delete a user tag
 * @apiName DeleteTag
 * @apiGroup Tag
 *
 * @apiParam (Path) {UUID} tagId The tag _id
 *
 * @apiSuccess {Object} data An empty object
 *
 * @apiSuccessExample {jsom} Example return:
 * {"success":true,"data":{},"notifications":[]}
 *
 * @apiUse TagNotFound
 * @apiUSe InvalidUUID
 */
api.deleteTag = {
  method: 'DELETE',
  url: '/tags/:tagId',
  middlewares: [authWithHeaders()],
  async handler (req, res) {
    const { user } = res.locals;

    req.checkParams('tagId', res.t('tagIdRequired')).notEmpty().isUUID();

    const validationErrors = req.validationErrors();
    if (validationErrors) throw validationErrors;

    const tagFound = find(user.tags, tag => tag.id === req.params.tagId);
    if (!tagFound) throw new NotFound(res.t('tagNotFound'));

    await user.updateOne({
      $pull: { tags: { id: tagFound.id } },
    }).exec();

    // Update the user version field manually,
    // it cannot be updated in the pre update hook
    // See https://github.com/HabitRPG/habitica/pull/9321#issuecomment-354187666 for more info
    user._v += 1;

    // Remove from all the tasks TODO test
    await Tasks.Task.updateMany({
      userId: user._id,
    }, {
      $pull: {
        tags: tagFound.id,
      },
    }).exec();

    res.respond(200, {});
  },
};

export default api;
