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
import subscriptionBlocks from './content/subscriptionBlocks';

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
  Specifically {dayStart} (custom day start) and {timezoneOffset}.
  This function sanitizes / defaults those values.
  {now} is also passed in for various purposes,
  one example being the test scripts scripts testing different "now" times.
 */

function sanitizeOptions (o) {
  const ref = Number(o.dayStart || 0);
  const dayStart = !Number.isNaN(ref) && ref >= 0 && ref <= 24 ? ref : 0;

  let timezoneUtcOffset;
  const timezoneUtcOffsetDefault = moment().utcOffset();

  if (Number.isFinite(o.timezoneUtcOffset)) {
    // Options were already sanitized
    timezoneUtcOffset = o.timezoneUtcOffset;
  } else if (Number.isFinite(o.timezoneUtcOffsetOverride)) {
    timezoneUtcOffset = o.timezoneUtcOffsetOverride;
  } else if (Number.isFinite(o.timezoneOffset)) {
    timezoneUtcOffset = -o.timezoneOffset;
  } else {
    timezoneUtcOffset = timezoneUtcOffsetDefault;
  }
  if (timezoneUtcOffset < -720 || timezoneUtcOffset > 840) {
    // timezones range from -12 (offset -720) to +14 (offset 840)
    timezoneUtcOffset = timezoneUtcOffsetDefault;
  }

  const now = moment(o.now).utcOffset(timezoneUtcOffset);
  // return a new object, we don't want to add "now" to user object
  return {
    dayStart,
    timezoneUtcOffset,
    now,
  };
}

export function startOfWeek (options = {}) {
  const o = sanitizeOptions(options);

  return moment(o.now).startOf('week');
}

/*
  This is designed for use with any date that has an important time portion
  (e.g., when comparing the current date-time with the previous cron's date-time
   for determining if cron should run now).
  It changes the time portion of the date-time to be the Custom Day Start hour,
  so that the date-time is now the user's correct start of day.
  It SUBTRACTS a day if the date-time's original hour is before CDS
  (e.g., if your CDS is 5am and it's currently 4am, it's still the previous day).
  This is NOT suitable for manipulating any dates that are displayed to the user
  as a date with no time portion, such as a Daily's Start Dates
  (e.g., a Start Date of today shows only the date,
  so it should be considered to be today even if the hidden time portion is before CDS).
 */

export function startOfDay (options = {}) {
  const o = sanitizeOptions(options);
  const dayStart = moment(o.now).startOf('day').add({ hours: o.dayStart });

  if (o.now.hour() < o.dayStart) {
    dayStart.subtract({ days: 1 });
  }

  return dayStart;
}

/*
  Absolute diff from "yesterday" till now
 */

export function daysSince (yesterday, options = {}) {
  const o = sanitizeOptions(options);
  const startOfNow = startOfDay(defaults({ now: o.now }, o));
  const startOfYesterday = startOfDay(defaults({ now: yesterday }, o));

  return startOfNow.diff(startOfYesterday, 'days');
}

/*
  Should the user do this task on this date,
  given the task's repeat options and user.preferences.dayStart?
 */

export function shouldDo (day, dailyTask, options = {}) {
  if (dailyTask.type !== 'daily' || dailyTask.startDate === null || dailyTask.everyX < 1 || dailyTask.everyX > 9999) {
    return false;
  }
  const o = sanitizeOptions(options);
  const startOfDayWithCDSTime = startOfDay(defaults({ now: day }, o));

  // The time portion of the Start Date is never visible to
  // or modifiable by the user so we must ignore it.
  // Therefore, we must also ignore the time portion of the user's day start
  // (startOfDayWithCDSTime), otherwise the date comparison will be wrong for some times.
  // NB: The user's day start date has already been converted to the PREVIOUS
  // day's date if the time portion was before CDS.

  const startDate = moment(dailyTask.startDate).utcOffset(o.timezoneUtcOffset).startOf('day');

  if (startDate > startOfDayWithCDSTime.startOf('day') && !options.nextDue) {
    return false; // Daily starts in the future
  }

  const daysOfTheWeek = [];
  if (dailyTask.repeat) {
    for (const [repeatDay, active] of Object.entries(dailyTask.repeat)) {
      if (!Number.isFinite(parseInt(DAY_MAPPING_STRING_TO_NUMBER[repeatDay], 10))) continue; // eslint-disable-line no-continue, max-len
      if (active) daysOfTheWeek.push(parseInt(DAY_MAPPING_STRING_TO_NUMBER[repeatDay], 10));
    }
  }

  if (dailyTask.frequency === 'daily') {
    if (!dailyTask.everyX) return false; // error condition
    const schedule = moment(startDate).recur()
      .every(dailyTask.everyX).days();

    if (options.nextDue) {
      const filteredDates = [];
      for (let i = 1; filteredDates.length < 6; i += 1) {
        const calcDate = moment(startDate).add(dailyTask.everyX * i, 'days');
        if (calcDate > startOfDayWithCDSTime) filteredDates.push(calcDate);
      }
      return filteredDates;
    }

    return schedule.matches(startOfDayWithCDSTime);
  } if (dailyTask.frequency === 'weekly') {
    let schedule = moment(startDate).recur();

    const differenceInWeeks = moment(startOfDayWithCDSTime).diff(moment(startDate), 'week');
    const matchEveryX = differenceInWeeks % dailyTask.everyX === 0;

    if (daysOfTheWeek.length === 0) return false;
    schedule = schedule.every(daysOfTheWeek).daysOfWeek();
    if (options.nextDue) {
      const filteredDates = [];
      for (let i = 0; filteredDates.length < 6; i += 1) {
        for (let j = 0; j < daysOfTheWeek.length && filteredDates.length < 6; j += 1) {
          const calcDate = moment(startDate).day(daysOfTheWeek[j]).add(dailyTask.everyX * i, 'weeks');
          if (calcDate > startOfDayWithCDSTime) filteredDates.push(calcDate);
        }
      }
      const sortedDates = filteredDates.sort((date1, date2) => {
        if (date1.toDate() > date2.toDate()) return 1;
        if (date2.toDate() > date1.toDate()) return -1;
        return 0;
      });
      return sortedDates;
    }

    return schedule.matches(startOfDayWithCDSTime) && matchEveryX;
  } if (dailyTask.frequency === 'monthly') {
    let schedule = moment(startDate).recur();

    // Use startOf to ensure that we are always comparing month
    // to the next rather than a month from the day
    const differenceInMonths = moment(startOfDayWithCDSTime).startOf('month')
      .diff(moment(startDate).startOf('month'), 'month', true);

    const matchEveryX = differenceInMonths % dailyTask.everyX === 0;

    if (dailyTask.weeksOfMonth && dailyTask.weeksOfMonth.length > 0) {
      if (daysOfTheWeek.length === 0) return false;
      schedule = schedule.every(daysOfTheWeek).daysOfWeek()
        .every(dailyTask.weeksOfMonth).weeksOfMonthByDay();

      if (options.nextDue) {
        const filteredDates = [];
        for (let i = 1; filteredDates.length < 6; i += 1) {
          const recurDate = moment(startDate).add(dailyTask.everyX * i, 'months');
          const calcDate = recurDate.clone();
          calcDate.day(daysOfTheWeek[0]);

          const startDateWeek = Math.ceil(moment(startDate).date() / 7);
          let calcDateWeek = Math.ceil(calcDate.date() / 7);

          // adjust week since weeks will rollover to other months
          if (calcDate.month() < recurDate.month()) calcDate.add(1, 'weeks');
          else if (calcDate.month() > recurDate.month()) calcDate.subtract(1, 'weeks');
          else if (calcDateWeek > startDateWeek) calcDate.subtract(1, 'weeks');
          else if (calcDateWeek < startDateWeek) calcDate.add(1, 'weeks');

          calcDateWeek = Math.ceil(calcDate.date() / 7);

          if (
            calcDate >= startOfDayWithCDSTime
            && calcDateWeek === startDateWeek
            && calcDate.month() === recurDate.month()
          ) filteredDates.push(calcDate);
        }
        return filteredDates;
      }

      return schedule.matches(startOfDayWithCDSTime) && matchEveryX;
    } if (dailyTask.daysOfMonth && dailyTask.daysOfMonth.length > 0) {
      schedule = schedule.every(dailyTask.daysOfMonth).daysOfMonth();
      if (options.nextDue) {
        const filteredDates = [];
        for (let i = 1; filteredDates.length < 6; i += 1) {
          const calcDate = moment(startDate).add(dailyTask.everyX * i, 'months');
          if (calcDate >= startOfDayWithCDSTime) filteredDates.push(calcDate);
        }
        return filteredDates;
      }
    }

    return schedule.matches(startOfDayWithCDSTime) && matchEveryX;
  } if (dailyTask.frequency === 'yearly') {
    let schedule = moment(startDate).recur();

    schedule = schedule.every(dailyTask.everyX).years();

    if (options.nextDue) {
      const filteredDates = [];
      for (let i = 1; filteredDates.length < 6; i += 1) {
        const calcDate = moment(startDate).add(dailyTask.everyX * i, 'years');
        if (calcDate > startOfDayWithCDSTime) filteredDates.push(calcDate);
      }
      return filteredDates;
    }

    return schedule.matches(startOfDayWithCDSTime);
  }
  return false;
}

export function getPlanMonths (plan) {
  // NB gift subscriptions don't have a planID
  // (which doesn't matter because we don't need to reapply perks
  // for them and by this point they should have expired anyway)
  if (!plan.planId) return 1;
  const planIdRegExp = new RegExp('_([0-9]+)mo'); // e.g., matches 'google_6mo' / 'basic_12mo' and captures '6' / '12'
  const match = plan.planId.match(planIdRegExp);
  if (match !== null && match[0] !== null) {
    // 3 for 3-month recurring subscription, etc
    return match[1]; // eslint-disable-line prefer-destructuring
  }

  return 1;
}

/*
 * This is a helper method to get all the needed informations of the plan
 *
 * currently used in cron and the "next hourglass in" feature
 */
export function getPlanContext (user, now) {
  const { plan } = user.purchased;

  defaults(plan.consecutive, {
    count: 0, offset: 0, trinkets: 0, gemCapExtra: 0,
  });

  const nowMoment = moment(now);

  const subscriptionEndDate = moment(plan.dateTerminated).isBefore()
    ? moment(plan.dateTerminated).startOf('month')
    : nowMoment.startOf('month');
  const dateUpdatedMoment = moment(plan.dateUpdated).startOf('month');
  const elapsedMonths = moment(subscriptionEndDate).diff(dateUpdatedMoment, 'months');

  const planMonths = subscriptionBlocks[plan.planId] ? subscriptionBlocks[plan.planId].months : 1;
  let monthsTillNextHourglass;
  if (planMonths > 1) {
    monthsTillNextHourglass = plan.consecutive.offset + 1;
  } else {
    monthsTillNextHourglass = 3 - plan.perkMonthCount;
  }

  const possibleNextHourglassDate = moment(plan.dateUpdated)
    .add(monthsTillNextHourglass, 'months');

  return {
    plan,
    subscriptionEndDate,
    dateUpdatedMoment,
    elapsedMonths,
    offset: plan.consecutive.offset, // months until the new hourglass is added
    nextHourglassDate: possibleNextHourglassDate,
  };
}
