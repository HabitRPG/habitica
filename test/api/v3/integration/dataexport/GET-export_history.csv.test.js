import {
  generateUser,
} from '../../../../helpers/api-v3-integration.helper';
import {
  updateDocument,
} from '../../../../helpers/mongo';
import moment from 'moment';

describe('GET /export/history.csv', () => {
  // TODO disabled because it randomly causes the build to fail
  xit('should return a valid CSV file with tasks history data', async () => {
    let user = await generateUser();
    let tasks = await user.post('/tasks/user', [
      {type: 'daily', text: 'daily 1'},
      {type: 'habit', text: 'habit 1'},
      {type: 'habit', text: 'habit 2'},
      {type: 'todo', text: 'todo 1'},
    ]);

    // to handle occasional inconsistency in task creation order
    tasks.sort(function (a, b) {
      return a.text.localeCompare(b.text);
    });

    // score all the tasks twice
    await user.post(`/tasks/${tasks[0]._id}/score/up`);
    await user.post(`/tasks/${tasks[1]._id}/score/up`);
    await user.post(`/tasks/${tasks[2]._id}/score/up`);
    await user.post(`/tasks/${tasks[3]._id}/score/up`);

    await user.post(`/tasks/${tasks[0]._id}/score/up`);
    await user.post(`/tasks/${tasks[1]._id}/score/up`);
    await user.post(`/tasks/${tasks[2]._id}/score/up`);
    await user.post(`/tasks/${tasks[3]._id}/score/up`);

    // adding an history entry to daily 1 manually because cron didn't run yet
    await updateDocument('tasks', tasks[0], {
      history: [{value: 3.2, date: Number(new Date())}],
    });

    // get updated tasks
    tasks = await Promise.all(tasks.map(task => {
      return user.get(`/tasks/${task._id}`);
    }));

    let res = await user.get('/export/history.csv');
    let splitRes = res.split('\n');

    expect(splitRes[0]).to.equal('Task Name,Task ID,Task Type,Date,Value');
    expect(splitRes[1]).to.equal(`daily 1,${tasks[0]._id},daily,${moment(tasks[0].history[0].date).format('YYYY-MM-DD HH:mm:ss')},${tasks[0].history[0].value}`);
    expect(splitRes[2]).to.equal(`habit 1,${tasks[1]._id},habit,${moment(tasks[1].history[0].date).format('YYYY-MM-DD HH:mm:ss')},${tasks[1].history[0].value}`);
    expect(splitRes[3]).to.equal(`habit 1,${tasks[1]._id},habit,${moment(tasks[1].history[1].date).format('YYYY-MM-DD HH:mm:ss')},${tasks[1].history[1].value}`);
    expect(splitRes[4]).to.equal(`habit 2,${tasks[2]._id},habit,${moment(tasks[2].history[0].date).format('YYYY-MM-DD HH:mm:ss')},${tasks[2].history[0].value}`);
    expect(splitRes[5]).to.equal(`habit 2,${tasks[2]._id},habit,${moment(tasks[2].history[1].date).format('YYYY-MM-DD HH:mm:ss')},${tasks[2].history[1].value}`);
    expect(splitRes[6]).to.equal('');
  });
});
