import _ from 'lodash';
import fsCallback from 'fs';
import path from 'path';
import util from 'util';
import logger from '../../libs/logger';
import { langCodes } from '../../libs/i18n';
import common from '../../../common';

// Transform fs methods that accept callbacks in ones that return promises
const fs = {
  readFile: util.promisify(fsCallback.readFile).bind(fsCallback),
  writeFile: util.promisify(fsCallback.writeFile).bind(fsCallback),
  stat: util.promisify(fsCallback.stat).bind(fsCallback),
  mkdir: util.promisify(fsCallback.mkdir).bind(fsCallback),
};

const api = {};

function walkContent (obj, lang) {
  _.each(obj, (item, key, source) => {
    if (_.isPlainObject(item) || _.isArray(item)) {
      walkContent(item, lang);
    } else if (_.isFunction(item) && item.i18nLangFunc) {
      source[key] = item(lang);
    }
  });
}

// After the getContent route is called the first time for a certain language
// the response is saved on disk and subsequentially served
// directly from there to reduce computation.
// Example: if `cachedContentResponses.en` is true it means that the response is cached
const cachedContentResponses = {};

// Language key set to true while the cache file is being written
const cacheBeingWritten = {};

_.each(langCodes, code => {
  cachedContentResponses[code] = false;
  cacheBeingWritten[code] = false;
});


const CONTENT_CACHE_PATH = path.join(__dirname, '/../../../../content_cache/');

async function saveContentToDisk (language, content) {
  try {
    cacheBeingWritten[language] = true;

    // check if the directory exists, if it doesn't an error is thrown
    await fs.stat(CONTENT_CACHE_PATH);
    await fs.writeFile(`${CONTENT_CACHE_PATH}${language}.json`, content, 'utf8');

    cacheBeingWritten[language] = false;
    cachedContentResponses[language] = true;
  } catch (err) {
    // the directory doesn't exists, create it and retry
    if (err.code === 'ENOENT' && err.syscall === 'stat') {
      await fs.mkdir(CONTENT_CACHE_PATH);
      saveContentToDisk(language, content);
    } else {
      cacheBeingWritten[language] = false;
      logger.error(err);
    }
  }
}

/**
 * @api {get} /api/v3/content Get all available content objects
 * @apiDescription Does not require authentication.
 * @apiName ContentGet
 * @apiGroup Content
 *
 * @apiParam (Query) {String="bg","cs","da","de",
 *                   "en","en@pirate","en_GB",
 *                    "es","es_419","fr","he","hu",
 *                    "id","it","ja","nl","pl","pt","pt_BR",
 *                    "ro","ru","sk","sr","sv",
 *                    "uk","zh","zh_TW"} [language=en] Language code used for the items'
 *                                                     strings. If the authenticated user makes
 *                                                     the request, the content will return with
 *                                                     the user's configured language.
 *
 * @apiSuccess {Object} data Various data about the content of Habitica. The content route
 * contains many keys, but the data listed below are the recommended data to use.
 * @apiSuccess {Object} data.mystery The mystery sets awarded to paying subscribers.
 * @apiSuccess {Object} data.gear The gear that can be equipped.
 * @apiSuccess {Object} data.gear.tree Detailed information about the gear, organized by type.
 * @apiSuccess {Object} data.gear.flat The full key of each equipment.
 * @apiSuccess {Object} data.spells The skills organized by class. Includes cards and visual buffs.
 * @apiSuccess {Object} data.potion Data about the health potion.
 * @apiSuccess {Object} data.armoire Data about the armoire.
 * @apiSuccess {Array} data.classes The available classes.
 * @apiSuccess {Object} data.eggs All available eggs.
 * @apiSuccess {Object} data.timeTravelStable The animals available
 *                                            in the Time Traveler's stable, separated
 *                                            into pets and mounts.
 * @apiSuccess {Object} data.hatchingPotions All the hatching potions.
 * @apiSuccess {Object} data.petInfo All the pets with extra info.
 * @apiSuccess {Object} data.mountInfo All the mounts with extra info.
 * @apiSuccess {Object} data.food All the food.
 * @apiSuccess {Array} data.userCanOwnQuestCategories The types of quests that a user can own.
 * @apiSuccess {Object} data.quests Data about the quests.
 * @apiSuccess {Object} data.appearances Data about the appearance properties.
 * @apiSuccess {Object} data.appearances.hair Data about available hair options.
 * @apiSuccess {Object} data.appearances.shirt Data about available shirt options.
 * @apiSuccess {Object} data.appearances.size Data about available body size options.
 * @apiSuccess {Object} data.appearances.skin Data about available skin options.
 * @apiSuccess {Object} data.appearances.chair Data about available chair options.
 * @apiSuccess {Object} data.appearances.background Data about available background options.
 * @apiSuccess {Object} data.backgrounds Data about the background sets.
 * @apiSuccess {Object} data.subscriptionBlocks Data about the various subscriptions blocks.
 *
 */
api.getContent = {
  method: 'GET',
  url: '/content',
  noLanguage: true,
  async handler (req, res) {
    let language = 'en';
    const proposedLang = req.query.language && req.query.language.toString();

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

    const jsonResString = `{"success": true, "data": ${content}}`;
    res.status(200).send(jsonResString);

    // save the file in background unless it's already cached or being written right now
    if (cachedContentResponses[language] !== true && cacheBeingWritten[language] !== true) {
      saveContentToDisk(language, content);
    }
  },
};

export default api;
