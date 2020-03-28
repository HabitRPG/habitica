import _ from 'lodash';
import fs from 'fs';
import path from 'path';
import { langCodes } from './i18n';
import common from '../../common';

export const CONTENT_CACHE_PATH = path.join(__dirname, '/../../../content_cache/');

function walkContent (obj, lang) {
  _.each(obj, (item, key, source) => {
    if (_.isPlainObject(item) || _.isArray(item)) {
      walkContent(item, lang);
    } else if (_.isFunction(item) && item.i18nLangFunc) {
      source[key] = item(lang);
    }
  });
}

export function getLocalizedContent (langCode) {
  const contentClone = _.cloneDeep(common.content);
  walkContent(contentClone, langCode);
  return `{"success": true, "data": ${JSON.stringify(contentClone)}}`;
}

export async function cacheLocalizedContentToDisk () {
  // create the cache folder (if it doesn't exist)
  try {
    fs.mkdirSync(CONTENT_CACHE_PATH);
  } catch (err) {
    if (err.code !== 'EEXIST') throw err;
  }

  // clone the content for each language and save
  // localize it
  // save the result
  langCodes.forEach(langCode => {
    fs.writeFileSync(
      `${CONTENT_CACHE_PATH}${langCode}.json`,
      getLocalizedContent(langCode),
      'utf8',
    );
  });
}
