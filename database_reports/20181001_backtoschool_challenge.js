import monk from 'monk';
import nconf from 'nconf';

/*
 * Output data on users who completed all the To-Do tasks in the 2018 Back-to-School Challenge.
 * User ID,Profile Name
 */
const CONNECTION_STRING = nconf.get('MIGRATION_CONNECT_STRING');
const CHALLENGE_ID = '0acb1d56-1660-41a4-af80-9259f080b62b';

let dbUsers = monk(CONNECTION_STRING).get('users', { castIds: false });
let dbTasks = monk(CONNECTION_STRING).get('tasks', { castIds: false });

function usersReport() {
  console.info('User ID,Profile Name');
  let userCount = 0;

  dbUsers.find(
    {challenges: CHALLENGE_ID},
    {fields:
      {_id: 1, 'profile.name': 1}
    },
  ).each((user, {close, pause, resume}) => {
    pause();
    userCount++;
    let completedTodos = 0;
    return dbTasks.find(
      {
        userId: user._id,
        'challenge.id': CHALLENGE_ID,
        type: 'todo',
      },
      {fields: {completed: 1}}
    ).each((task) => {
      if (task.completed) completedTodos++;
    }).then(() => {
      if (completedTodos >= 7) {
        console.info(`${user._id},${user.profile.name}`);
      }
      resume();
    });
  }).then(() => {
    console.info(`${userCount} users reviewed`);
    return process.exit(0);
  });
}

module.exports = usersReport;
