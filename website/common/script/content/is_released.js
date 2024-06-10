import moment from 'moment';
import filter from 'lodash/filter';
import { pickBy } from 'lodash';
import nconf from 'nconf';

const SWITCHOVER_TIME = nconf.get('CONTENT_SWITCHOVER_TIME_OFFSET') || 0;

const releaseDateEndPart = `T${String(SWITCHOVER_TIME).padStart(2, '0')}:00-0000`;

export function buildReleaseDate (year, month, day = 1) {
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}${releaseDateEndPart}`;
}

function isReleased (item, fieldName, releaseDateMap, releaseByDefault) {
  if (releaseDateMap[item[fieldName]]) {
    const release = releaseDateMap[item[fieldName]];
    if (release.day) {
      return moment().isAfter(moment(buildReleaseDate(release.year, release.month, release.day)));
    }
    return moment().isAfter(releaseDateMap[item[fieldName]]);
  }
  return releaseByDefault;
}

export function filterReleased (items, fieldName, releaseDateMap, releaseByDefault = true) {
  if (typeof items === 'object') {
    return pickBy(items, item => isReleased(item, fieldName, releaseDateMap, releaseByDefault));
  }
  return filter(items, item => isReleased(item, fieldName, releaseDateMap, releaseByDefault));
}
