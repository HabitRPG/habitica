import common from '../../../common';
import _ from 'lodash';
import { langCodes } from '../../libs/i18n';
import Bluebird from 'bluebird';
import fsCallback from 'fs';
import path from 'path';
import logger from '../../libs/logger';
import {
  model as Group,
  TAVERN_ID as tavernId
} from '../../models/group';

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
// Example: if `cachedWorldStateResponses.en` is true it means that the response is cached
let cachedWorldStateResponses = {};

// Language key set to true while the cache file is being written
let cacheBeingWritten = {};

_.each(langCodes, code => {
  cachedWorldStateResponses[code] = false;
  cacheBeingWritten[code] = false;
});


const CONTENT_CACHE_PATH = path.join(__dirname, '/../../../build/worldstate_cache/');

async function saveWorldStateToDisk (language, content) {
  try {
    cacheBeingWritten[language] = true;

    await fs.stat(CONTENT_CACHE_PATH); // check if the directory exists, if it doesn't an error is thrown
    await fs.writeFile(`${CONTENT_CACHE_PATH}${language}.json`, content, 'utf8');

    cacheBeingWritten[language] = false;
    cachedWorldStateResponses[language] = true;
  } catch (err) {
    if (err.code === 'ENOENT' && err.syscall === 'stat') { // the directory doesn't exists, create it and retry
      await fs.mkdir(CONTENT_CACHE_PATH);
      return saveWorldStateToDisk(language, content);
    } else {
      cacheBeingWritten[language] = false;
      logger.error(err);
      return;
    }
  }
}

function getNextEvent() {
  let nextEvent;
  let today = new Date().toISOString();
  for (let eventKey in common.content.events) {
    let event = common.content.events[eventKey];
    if (event.end < today) {
      continue;
    }
    if (nextEvent == undefined || event.end > nextEvent.end) {
      event.key = eventKey;
      nextEvent = event;
    }
  }
  return nextEvent;
}

async function getWorldBoss() {
  let tavern = await Group
    .findById(tavernId)
    .select('quest.progress quest.key')
    .exec();
  let quest;
  if (tavern) {
    quest = tavern.quest;
  }
  return quest;
}

/**
 * @api {get} /api/v3/world-state Get the state for the game world
 * @apiDescription Does not require authentication.
 * @apiName WorldStateGet
 * @apiGroup WorldState
 *
 * @apiParam {String="bg","cs","da","de","en","en@pirate","en_GB","es","es_419","fr","he","hu","id","it","ja","nl","pl","pt","pt_BR","ro","ru","sk","sr","sv","uk","zh","zh_TW"} [language=en]  Query parameter, the  language code used for the items' strings. If the authenticated user makes the request, the content will return with the user's configured language.
 *
 * @apiSuccess {Object} data Various data about the state of the land Habitica.

 *
 */
api.getWorldState = {
  method: 'GET',
  url: '/world-state',
  async handler (req, res) {
    let language = 'en';
    let proposedLang = req.query.language && req.query.language.toString();

    if (proposedLang in cachedWorldStateResponses) {
      language = proposedLang;
    }

    let worldState;

    // is the content response for this language cached?
    if (cachedWorldStateResponses[language] === true) {
      worldState = await fs.readFile(`${CONTENT_CACHE_PATH}${language}.json`, 'utf8');
    } else { // generate the response
      worldState = {};
      worldState.event = getNextEvent();
      worldState.worldboss = await getWorldBoss();
      worldState = JSON.stringify(worldState);
    }

    res.set({
      'Content-Type': 'application/json',
    });

    let jsonResString = `{"success": true, "data": ${worldState}}`;
    res.status(200).send(jsonResString);

    // save the file in background unless it's already cached or being written right now
    if (cachedWorldStateResponses[language] !== true && cacheBeingWritten[language] !== true) {
      saveWorldStateToDisk(language, worldState);
    }
  },
};

module.exports = api;
