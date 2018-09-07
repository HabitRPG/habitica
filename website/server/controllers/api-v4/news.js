import {authWithHeaders} from '../../middlewares/auth';
import _ from 'lodash';
import {langCodes} from '../../libs/i18n';
import util from 'util';
import fsCallback from 'fs';
import path from 'path';
import apiError from '../../libs/apiError';
import {model as NewsPost} from '../../models/newsPost';
import {ensureAdmin} from '../../middlewares/ensureAccessRight';
import {
  NotFound,
  BadRequest,
  NotAuthorized,
} from '../../libs/errors';
let api = {};

// @TODO export this const, cannot export it from here because only routes are exported from controllers
const LAST_ANNOUNCEMENT_TITLE = 'LAST CHANCE FOR LAVA DRAGON SET AND SPOTLIGHT ON BACK TO SCHOOL';

const NEWS_CACHE_PATH = path.join(__dirname, '/../../../../news_cache/');
const NEWS_SOURCE_PATH = path.join(__dirname, '../../../common/news/');
const fs = {
  readFile: util.promisify(fsCallback.readFile).bind(fsCallback),
  writeFile: util.promisify(fsCallback.writeFile).bind(fsCallback),
  stat: util.promisify(fsCallback.stat).bind(fsCallback),
  mkdir: util.promisify(fsCallback.mkdir).bind(fsCallback),
  readdir: util.promisify(fsCallback.readdir).bind(fsCallback),
};

function parseNewsDate (filename) {
  filename = filename.replace('.md', '');
  return new Date(filename);
}

async function readNews () {
  let filenames = await fs.readdir(NEWS_SOURCE_PATH);
  return await Promise.all(_.map(filenames.sort().reverse(), async filename => {
    let filepath = path.join(NEWS_SOURCE_PATH, filename);
    let filecontent = await fs.readFile(filepath, 'utf8');
    let lines = filecontent.split('\n');
    return {
      title: lines[0],
      authors: lines[1],
      date: parseNewsDate(filename),
      text: lines.slice(2, -1).join('\n'),
    };
  }));
}

// After the getNews route is called the first time for a certain language
// the response is saved on disk and subsequentially served directly from there to reduce computation.
// Example: if `cachedNewsResponses.en` is true it means that the response is cached
let cachedNewsResponses = {};

// Language key set to true while the cache file is being written
let cacheBeingWritten = {};

_.each(langCodes, code => {
  cachedNewsResponses[code] = false;
  cacheBeingWritten[code] = false;
});


async function saveNewsToDisk (language, content) {
  try {
    cacheBeingWritten[language] = true;

    await fs.stat(NEWS_CACHE_PATH); // check if the directory exists, if it doesn't an error is thrown
    await fs.writeFile(`${NEWS_CACHE_PATH}${language}.json`, content, 'utf8');

    cacheBeingWritten[language] = false;
    cachedNewsResponses[language] = true;
  } catch (err) {
    if (err.code === 'ENOENT' && err.syscall === 'stat') { // the directory doesn't exists, create it and retry
      await fs.mkdir(NEWS_CACHE_PATH);
      return saveNewsToDisk(language, content);
    } else {
      cacheBeingWritten[language] = false;
    }
  }
}

/**
 * @api {get} /api/v3/news Get latest Bailey announcement
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
  noLanguage: true,
  middlewares: [authWithHeaders()],
  async handler (req, res) {
    let user = res.locals.user;
    let isAdmin = false;
    if (user && user.contributor) {
      isAdmin = user.contributor.admin;
    }
    let results = await NewsPost.getNews(isAdmin);
    res.respond(200, results);
  },
};

api.createNews = {
  method: 'POST',
  url: '/news',
  middlewares: [authWithHeaders(), ensureAdmin],
  async handler (req, res) {
    let validationErrors = req.validationErrors();
    if (validationErrors) throw validationErrors;

    const postData = {
      title: req.body.title,
      publishDate: req.body.publishDate,
      published: req.body.published,
      credits: req.body.credits,
      text: req.body.text,
    };

    const newsPost = new NewsPost(postData);
    await newsPost.save();

    res.respond(201, newsPost.toJSON());
  },
};

/**
 * @api {put} /api/v4/news/:postId Update news post
 * @apiName UpdateNewsPost
 * @apiGroup News
 *
 * @apiParam (Path) {String} postId The posts _id
 *
 * @apiSuccess {Object} data The updated group (See <a href="https://github.com/HabitRPG/habitica/blob/develop/website/server/models/group.js" target="_blank">/website/server/models/group.js</a>)
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
    let validationErrors = req.validationErrors();
    if (validationErrors) throw validationErrors;

    let newsPost = await NewsPost.findById(req.params.postId);
    if (!newsPost) throw new NotFound(res.t('newsPostNotFound'));

    _.merge(newsPost, NewsPost.sanitize(req.body));
    let savedPost = await newsPost.save();

    res.respond(200, savedPost.toJSON());
  },
};

api.deleteNews = {
  method: 'DELETE',
  url: '/news/:postId',
  middlewares: [authWithHeaders(), ensureAdmin],
  async handler (req, res) {
    let validationErrors = req.validationErrors();
    if (validationErrors) throw validationErrors;

    let newsPost = await NewsPost.findById(req.params.postId);
    if (!newsPost) throw new NotFound(res.t('newsPostNotFound'));

    await NewsPost.remove({_id: req.params.postId}).exec();

    res.respond(200, {});
  },
};

/**
 * @api {post} /api/v3/news/tell-me-later Get latest Bailey announcement in a second moment
 * @apiName TellMeLaterNews
 * @apiGroup News
 *
 *
 * @apiSuccess {Object} data An empty Object
 *
 */
api.tellMeLaterNews = {
  method: 'POST',
  middlewares: [authWithHeaders({
    userFieldsToExclude: ['inbox'],
  })],
  url: '/news/tell-me-later',
  async handler (req, res) {
    const user = res.locals.user;

    user.flags.newStuff = false;

    const existingNotificationIndex = user.notifications.findIndex(n => {
      return n && n.type === 'NEW_STUFF';
    });
    if (existingNotificationIndex !== -1) user.notifications.splice(existingNotificationIndex, 1);
    user.addNotification('NEW_STUFF', { title: LAST_ANNOUNCEMENT_TITLE }, true); // seen by default

    await user.save();
    res.respond(200, {});
  },
};

module.exports = api;
