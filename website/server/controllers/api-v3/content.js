import common from '../../../common';
import _ from 'lodash';
import { langCodes } from '../../libs/i18n';
import Bluebird from 'bluebird';
import fsCallback from 'fs';
import path from 'path';
import logger from '../../libs/logger';

// Transform fs methods that accept callbacks in ones that return promises
const fs = {
  readFile: Bluebird.promisify(fsCallback.readFile, {context: fsCallback}),
  writeFile: Bluebird.promisify(fsCallback.writeFile, {context: fsCallback}),
  stat: Bluebird.promisify(fsCallback.stat, {context: fsCallback}),
  mkdir: Bluebird.promisify(fsCallback.mkdir, {context: fsCallback}),
};

let api = {};

function walkContent (obj, lang) {
  _.each(obj, (item, key, source) => {
    if (_.isPlainObject(item) || _.isArray(item)) return walkContent(item, lang);
    if (_.isFunction(item) && item.i18nLangFunc) source[key] = item(lang);
  });
}

// After the getContent route is called the first time for a certain language
// the response is saved on disk and subsequentially served directly from there to reduce computation.
// Example: if `cachedContentResponses.en` is true it means that the response is cached
let cachedContentResponses = {};

// Language key set to true while the cache file is being written
let cacheBeingWritten = {};

_.each(langCodes, code => {
  cachedContentResponses[code] = false;
  cacheBeingWritten[code] = false;
});


const CONTENT_CACHE_PATH = path.join(__dirname, '/../../../build/content_cache/');

async function saveContentToDisk (language, content) {
  try {
    cacheBeingWritten[language] = true;

    await fs.stat(CONTENT_CACHE_PATH); // check if the directory exists, if it doesn't an error is thrown
    await fs.writeFile(`${CONTENT_CACHE_PATH}${language}.json`, content, 'utf8');

    cacheBeingWritten[language] = false;
    cachedContentResponses[language] = true;
  } catch (err) {
    if (err.code === 'ENOENT' && err.syscall === 'stat') { // the directory doesn't exists, create it and retry
      await fs.mkdir(CONTENT_CACHE_PATH);
      return saveContentToDisk(language, content);
    } else {
      cacheBeingWritten[language] = false;
      logger.error(err);
      return;
    }
  }
}

/**
 * @api {get} /api/v3/content Get all available content objects
 * @apiDescription Does not require authentication.
 * @apiName ContentGet
 * @apiGroup Content
 *
 * @apiParam {String} language Query parameter, the  language code used for the items' strings. Defaulting to english
 *
 * @apiSuccess {Object} data All the content available on Habitica
 */
api.getContent = {
  method: 'GET',
  url: '/content',
  async handler (req, res) {
    let language = 'en';
    let proposedLang = req.query.language && req.query.language.toString();

    if (proposedLang in cachedContentResponses) {
      language = proposedLang;
    }

    let content;

    // is the content response for this language cached?
    if (cachedContentResponses[language] === true) {
      content = await fs.readFile(`${CONTENT_CACHE_PATH}${language}.json`, 'utf8');
    } else { // generate the response
      content = _.cloneDeep(common.content);
      walkContent(content, language);
      content = JSON.stringify(content);
    }

    res.set({
      'Content-Type': 'application/json',
    });

    let jsonResString = `{"success": true, "data": ${content}}`;
    res.status(200).send(jsonResString);

    // save the file in background unless it's already cached or being written right now
    if (cachedContentResponses[language] !== true && cacheBeingWritten[language] !== true) {
      saveContentToDisk(language, content);
    }
  },
};

module.exports = api;
