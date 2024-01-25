import _ from 'lodash';
import path from 'path';
import common from '../../common';
import packageInfo from '../../../package.json';

export const CONTENT_CACHE_PATH = path.join(__dirname, '/../../../content_cache/');

function walkContent (obj, lang, removedKeys = {}) {
  _.each(obj, (item, key, source) => {
    if (key in removedKeys && removedKeys[key] === true) {
      delete source[key];
      return;
    }
    if (_.isPlainObject(item) || _.isArray(item)) {
      if (key in removedKeys && _.isPlainObject(removedKeys[key])) {
        walkContent(item, lang, removedKeys[key]);
      } else {
        walkContent(item, lang);
      }
    } else if (_.isFunction(item) && item.i18nLangFunc) {
      source[key] = item(lang);
    }
  });
}

export function localizeContentData (data, langCode, removedKeys = {}) {
  const dataClone = _.cloneDeep(data);
  walkContent(dataClone, langCode, removedKeys);
  return dataClone;
}

export function getLocalizedContentResponse (langCode, removedKeys = {}) {
  const localizedContent = localizeContentData(common.content, langCode, removedKeys);
  return `{"success": true, "data": ${JSON.stringify(localizedContent)}, "appVersion": "${packageInfo.version}"}`;
}
