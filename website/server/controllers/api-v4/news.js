import _ from 'lodash';
import { authWithHeaders } from '../../middlewares/auth';
import apiError from '../../libs/apiError';
import { model as NewsPost } from '../../models/newsPost';
import { ensurePermission } from '../../middlewares/ensureAccessRight';
import {
  NotFound,
} from '../../libs/errors';

const api = {};

/**
 * @apiDefine postIdRequired
 * @apiError (400) {BadRequest} postIdRequired A postId is required
 */

/**
 * @apiDefine NewsPostNotFound
 * @apiError (404) {NotFound} NewsPostNotFound The specified news post could not be found.
 */

/**
 * @api {get} /api/v4/news Get latest Bailey announcements
 * @apiName GetNews
 * @apiGroup News
 *
 * @apiParam (Query) {Number} [page] This parameter can be used to specify the page number
 *           (the initial page is number 0 and not required).
 *
 * @apiSuccess {Array} Data An array of Bailey posts
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
 * @api {post} /api/v4/news Create a new news post
 * @apiName CreateNewsPost
 * @apiGroup News
 *
 * @apiSuccess {Object} data The created news post (See <a href="https://github.com/HabitRPG/habitica/blob/develop/website/server/models/newsPost.js" target="_blank">/website/server/models/newsPost.js</a>)
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
  middlewares: [authWithHeaders(), ensurePermission('news')],
  async handler (req, res) {
    const newsPost = new NewsPost(NewsPost.sanitize(req.body));
    newsPost.author = res.locals.user._id;
    await newsPost.save();

    res.respond(201, newsPost);

    NewsPost.updateLastNewsPost(newsPost);
  },
};

/**
 * @api {get} /api/v4/news/:postId Get a specific news post
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
 * @apiUse NewsPostNotFound
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
    req.checkParams('postId', apiError('postIdRequired')).notEmpty().isUUID();
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
 * @api {put} /api/v4/news/:postId Update a news post
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
 * @apiUse NewsPostNotFound
 *
 * @apiPermission NewsPoster
 */
api.updateNews = {
  method: 'PUT',
  url: '/news/:postId',
  middlewares: [authWithHeaders(), ensurePermission('news')],
  async handler (req, res) {
    req.checkParams('postId', apiError('postIdRequired')).notEmpty().isUUID();
    const validationErrors = req.validationErrors();
    if (validationErrors) throw validationErrors;

    const newsPost = await NewsPost.findById(req.params.postId).exec();
    if (!newsPost) throw new NotFound(res.t('newsPostNotFound'));

    _.merge(newsPost, NewsPost.sanitize(req.body));
    const savedPost = await newsPost.save();

    res.respond(200, savedPost);

    NewsPost.updateLastNewsPost(newsPost);
  },
};

/**
 * @api {delete} /api/v4/news/:postId Delete a news post
 * @apiName DeleteNewsPost
 * @apiGroup News
 *
 * @apiParam (Path) {String} postId The posts _id
 *
 * @apiSuccess {Object} data An empty object
 *
 * @apiUse postIdRequired
 * @apiUse NewsPostNotFound
 *
 * @apiPermission NewsPoster
 */
api.deleteNews = {
  method: 'DELETE',
  url: '/news/:postId',
  middlewares: [authWithHeaders(), ensurePermission('news')],
  async handler (req, res) {
    req.checkParams('postId', apiError('postIdRequired')).notEmpty().isUUID();
    const validationErrors = req.validationErrors();
    if (validationErrors) throw validationErrors;

    const newsPost = await NewsPost.findById(req.params.postId).exec();
    if (!newsPost) throw new NotFound(res.t('newsPostNotFound'));

    await NewsPost.remove({ _id: req.params.postId }).exec();

    res.respond(200, {});
  },
};

/**
 * @api {post} /api/v4/news/read Mark the latest Bailey announcement as read
 * @apiName MarkNewsRead
 * @apiGroup News
 *
 * @apiSuccess {Object} data An empty Object
 */
api.markNewsRead = {
  method: 'POST',
  middlewares: [authWithHeaders()],
  url: '/news/read',
  async handler (req, res) {
    const { user } = res.locals;

    const lastNewsPost = NewsPost.lastNewsPost();
    if (lastNewsPost) {
      user.flags.lastNewStuffRead = lastNewsPost._id;

      await user.save();
    }

    res.respond(200, {});
  },
};

export default api;
