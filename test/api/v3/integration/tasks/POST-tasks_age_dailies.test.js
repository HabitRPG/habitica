import moment from 'moment';
import {
  generateUser,
} from '../../../../helpers/api-integration/v3';

describe('POST /tasks/age-dailies', () => {
  let user, daily;

  beforeEach(async () => {
    user = await generateUser({
      'stats.gp': 100,
    });

    daily = await user.post('/tasks/user', {
      text: 'test daily',
      type: 'daily',
      startDate: moment(new Date()).subtract({days: 1}),
    });


    await user.update({
      yesterDailies: [daily._id],
    });
  });


  it('ages all dailies in the yesterDailies array', async () => {
    await user.sync();
    let hpBefore = user.stats.hp;
    expect(user.yesterDailies.length).to.eql(1);

    await user.post('/tasks/age-dailies');
    await user.sync();

    expect(user.yesterDailies.length).to.eql(0);
    expect(user.stats.hp).to.be.lessThan(hpBefore);
  });

  it.only('does less damage when checklists are completed', async () => {
    let daily2 = await user.post('/tasks/user', {
      text: 'test daily',
      type: 'daily',
      startDate: moment(new Date()).subtract({days: 1}),
    });
    await user.update({
      yesterDailies: [daily2._id],
    });
    let savedTask = await user.post(`/tasks/${daily2._id}/checklist`, {
      text: 'Checklist Item 1',
      ignored: false,
      _id: 123,
    });
    await user.post(`/tasks/${daily2._id}/checklist`, {
      text: 'Checklist Item 2',
      ignored: false,
      _id: 123,
    });

    expect(user.yesterDailies.length).to.eql(1);
    let hpBefore = user.stats.hp;
    await user.post('/tasks/age-dailies');
    await user.sync();
    expect(user.yesterDailies.length).to.eql(0);
    let hpDifference1 = hpBefore - user.stats.hp;

    let hpBefore2 = user.stats.hp;
    await user.update({
      yesterDailies: [daily2._id],
    });
    await user.post(`/tasks/${daily2._id}/checklist/${savedTask.checklist[0].id}/score`);
    await user.post('/tasks/age-dailies');
    await user.sync();
    let hpDifference2 = hpBefore2 - user.stats.hp;

    expect(hpDifference2).to.be.lessThan(hpDifference1);
  });

  it.only('resets checklist', async () => {
    let daily2 = await user.post('/tasks/user', {
      text: 'test daily',
      type: 'daily',
      startDate: moment(new Date()).subtract({days: 1}),
    });
    await user.update({
      yesterDailies: [daily2._id],
    });
    let savedTask = await user.post(`/tasks/${daily2._id}/checklist`, {
      text: 'Checklist Item 1',
      ignored: false,
      _id: 123,
    });
    savedTask = await user.post(`/tasks/${daily2._id}/checklist`, {
      text: 'Checklist Item 2',
      ignored: false,
      _id: 123,
    });
    await user.post(`/tasks/${daily2._id}/checklist/${savedTask.checklist[0].id}/score`);
    await user.post(`/tasks/${daily2._id}/checklist/${savedTask.checklist[1].id}/score`);
    let updatedTask = await user.get(`/tasks/${daily2._id}/`);
    expect(updatedTask.checklist[0].completed).to.be.true;
    expect(updatedTask.checklist[1].completed).to.be.true;

    expect(user.yesterDailies.length).to.eql(1);
    await user.post('/tasks/age-dailies');
    await user.sync();

    updatedTask = await user.get(`/tasks/${daily2._id}/`);
    expect(updatedTask.checklist[0].completed).to.be.false;
    expect(updatedTask.checklist[1].completed).to.be.false;
  });
});
