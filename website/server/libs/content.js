import _ from 'lodash';
import path from 'path';
import fs from 'fs';
import moment from 'moment';
import nconf from 'nconf';
import common from '../../common';
import packageInfo from '../../../package.json';

export const CONTENT_CACHE_PATH = path.join(__dirname, '/../../../content_cache/');
const SWITCHOVER_TIME = nconf.get('CONTENT_SWITCHOVER_TIME_OFFSET') || 0;

const MOBILE_FILTER = ['achievements', 'questSeriesAchievements', 'animalColorAchievements', 'animalSetAchievements',
  'stableAchievements', 'bundles', 'loginIncentives', 'pets', 'premiumPets', 'specialPets', 'questPets',
  'wackyPets', 'mounts', 'premiumMounts,specialMounts,questMounts', 'events', 'dropEggs', 'questEggs', 'dropHatchingPotions',
  'premiumHatchingPotions', 'wackyHatchingPotions', 'backgroundsFlat', 'questsByLevel', 'gear.tree', 'tasksByCategory',
  'userDefaults', 'timeTravelStable', 'gearTypes', 'cardTypes'];

export const ANDROID_FILTER = [...MOBILE_FILTER, 'appearances.background'].join(',');
export const IOS_FILTER = [...MOBILE_FILTER, 'backgrounds'].join(',');

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

// Load existing cached hashes
try {
  const files = fs.readdirSync(CONTENT_CACHE_PATH);
  files.forEach(file => {
    if (file.endsWith('.json')) {
      const fileName = file.substring(0, file.length - 5);
      CACHED_HASHES.push(fileName);
    }
  });
  if (CACHED_HASHES.length > 0) {
    CACHED_DATE = new Date();
  }
} catch (err) {
  // Folder does not exist yet
}

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

export function buildFilterObject (filter) {
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
  return filterObj;
}

export function serveContent (res, language, filter, isProd) {
  // Build usable filter object
  const filterObj = buildFilterObject(filter);
  if (isProd) {
    const today = new Date();
    if (CACHED_DATE && (getDay(today) !== getDay(CACHED_DATE)
      || getMonth(today) !== getMonth(CACHED_DATE))) {
      // Clear cached results, since they are old
      CACHED_HASHES = [];
      CACHED_DATE = undefined;
    }
    const cachedName = language + hashForFilter(filter);
    if (CACHED_HASHES.includes(cachedName)) {
      // Content is already cached, so just send it.
      res.sendFile(`${CONTENT_CACHE_PATH}${cachedName}.json`);
    } else {
      console.log(`Caching content for language ${language} with filter ${filter}`);
      // Content is not cached, so cache it and send it.
      res.set({
        'Content-Type': 'application/json',
      });
      const jsonResString = getLocalizedContentResponse(language, filterObj);
      fs.writeFileSync(
        `${CONTENT_CACHE_PATH}${cachedName}.json`,
        jsonResString,
        'utf8',
      );
      CACHED_HASHES.push(cachedName);
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
