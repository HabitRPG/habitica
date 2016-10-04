import {
  createAndPopulateGroup,
  translate as t,
} from '../../../../../../helpers/api-integration/v3';
import { v4 as generateUUID } from 'uuid';

describe('POST group /tasks/:taskId/checklist/', () => {
  let user, guild, task;

  before(async () => {
    let {group, groupLeader} = await createAndPopulateGroup({
      groupDetails: {
        name: 'Test Guild',
        type: 'guild',
      },
      members: 2,
    });

    guild = group;
    user = groupLeader;
  });

  it('adds a checklist item to a task', async () => {
    task = await user.post(`/tasks/group/${guild._id}`, {
      type: 'daily',
      text: 'Daily with checklist',
    });

    await user.post(`/tasks/${task._id}/checklist`, {
      text: 'Checklist Item 1',
      ignored: false,
      _id: 123,
    });

    let updatedTasks = await user.get(`/tasks/group/${guild._id}`);
    let updatedTask = updatedTasks[0];

    expect(updatedTask.checklist.length).to.equal(1);
    expect(updatedTask.checklist[0].text).to.equal('Checklist Item 1');
    expect(updatedTask.checklist[0].completed).to.equal(false);
    expect(updatedTask.checklist[0].id).to.be.a('string');
    expect(updatedTask.checklist[0].id).to.not.equal('123');
    expect(updatedTask.checklist[0].ignored).to.be.an('undefined');
  });

  it('does not add a checklist to habits', async () => {
    let habit = await user.post(`/tasks/group/${guild._id}`, {
      type: 'habit',
      text: 'habit with checklist',
    });

    await expect(user.post(`/tasks/${habit._id}/checklist`, {
      text: 'Checklist Item 1',
    })).to.eventually.be.rejected.and.eql({
      code: 400,
      error: 'BadRequest',
      message: t('checklistOnlyDailyTodo'),
    });
  });

  it('does not add a checklist to rewards', async () => {
    let reward = await user.post(`/tasks/group/${guild._id}`, {
      type: 'reward',
      text: 'reward with checklist',
    });

    await expect(user.post(`/tasks/${reward._id}/checklist`, {
      text: 'Checklist Item 1',
    })).to.eventually.be.rejected.and.eql({
      code: 400,
      error: 'BadRequest',
      message: t('checklistOnlyDailyTodo'),
    });
  });

  it('fails on task not found', async () => {
    await expect(user.post(`/tasks/${generateUUID()}/checklist`, {
      text: 'Checklist Item 1',
    })).to.eventually.be.rejected.and.eql({
      code: 404,
      error: 'NotFound',
      message: t('taskNotFound'),
    });
  });
});
