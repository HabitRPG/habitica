/* eslint-disable import/no-commonjs */
const migrationName = 'habits-one-history-entry-per-day';
const authorName = 'paglias'; // in case script author needs to know when their ...
const authorUuid = 'ed4c688c-6652-4a92-9d03-a5a79844174a'; // ... own data is done

/*
 * Iterates over all habits and condense multiple history entries for the same day into a single one
 */

const monk = require('monk'); // eslint-disable-line import/no-extraneous-dependencies
const _ = require('lodash');
const moment = require('moment');

const connectionString = 'mongodb://localhost:27017/habitrpg?auto_reconnect=true'; // FOR TEST DATABASE
const dbTasks = monk(connectionString).get('tasks', { castIds: false });
const dbUsers = monk(connectionString).get('users', { castIds: false });

function processUsers (lastId) {
  const query = {
    migration: { $ne: migrationName },
  };

  if (lastId) {
    query._id = {
      $gt: lastId,
    };
  }

  dbUsers.find(query, {
    sort: { _id: 1 },
    limit: 50, // just 50 users per time since we have to process all their habits as well
    fields: ['_id', 'preferences.timezoneOffset', 'preferences.dayStart'],
  })
    .then(updateUsers)
    .catch(err => {
      console.log(err);
      return exiting(1, `ERROR! ${err}`);
    });
}

const progressCount = 1000;
let count = 0;

function updateUsers (users) {
  if (!users || users.length === 0) {
    console.warn('All appropriate users and their tasks found and modified.');
    displayData();
    return null;
  }

  const usersPromises = users.map(updateUser);
  const lastUser = users[users.length - 1];

  return Promise.all(usersPromises)
    .then(() => processUsers(lastUser._id));
}

function updateHabit (habit, timezoneOffset, dayStart) {
  if (habit && habit.history && habit.history.length > 0) {
    // First remove missing entries
    habit.history = habit.history.filter(entry => Boolean(entry));

    habit.history = _.chain(habit.history)
      // processes all entries to identify an up or down score
      .forEach((entry, index) => {
        if (index === 0) { // first entry doesn't have a previous one
          // first value < 0 identifies a negative score as the first action
          entry.scoreDirection = entry.value >= 0 ? 'up' : 'down';
        } else {
          // could be missing if the previous entry was null and thus excluded
          const previousEntry = habit.history[index - 1];
          const previousValue = previousEntry.value;

          entry.scoreDirection = entry.value > previousValue ? 'up' : 'down';
        }
      })
      .groupBy(entry => { // group entries by aggregateBy
        const entryDate = moment(entry.date).zone(timezoneOffset || 0);
        if (entryDate.hour() < dayStart) entryDate.subtract(1, 'day');
        return entryDate.format('YYYYMMDD');
      })
      .toPairs() // [key, entry]
      .sortBy(([key]) => key) // sort by date
      .map(keyEntryPair => {
        const entries = keyEntryPair[1]; // 1 is entry, 0 is key
        let scoredUp = 0;
        let scoredDown = 0;

        entries.forEach(entry => {
          if (entry.scoreDirection === 'up') {
            scoredUp += 1;
          } else {
            scoredDown += 1;
          }

          // delete the unnecessary scoreDirection and scoreNotes prop
          delete entry.scoreDirection;
          delete entry.scoreNotes;
        });

        return {
          date: Number(entries[entries.length - 1].date), // keep last value
          value: entries[entries.length - 1].value, // keep last value,
          scoredUp,
          scoredDown,
        };
      })
      .value();

    return dbTasks.update({ _id: habit._id }, {
      $set: { history: habit.history },
    });
  }

  return null;
}

function updateUser (user) {
  count += 1;

  const { timezoneOffset } = user.preferences;
  const { dayStart } = user.preferences;

  if (count % progressCount === 0) console.warn(`${count} ${user._id}`);
  if (user._id === authorUuid) console.warn(`${authorName} being processed`);

  return dbTasks.find({
    type: 'habit',
    userId: user._id,
  })
    .then(habits => Promise.all(habits.map(habit => updateHabit(habit, timezoneOffset, dayStart))))
    .then(() => dbUsers.update({ _id: user._id }, {
      $set: { migration: migrationName },
    }))
    .catch(err => {
      console.log(err);
      return exiting(1, `ERROR! ${err}`);
    });
}

function displayData () {
  console.warn(`\n${count} tasks processed\n`);
  return exiting(0);
}

function exiting (code, msg) {
  // 0 = success
  code = code || 0; // eslint-disable-line no-param-reassign
  if (code && !msg) {
    msg = 'ERROR!'; // eslint-disable-line no-param-reassign
  }
  if (msg) {
    if (code) {
      console.error(msg);
    } else {
      console.log(msg);
    }
  }
  process.exit(code);
}

export default processUsers;
