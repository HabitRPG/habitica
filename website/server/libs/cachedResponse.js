import Bluebird from 'bluebird';
import fsCallback from 'fs';
import { langCodes } from './i18n';
import path from 'path';
import logger from './logger';
import _ from 'lodash';


export const fs = {
  readFile: Bluebird.promisify(fsCallback.readFile, {context: fsCallback}),
  writeFile: Bluebird.promisify(fsCallback.writeFile, {context: fsCallback}),
  stat: Bluebird.promisify(fsCallback.stat, {context: fsCallback}),
  mkdir: Bluebird.promisify(fsCallback.mkdir, {context: fsCallback}),
};

// After the getContent route is called the first time for a certain response and language
// the response is saved on disk and subsequentially served directly from there to reduce computation.
// Example: if `cachedResponses.content_cache.en` is true it means that the response is cached
let cachedResponses = {};

// Language key set to true while the cache file is being written
let cacheBeingWritten = {};


const BASE_CACHE_PATH = path.join(__dirname, '/../../build/');

function initObjectIfNeeded (obj, responseName) {
  if (!obj[responseName]) {
    obj[responseName] = {};
    _.each(langCodes, code => {
      obj[responseName][code] = false;
    });
  }
}

export async function saveResponseToDisk (responseName, language, content) {
  initObjectIfNeeded(cachedResponses, responseName);
  initObjectIfNeeded(cacheBeingWritten, responseName);
  if (cachedResponses[responseName][language] === true || cacheBeingWritten[responseName][language] === true) {
    return;
  }
  let contentPath = path.join(BASE_CACHE_PATH, `/${responseName}/`);
  try {
    cacheBeingWritten[responseName][language] = true;

    await fs.stat(contentPath); // check if the directory exists, if it doesn't an error is thrown
    await fs.writeFile(`${contentPath}${language}.json`, content, 'utf8');

    cacheBeingWritten[responseName][language] = false;
    cachedResponses[responseName][language] = true;
  } catch (err) {
    if (err.code === 'ENOENT' && err.syscall === 'stat') { // the directory doesn't exists, create it and retry
      await fs.mkdir(contentPath);
      return saveResponseToDisk(responseName, language, content);
    } else {
      cacheBeingWritten[responseName][language] = false;
      logger.error(err);
    }
  }
}

export async function getCachedResponse (responseName, language) {
  initObjectIfNeeded(cachedResponses, responseName);
  if (cachedResponses[responseName][language] === true) {
    let contentPath = path.join(BASE_CACHE_PATH, `/${responseName}/`);
    return await fs.readFile(`${contentPath}${language}.json`, 'utf8');
  }
  return null;
}
