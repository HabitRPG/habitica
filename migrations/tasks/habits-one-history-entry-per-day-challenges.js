/* eslint-disable import/no-commonjs */
// const migrationName = 'habits-one-history-entry-per-day';
// const authorName = 'paglias'; // in case script author needs to know when their ...
// const authorUuid = 'ed4c688c-6652-4a92-9d03-a5a79844174a'; // ... own data is done

/*
 * Iterates over all habits and condense multiple history entries for the same day into a single one
 */

const monk = require('monk'); // eslint-disable-line import/no-extraneous-dependencies
const _ = require('lodash');
const moment = require('moment');

const connectionString = 'mongodb://localhost:27017/habitrpg?auto_reconnect=true'; // FOR TEST DATABASE
const dbTasks = monk(connectionString).get('tasks', { castIds: false });

function processChallengeHabits (lastId) {
  const query = {
    'challenge.id': { $exists: true },
    userId: { $exists: false },
    type: 'habit',
  };

  if (lastId) {
    query._id = {
      $gt: lastId,
    };
  }

  dbTasks.find(query, {
    sort: { _id: 1 },
    limit: 500,
  })
    .then(updateChallengeHabits)
    .catch(err => {
      console.log(err);
      return exiting(1, `ERROR! ${err}`);
    });
}

const progressCount = 1000;
let count = 0;

function updateChallengeHabits (habits) {
  if (!habits || habits.length === 0) {
    console.warn('All appropriate challenge habits found and modified.');
    displayData();
    return null;
  }

  const habitsPromises = habits.map(updateChallengeHabit);
  const lastHabit = habits[habits.length - 1];

  return Promise.all(habitsPromises)
    .then(() => processChallengeHabits(lastHabit._id));
}

function updateChallengeHabit (habit) {
  count += 1;

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
      // group entries by aggregateBy
      .groupBy(entry => moment(entry.date).format('YYYYMMDD'))
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

  if (count % progressCount === 0) console.warn(`${count} habits processed`);
  return null;
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

export default processChallengeHabits;
