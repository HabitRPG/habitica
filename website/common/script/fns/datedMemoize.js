import moment from 'moment';
import nconf from 'nconf';

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

const memoize = fn => {
  const cache = {};
  const cacheDate = {};
  return (...args) => {
    let checkedDate;
    let identifier = '';
    if (args.length > 0) {
      if (typeof args[0] === 'object' && args[0].memoizeConfig) {
        const config = args.shift();
        checkedDate = config.date;
        if (config.identifier) {
          identifier = config.identifier;
        }
      }

      if (identifier.length === 0) {
        identifier = args.filter(arg => typeof arg === 'string').join('-');
      }
    }
    if (!checkedDate) {
      checkedDate = new Date();
    }

    if (cacheDate[identifier] && (getDay(checkedDate) !== getDay(cacheDate[identifier])
      || getMonth(checkedDate) !== getMonth(cacheDate[identifier]))) {
      // Clear cached results, since they are old
      cache[identifier] = undefined;
      cacheDate[identifier] = undefined;
    }
    if (cache[identifier]) {
      // result is already cached
      return cache[identifier];
    }
    const result = fn(...args);
    cache[identifier] = result;
    cacheDate[identifier] = checkedDate;
    return result;
  };
};

export default memoize;
