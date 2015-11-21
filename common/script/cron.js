/*
  ------------------------------------------------------
  Cron and time / day functions
  ------------------------------------------------------
 */
import _ from 'lodash';

let moment = require('moment');

export const DAY_MAPPING = {
  0: 'su',
  1: 'm',
  2: 't',
  3: 'w',
  4: 'th',
  5: 'f',
  6: 's',
};

/*
  Each time we perform date maths (cron, task-due-days, etc), we need to consider user preferences.
  Specifically {dayStart} (custom day start) and {timezoneOffset}. This function sanitizes / defaults those values.
  {now} is also passed in for various purposes, one example being the test scripts scripts testing different "now" times.
 */

export function sanitizeOptions (o) {
  let ref = Number(o.dayStart);
  let dayStart = !_.isNaN(ref) && ref >= 0 && ref <= 24 ? ref : 0;
  let timezoneOffset = o.timezoneOffset ? Number(o.timezoneOffset) : Number(moment().zone());
  // TODO: check and clean timezoneOffset as for dayStart (e.g., might not be a number)
  let now = o.now ? moment(o.now).zone(timezoneOffset) : moment().zone(timezoneOffset);

  // return a new object, we don't want to add "now" to user object
  return {
    dayStart,
    timezoneOffset,
    now,
  };
}

export function startOfWeek (options) {
  if (options === null) {
    options = {};
  }
  let o = sanitizeOptions(options);

  return moment(o.now).startOf('week');
}

