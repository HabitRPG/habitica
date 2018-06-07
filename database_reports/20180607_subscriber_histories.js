import max from 'lodash/max';
import mean from 'lodash/mean';
import monk from 'monk';

/*
 * Output data on subscribers' task histories, formatted for CSV.
 * User ID,Count of Dailies,Count of Habits,Max History Size,Mean History Size,Median History Size
 */
const connectionString = 'mongodb://localhost:27017/habitrpg?auto_reconnect=true'; // FOR TEST DATABASE

let dbUsers = monk(connectionString).get('users', { castIds: false });
let dbTasks = monk(connectionString).get('tasks', { castIds: false });

function usersReport () {
  let allHistoryLengths = [];

  console.info('User ID,Count of Dailies,Count of Habits,Max History Size,Mean History Size,Median History Size');

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
  ).each((user) => {
    let historyLengths = [];
    let habitCount = 0;
    let dailyCount = 0;

    dbTasks.find(
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
      console.log(task._id);
      if (task.type === 'habit') {
        dataSummary.habitCount++;
      }
      if (task.type === 'daily') {
        dataSummary.dailyCount++;
      }
      allHistoryLengths.push(task.history.length);
      historyLengths.push(task.history.length);
    }).then(() => {
      const maxHistory = max(historyLengths);
      const meanHistory = mean(historyLengths);
      const medianHistory = median(historyLengths);
      console.info(`${user._id},${dailyCount},${habitCount},${maxHistory},${meanHistory},${medianHistory}`);
    });
  }).then(() => {
    console.info(`Largest History Size: ${max(allHistoryLengths)}`);
    console.info(`Mean of All History Sizes: ${mean(allHistoryLengths)}`);
    console.info(`Median of All History Sizes: ${median(allHistoryLengths)}`);
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
