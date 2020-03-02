import _ from 'lodash';
import { authWithHeaders } from '../../middlewares/auth';
import apiError from '../../libs/apiError';
import { model as NewsPost } from '../../models/newsPost';
import { ensureAdmin } from '../../middlewares/ensureAccessRight';
import {
  NotFound,
} from '../../libs/errors';

const api = {};

/**
 * @apiDefine postIdRequired
 * @apiError (400) {BadRequest} postIdRequired A postId is required
 */

/**
 * @api {get} /api/v4/news Get latest Bailey announcement
 * @apiName GetNews
 * @apiGroup News
 *
 *
 * @apiSuccess {Object} html Latest Bailey html
 *
 */
api.getNews = {
  method: 'GET',
  url: '/news',
  middlewares: [authWithHeaders({
    optional: true,
  })],
  noLanguage: true,
  async handler (req, res) {
    const { user } = res.locals;
    let isAdmin = false;
    if (user && user.contributor) {
      isAdmin = user.contributor.admin;
    }
    const results = await NewsPost.getNews(isAdmin);
    res.respond(200, results);
  },
};


/**
 * @api {post} /api/v4/news create a new news post
 * @apiName CreateNewsPost
 * @apiGroup News
 *
 * @apiSuccess {Object} data The create news post (See <a href="https://github.com/HabitRPG/habitica/blob/develop/website/server/models/newsPost.js" target="_blank">/website/server/models/newsPost.js</a>)
 *
 * @apiSuccessExample {json} Post:
 *     HTTP/1.1 200 OK
 *     {
 *       "title": "News Title",
 *       ...
 *     }
 *
 * @apiPermission Admin
 */
api.createNews = {
  method: 'POST',
  url: '/news',
  middlewares: [authWithHeaders(), ensureAdmin],
  async handler (req, res) {
    const postData = {
      title: req.body.title,
      publishDate: req.body.publishDate,
      published: req.body.published,
      credits: req.body.credits,
      text: req.body.text,
    };

    const newsPost = new NewsPost(NewsPost.sanitize(postData));
    await newsPost.save();

    if (newsPost.published) {
      NewsPost.updateLastNewsPost(newsPost);
    }

    res.respond(201, newsPost.toJSON());
  },
};

/**
 * @api {get} /api/v4/news/:postId get news post
 * @apiName GetNewsPost
 * @apiGroup News
 *
 * @apiParam (Path) {String} postId The posts _id
 *
 * @apiSuccess {Object} data The news post (See <a href="https://github.com/HabitRPG/habitica/blob/develop/website/server/models/newsPost.js" target="_blank">/website/server/models/newsPost.js</a>)
 *
 * @apiSuccessExample {json} Post:
 *     HTTP/1.1 200 OK
 *     {
 *       "title": "News Title",
 *       ...
 *     }
 *
 * @apiUse postIdRequired
 *
 */
api.getPost = {
  method: 'GET',
  url: '/news/:postId',
  middlewares: [authWithHeaders({
    optional: true,
  })],
  noLanguage: true,
  async handler (req, res) {
    req.checkParams('postId', apiError('postIdRequired')).notEmpty();
    const { user } = res.locals;
    let isAdmin = false;
    if (user && user.contributor) {
      isAdmin = user.contributor.admin;
    }

    const newsPost = await NewsPost.findById(req.params.postId);
    if (!newsPost || (!isAdmin && !newsPost.isPublished)) {
      res.respond(404, {});
    } else {
      res.respond(200, newsPost);
    }
  },
};

/**
 * @api {put} /api/v4/news/:postId Update news post
 * @apiName UpdateNewsPost
 * @apiGroup News
 *
 * @apiParam (Path) {String} postId The posts _id
 *
 * @apiSuccess {Object} data The updated news post (See <a href="https://github.com/HabitRPG/habitica/blob/develop/website/server/models/newsPost.js" target="_blank">/website/server/models/newsPost.js</a>)
 *
 * @apiSuccessExample {json} Post:
 *     HTTP/1.1 200 OK
 *     {
 *       "title": "News Title",
 *       ...
 *     }
 *
 * @apiUse postIdRequired
 *
 * @apiPermission Admin
 */
api.updateNews = {
  method: 'PUT',
  url: '/news/:postId',
  middlewares: [authWithHeaders(), ensureAdmin],
  async handler (req, res) {
    req.checkParams('postId', apiError('postIdRequired')).notEmpty();
    const validationErrors = req.validationErrors();
    if (validationErrors) throw validationErrors;

    const newsPost = await NewsPost.findById(req.params.postId);
    if (!newsPost) throw new NotFound(res.t('newsPostNotFound'));

    _.merge(newsPost, NewsPost.sanitize(req.body));
    const savedPost = await newsPost.save();

    if (newsPost.published) {
      await NewsPost.updateLastNewsPost(newsPost);
    }

    res.respond(200, savedPost.toJSON());
  },
};

/**
 * @api {delete} /api/v4/news/:postId delete news post
 * @apiName DeleteNewsPost
 * @apiGroup News
 *
 * @apiParam (Path) {String} postId The posts _id
 *
 * @apiSuccess {Object} data An empty Object
 *
 * @apiUse postIdRequired
 *
 * @apiPermission Admin
 */
api.deleteNews = {
  method: 'DELETE',
  url: '/news/:postId',
  middlewares: [authWithHeaders(), ensureAdmin],
  async handler (req, res) {
    const validationErrors = req.validationErrors();
    if (validationErrors) throw validationErrors;

    const newsPost = await NewsPost.findById(req.params.postId);
    if (!newsPost) throw new NotFound(res.t('newsPostNotFound'));

    await NewsPost.remove({ _id: req.params.postId }).exec();

    res.respond(200, {});
  },
};

/**
 * @api {post} /api/v4/news/read Mark latest Bailey announcement as read
 * @apiName MarkNewsRead
 * @apiGroup News
 *
 * @apiSuccess {Object} data An empty Object
 *
 */
api.MarkNewsRead = {
  method: 'POST',
  middlewares: [authWithHeaders()],
  url: '/news/read',
  async handler (req, res) {
    const { user } = res.locals;

    user.flags.lastNewStuffRead = await NewsPost.lastNewsPostID();

    await user.save();
    res.respond(200, {});
  },
};

/**
 * @api {post} /api/v4/news/tell-me-later Get latest Bailey announcement in a second moment
 * @apiName TellMeLaterNews
 * @apiGroup News
 *
 * @apiSuccess {Object} data An empty Object
 *
 */
api.tellMeLaterNews = {
  method: 'POST',
  middlewares: [authWithHeaders()],
  url: '/news/tell-me-later',
  async handler (req, res) {
    const { user } = res.locals;

    user.flags.lastNewStuffRead = await NewsPost.lastNewsPostID();
    const title = await NewsPost.lastNewsPostTitle();

    const existingNotificationIndex = user.notifications.findIndex(n => n && n.type === 'NEW_STUFF');
    if (existingNotificationIndex !== -1) user.notifications.splice(existingNotificationIndex, 1);
    user.addNotification('NEW_STUFF', { title: title.toUpperCase() }, true); // seen by default

    await user.save();
    res.respond(200, {});
  },
};

export default api;
