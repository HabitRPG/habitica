// TODO what can be moved to /website/server?
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

  let timezoneOffset;
  let timezoneOffsetDefault = Number(moment().zone());
  if (_.isFinite(o.timezoneOffsetOverride)) {
    timezoneOffset = Number(o.timezoneOffsetOverride);
  } else if (_.isFinite(o.timezoneOffset)) {
    timezoneOffset = Number(o.timezoneOffset);
  } else {
    timezoneOffset = timezoneOffsetDefault;
  }
  if (timezoneOffset > 720 || timezoneOffset < -840) {
    // timezones range from -12 (offset +720) to +14 (offset -840)
    timezoneOffset = timezoneOffsetDefault;
  }

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

function _lastCompletedCheck (dailyHistory) {
  _.reverse(dailyHistory); // Work in reverse chronological order
  let nextIndex = 1;
  for (let entry of dailyHistory) {
    if (!dailyHistory[nextIndex]) {
      return false; // History is empty or value static throughout; Daily was never completed or failed
    }
    if (entry.value < dailyHistory[nextIndex].value) {
      return false; // We've found a value lower than the next older one in dailyHistory; Daily was failed
    } else if (entry.value > dailyHistory[nextIndex].value) {
      return true; // We've found a value higher than the next older one in dailyHistory; Daily was completed
    } else nextIndex++; // Values are equal; Daily was skipped that day. Keep looking
  }
}

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
  let frequency = dailyTask.frequency;
  let activeUntilCompleted = dailyTask.activeUntilCompleted || false;

  if (frequency === 'daily') { // "Every X Intervals"
    if (!dailyTask.everyX) {
      return false; // error condition
    }
    let intervalUnit = dailyTask.intervalUnit || 'days';
    let intervalsSinceTaskStart = startOfDayWithCDSTime.startOf('day').diff(taskStartDate, intervalUnit);

    if (intervalsSinceTaskStart % dailyTask.everyX === 0) {
      return true;
    } else if (activeUntilCompleted) {
      return _lastCompletedCheck(dailyTask.history);
    } else {
      return false;
    }
  /* } else if (frequency === 'sinceCompletion') {
  } else if (frequency === 'timesInInterval') { */
  } else if (frequency === 'weekly') { // "On Certain Days of the Week"
    if (!dailyTask.repeat) {
      return false; // error condition
    }
    let dayOfWeekNum = startOfDayWithCDSTime.day(); // e.g., 0 for Sunday

    return dailyTask.repeat[DAY_MAPPING[dayOfWeekNum]];
  } else {
    return false; // error condition - unexpected frequency string
  }
}
