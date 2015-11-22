/*
  ------------------------------------------------------
  Cron and time / day functions
  ------------------------------------------------------
 */
import _ from 'lodash';
import moment from 'moment';

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

function sanitizeOptions (o) {
  let ref = Number(o.dayStart || 0);
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

export function startOfWeek (options = {}) {
  let o = sanitizeOptions(options);

  return moment(o.now).startOf('week');
}

/*
  This is designed for use with any date that has an important time portion (e.g., when comparing the current date-time with the previous cron's date-time for determing if cron should run now).
  It changes the time portion of the date-time to be the Custom Day Start hour, so that the date-time is now the user's correct start of day.
  It SUBTRACTS a day if the date-time's original hour is before CDS (e.g., if your CDS is 5am and it's currently 4am, it's still the previous day).
  This is NOT suitable for manipulating any dates that are displayed to the user as a date with no time portion, such as a Daily's Start Dates (e.g., a Start Date of today shows only the date, so it should be considered to be today even if the hidden time portion is before CDS).
 */

export function startOfDay (options = {}) {
  let o = sanitizeOptions(options);
  let dayStart = moment(o.now).startOf('day').add({ hours: o.dayStart });

  if (moment(o.now).hour() < o.dayStart) {
    dayStart.subtract({ days: 1 });
  }
  return dayStart;
}

/*
  Absolute diff from "yesterday" till now
 */

export function daysSince (yesterday, options = {}) {
  let o = sanitizeOptions(options);

  return startOfDay(_.defaults({ now: o.now }, o)).diff(startOfDay(_.defaults({ now: yesterday }, o)), 'days');
}

/*
  Should the user do this task on this date, given the task's repeat options and user.preferences.dayStart?
 */

export function shouldDo (day, dailyTask, options = {}) {
  if (dailyTask.type !== 'daily') {
    return false;
  }
  let o = sanitizeOptions(options);
  let startOfDayWithCDSTime = startOfDay(_.defaults({ now: day }, o));

  // The time portion of the Start Date is never visible to or modifiable by the user so we must ignore it.
  // Therefore, we must also ignore the time portion of the user's day start (startOfDayWithCDSTime), otherwise the date comparison will be wrong for some times.
  // NB: The user's day start date has already been converted to the PREVIOUS day's date if the time portion was before CDS.
  let taskStartDate = moment(dailyTask.startDate).zone(o.timezoneOffset);

  taskStartDate = moment(taskStartDate).startOf('day');
  if (taskStartDate > startOfDayWithCDSTime.startOf('day')) {
    return false; // Daily starts in the future
  }
  if (dailyTask.frequency === 'daily') { // "Every X Days"
    if (!dailyTask.everyX) {
      return false; // error condition
    }
    let daysSinceTaskStart = startOfDayWithCDSTime.startOf('day').diff(taskStartDate, 'days');

    return daysSinceTaskStart % dailyTask.everyX === 0;
  } else if (dailyTask.frequency === 'weekly') { // "On Certain Days of the Week"
    if (!dailyTask.repeat) {
      return false; // error condition
    }
    let dayOfWeekNum = startOfDayWithCDSTime.day(); // e.g., 0 for Sunday

    return dailyTask.repeat[DAY_MAPPING[dayOfWeekNum]];
  } else {
    return false; // error condition - unexpected frequency string
  }
}


/*
  Preen history for users with > 7 history entries
  This takes an infinite array of single day entries [day day day day day...], and turns it into a condensed array of averages, condensing more the further back in time we go.
  Eg, 7 entries each for last 7 days; 1 entry each week of this month; 1 entry for each month of this year; 1 entry per previous year: [day*7 week*4 month*12 year*infinite]
 */

export function preenHistory (history) {
  // 'export' is temporary pending further refactoring
  history = _.filter(history, function discardNulls (h) {
    return Boolean(h); // nulls are from corruption somehow - TODO is this still needed?
  });
  let newHistory = [];

  function preen (amount, groupBy) {
    let groups = _.chain(history).groupBy(function getDateGroupings (h) {
      return moment(h.date).format(groupBy);
    }).sortBy(function sortByDate (h, k) {
      return k;
    }).value(); // turn into an array

    groups = groups.slice(-amount);
    groups.pop(); // get rid of 'this week', 'this month', etc (except for case of days)
    return _.each(groups, function recreateHistory (group) {
      newHistory.push({
        date: moment(group[0].date).toDate(),
        value: _.reduce(group, function makeAverage (m, obj) {
          return m + obj.value;
        }, 0) / group.length,
      });
      return true;
    });
  }

  // Keep the last:
  preen(50, 'YYYY'); // 50 years (habit will toootally be around that long!)
  preen(moment().format('MM'), 'YYYYMM'); // last MM months (eg, if today is 05, keep the last 5 months)
  // Then keep all days of this month. Note, the extra logic is to account for Habits, which can be counted multiple times per day
  // FIXME I'd rather keep 1-entry/week of this month, then last 'd' days in this week. However, I'm having issues where the 1st starts mid week
  let thisMonth = moment().format('YYYYMM');

  newHistory = newHistory.concat(_.filter(history, function keepThisMonthsData (h) {
    return moment(h.date).format('YYYYMM') === thisMonth;
  }));
  return newHistory;
}
