import { authWithHeaders } from '../../middlewares/api-v3/auth';
import { model as Tag } from '../../models/tag';
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
  handler (req, res, next) {
    let user = res.locals.user;

    user.tags.push(Tag.sanitize(req.body));

    user.save()
      .then((savedUser) => {
        let l = savedUser.tags.length;
        let tag = savedUser.tags[l - 1];
        res.respond(201, tag);
      })
      .catch(next);
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
  handler (req, res) {
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
  handler (req, res, next) {
    let user = res.locals.user;

    req.checkParams('taskId', res.t('tagIdRequired')).notEmpty().isUUID();

    let validationErrors = req.validationErrors();
    if (validationErrors) return next(validationErrors);

    let tag = user.tags.id(req.params.tagId);
    if (!tag) return next(new NotFound(res.t('tagNotFound')));
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
  handler (req, res, next) {
    let user = res.locals.user;

    req.checkParams('tagId', res.t('tagIdRequired')).notEmpty().isUUID();
    // TODO check that req.body isn't empty

    let tagId = req.params.id;

    let validationErrors = req.validationErrors();
    if (validationErrors) return next(validationErrors);

    let tag = user.tags.id(tagId);
    if (!tag) return next(new NotFound(res.t('tagNotFound')));

    _.merge(tag, Tag.sanitize(req.body));

    user.save()
      .then((savedUser) => res.respond(200, savedUser.tags.id(tagId)))
      .catch(next);
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
  method: 'GET',
  url: '/tags/:tagId',
  middlewares: [authWithHeaders()],
  handler (req, res, next) {
    let user = res.locals.user;

    req.checkParams('tagId', res.t('tagIdRequired')).notEmpty().isUUID();

    let validationErrors = req.validationErrors();
    if (validationErrors) return next(validationErrors);

    let tag = user.tags.id(req.params.tagId);
    if (!tag) return next(new NotFound(res.t('tagNotFound')));
    tag.remove();

    user.save()
      .then(() => res.respond(200, {}))
      .catch(next);
  },
};

export default api;
