import max from 'lodash/max';
import mean from 'lodash/mean';
import monk from 'monk';
import round from 'lodash/round';
import sum from 'lodash/sum';

/*
 * Output data on subscribers' task histories, formatted for CSV.
 * User ID,Count of Dailies,Count of Habits,Total History Size,Max History Size,Mean History Size,Median History Size
 */
const connectionString = 'mongodb://localhost:27017/habitrpg?auto_reconnect=true'; // FOR TEST DATABASE

let dbUsers = monk(connectionString).get('users', { castIds: false });
let dbTasks = monk(connectionString).get('tasks', { castIds: false });

function usersReport () {
  let allHistoryLengths = [];

  console.info('User ID,Count of Dailies,Count of Habits,Total History Size,Max History Size,Mean History Size,Median History Size');

  dbUsers.find(
    {
      $and:
        [
          {'purchased.plan.planId': {$ne:null}},
          {'purchased.plan.planId': {$ne:''}},
        ],
      $or:
        [
          {'purchased.plan.dateTerminated': null},
          {'purchased.plan.dateTerminated': ''},
          {'purchased.plan.dateTerminated': {$gt:new Date()}},
        ],
    },
    {
      fields: {_id: 1},
    }
  ).each((user, {close, pause, resume}) => {
    let historyLengths = [];
    let habitCount = 0;
    let dailyCount = 0;

    pause();
    return dbTasks.find(
      {
        userId: user._id,
        $or:
          [
            {type: 'habit'},
            {type: 'daily'},
          ],
      },
      {
        fields: {
          type: 1,
          history: 1,
        },
      }
    ).each((task) => {
      if (task.type === 'habit') {
        habitCount++;
      }
      if (task.type === 'daily') {
        dailyCount++;
      }
      if (task.history.length > 0) {
        allHistoryLengths.push(task.history.length);
        historyLengths.push(task.history.length);
      }
    }).then(() => {
      const totalHistory = sum(historyLengths);
      const maxHistory = historyLengths.length > 0 ? max(historyLengths) : 0;
      const meanHistory = historyLengths.length > 0 ? round(mean(historyLengths)) : 0;
      const medianHistory = historyLengths.length > 0 ? median(historyLengths) : 0;
      console.info(`${user._id},${dailyCount},${habitCount},${totalHistory},${maxHistory},${meanHistory},${medianHistory}`);
      resume();
    });
  }).then(() => {
    console.info(`Total Subscriber History Entries: ${sum(allHistoryLengths)}`);
    console.info(`Largest History Size: ${max(allHistoryLengths)}`);
    console.info(`Mean History Size: ${round(mean(allHistoryLengths))}`);
    console.info(`Median History Size: ${median(allHistoryLengths)}`);
    return process.exit(0);
  });
}

function median(values) { // https://gist.github.com/caseyjustus/1166258
  values.sort( function(a,b) {return a - b;} );

  var half = Math.floor(values.length/2);

  if (values.length % 2) {
    return values[half];
  }
  else {
    return (values[half-1] + values[half]) / 2.0;
  }
}

module.exports = usersReport;
