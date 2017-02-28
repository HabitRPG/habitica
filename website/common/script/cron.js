// TODO what can be moved to /website/server?
/*
  ------------------------------------------------------
  Cron and time / day functions
  ------------------------------------------------------
 */
import defaults from 'lodash/defaults';
import invert from 'lodash/invert';
import moment from 'moment';
import 'moment-recur';

export const DAY_MAPPING = {
  0: 'su',
  1: 'm',
  2: 't',
  3: 'w',
  4: 'th',
  5: 'f',
  6: 's',
};

export const DAY_MAPPING_STRING_TO_NUMBER = invert(DAY_MAPPING);

/*
  Each time we perform date maths (cron, task-due-days, etc), we need to consider user preferences.
  Specifically {dayStart} (custom day start) and {timezoneOffset}. This function sanitizes / defaults those values.
  {now} is also passed in for various purposes, one example being the test scripts scripts testing different "now" times.
 */

function sanitizeOptions (o) {
  let ref = Number(o.dayStart || 0);
  let dayStart = !Number.isNaN(ref) && ref >= 0 && ref <= 24 ? ref : 0;

  let timezoneOffset;
  let timezoneOffsetDefault = Number(moment().zone());
  if (Number.isFinite(o.timezoneOffsetOverride)) {
    timezoneOffset = Number(o.timezoneOffsetOverride);
  } else if (Number.isFinite(o.timezoneOffset)) {
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

  return startOfDay(defaults({ now: o.now }, o)).diff(startOfDay(defaults({ now: yesterday }, o)), 'days');
}

/*
  Should the user do this task on this date, given the task's repeat options and user.preferences.dayStart?
 */

export function shouldDo (day, dailyTask) {
  if (dailyTask.type !== 'daily') {
    return false;
  }

  let daysOfTheWeek = [];

  if (dailyTask.repeat) {
    for (let [repeatDay, active] of Object.entries(dailyTask.repeat)) {
      if (active) daysOfTheWeek.push(parseInt(DAY_MAPPING_STRING_TO_NUMBER[repeatDay], 10));
    }
  }


  if (dailyTask.frequency === 'daily') {
    if (!dailyTask.everyX) return false; // error condition
    let schedule = moment(dailyTask.startDate).recur()
      .every(dailyTask.everyX).days();
    return schedule.matches(day);
  } else if (dailyTask.frequency === 'weekly') {
    let schedule = moment(dailyTask.startDate).recur();

    if (dailyTask.everyX > 1) {
      schedule = schedule.every(dailyTask.everyX).weeks();
    }

    schedule = schedule.every(daysOfTheWeek).daysOfWeek();

    return schedule.matches(day);
  } else if (dailyTask.frequency === 'monthly') {
    let schedule = moment(dailyTask.startDate).recur();

    let differenceInMonths = moment(day).month() + 1 - moment(dailyTask.startDate).month() + 1;
    let matchEveryX = differenceInMonths % dailyTask.everyX === 0;

    if (dailyTask.weeksOfMonth) {
      schedule = schedule.every(daysOfTheWeek).daysOfWeek()
                        .every(dailyTask.weeksOfMonth).weeksOfMonthByDay();
    } else if (dailyTask.daysOfMonth) {
      schedule = schedule.every(dailyTask.daysOfMonth).daysOfMonth();
    }

    return schedule.matches(day) && matchEveryX;
  } else if (dailyTask.frequency === 'yearly') {
    let schedule = moment(dailyTask.startDate).recur();

    schedule = schedule.every(dailyTask.everyX).years();

    return schedule.matches(day);
  }

  return false;
}
