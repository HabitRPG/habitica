import _ from 'lodash';
import { authWithHeaders } from '../../middlewares/auth';
import apiError from '../../libs/apiError';
import { model as NewsPost } from '../../models/newsPost';
import { ensureNewsPoster } from '../../middlewares/ensureAccessRight';
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
 * @apiParam (Query) {Number} [page] This parameter can be used to specify the page number
 *           (the initial page is number 0 and not required).
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
    const { page } = req.query;
    let isNewsPoster = false;
    if (user) {
      isNewsPoster = user.isNewsPoster();
    }
    const results = await NewsPost.getNews(isNewsPoster, { page });
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
 * @apiPermission NewsPoster
 */
api.createNews = {
  method: 'POST',
  url: '/news',
  middlewares: [authWithHeaders(), ensureNewsPoster],
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

    const newsPost = await NewsPost.findById(req.params.postId).exec();
    if (!newsPost || (!user.isNewsPoster() && !newsPost.isPublished)) {
      throw new NotFound(res.t('newsPostNotFound'));
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
 * @apiPermission NewsPoster
 */
api.updateNews = {
  method: 'PUT',
  url: '/news/:postId',
  middlewares: [authWithHeaders(), ensureNewsPoster],
  async handler (req, res) {
    req.checkParams('postId', apiError('postIdRequired')).notEmpty();
    const validationErrors = req.validationErrors();
    if (validationErrors) throw validationErrors;

    const newsPost = await NewsPost.findById(req.params.postId).exec();
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
 * @apiPermission NewsPoster
 */
api.deleteNews = {
  method: 'DELETE',
  url: '/news/:postId',
  middlewares: [authWithHeaders(), ensureNewsPoster],
  async handler (req, res) {
    const validationErrors = req.validationErrors();
    if (validationErrors) throw validationErrors;

    const newsPost = await NewsPost.findById(req.params.postId).exec();
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

    const { id } = NewsPost.lastNewsPost();
    user.flags.lastNewStuffRead = id;

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

    const { id, title } = NewsPost.lastNewsPost();
    user.flags.lastNewStuffRead = id;

    if (user.notifications) {
      const existingNotificationIndex = user.notifications.findIndex(n => n && n.type === 'NEW_STUFF');
      if (existingNotificationIndex !== -1) user.notifications.splice(existingNotificationIndex, 1);
    }
    user.addNotification('NEW_STUFF', { title: title.toUpperCase() }, true); // seen by default

    await user.save();
    res.respond(200, {});
  },
};

export default api;
