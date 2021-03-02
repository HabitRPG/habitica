import _ from 'lodash';
import path from 'path';
import common from '../../common';
import packageInfo from '../../../package.json';

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

export function localizeContentData (data, langCode) {
  const dataClone = _.cloneDeep(data);
  walkContent(dataClone, langCode);
  return dataClone;
}

export function getLocalizedContentResponse (langCode) {
  const localizedContent = localizeContentData(common.content, langCode);
  return `{"success": true, "data": ${JSON.stringify(localizedContent)}, "appVersion": "${packageInfo.version}"}`;
}
