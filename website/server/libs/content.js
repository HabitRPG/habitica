import _ from 'lodash';
import path from 'path';
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
