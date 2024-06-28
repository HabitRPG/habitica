import _ from 'lodash';
import path from 'path';
import fs from 'fs';
import moment from 'moment';
import nconf from 'nconf';
import common from '../../common';
import packageInfo from '../../../package.json';

export const CONTENT_CACHE_PATH = path.join(__dirname, '/../../../content_cache/');
const SWITCHOVER_TIME = nconf.get('CONTENT_SWITCHOVER_TIME_OFFSET') || 0;

function getDay (date) {
  if (date === undefined) {
    return 0;
  }
  const checkDate = new Date(date.getTime());
  checkDate.setHours(checkDate.getHours() - SWITCHOVER_TIME);
  return checkDate.getDate();
}

function getMonth (date) {
  if (date === undefined) {
    return 0;
  }
  return date instanceof moment ? date.month() : date.getMonth();
}

let CACHED_DATE = null;
let CACHED_HASHES = [

];

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

export function hashForFilter (filter) {
  let hash = 0;
  let i; let
    chr;
  if (filter.length === 0) return '';
  for (i = 0; i < filter.length; i++) { // eslint-disable-line
    chr = filter.charCodeAt(i);
    hash = ((hash << 5) - hash) + chr; // eslint-disable-line
    hash |= 0; // eslint-disable-line
  }
  return String(hash);
}

export function serveContent (res, language, filter, isProd) {
  // Build usable filter object
  const filterObj = {};
  filter.split(',').forEach(item => {
    if (item.includes('.')) {
      const [key, subkey] = item.split('.');
      if (!filterObj[key]) {
        filterObj[key] = {};
      }
      filterObj[key][subkey.trim()] = true;
    } else {
      filterObj[item.trim()] = true;
    }
  });

  if (isProd) {
    const today = new Date();
    if (CACHED_DATE && (getDay(today) !== getDay(CACHED_DATE)
      || getMonth(today) !== getMonth(CACHED_DATE))) {
      // Clear cached results, since they are old
      CACHED_HASHES = [];
      CACHED_DATE = undefined;
    }
    const filterHash = language + hashForFilter(filter);
    if (CACHED_HASHES.includes(filterHash)) {
      // Content is already cached, so just send it.
      res.sendFile(`${CONTENT_CACHE_PATH}${filterHash}.json`);
    } else {
      // Content is not cached, so cache it and send it.
      res.set({
        'Content-Type': 'application/json',
      });
      const jsonResString = getLocalizedContentResponse(language, filterObj);
      fs.writeFileSync(
        `${CONTENT_CACHE_PATH}${filterHash}.json`,
        jsonResString,
        'utf8',
      );
      CACHED_HASHES.push(filterHash);
      CACHED_DATE = new Date();
      res.status(200).send(jsonResString);
    }
  } else {
    res.set({
      'Content-Type': 'application/json',
    });
    const jsonResString = getLocalizedContentResponse(language, filterObj);
    res.status(200).send(jsonResString);
  }
}
