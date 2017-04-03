import {
  createAndPopulateGroup,
  translate as t,
} from '../../../../../../helpers/api-integration/v3';
import { v4 as generateUUID } from 'uuid';

describe('DELETE group /tasks/:taskId/checklist/:itemId', () => {
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

  it('deletes a checklist item', async () => {
    task = await user.post(`/tasks/group/${guild._id}`, {
      type: 'daily',
      text: 'Daily with checklist',
    });

    let savedTask = await user.post(`/tasks/${task._id}/checklist`, {text: 'Checklist Item 1', completed: false});

    await user.del(`/tasks/${task._id}/checklist/${savedTask.checklist[0].id}`);
    savedTask = await user.get(`/tasks/group/${guild._id}`);

    expect(savedTask[0].checklist.length).to.equal(0);
  });

  it('does not work with habits', async () => {
    let habit = await user.post(`/tasks/group/${guild._id}`, {
      type: 'habit',
      text: 'habit with checklist',
    });

    await expect(user.del(`/tasks/${habit._id}/checklist/${generateUUID()}`)).to.eventually.be.rejected.and.eql({
      code: 400,
      error: 'BadRequest',
      message: t('checklistOnlyDailyTodo'),
    });
  });

  it('does not work with rewards', async () => {
    let reward = await user.post(`/tasks/group/${guild._id}`, {
      type: 'reward',
      text: 'reward with checklist',
    });

    await expect(user.del(`/tasks/${reward._id}/checklist/${generateUUID()}`)).to.eventually.be.rejected.and.eql({
      code: 400,
      error: 'BadRequest',
      message: t('checklistOnlyDailyTodo'),
    });
  });

  it('fails on task not found', async () => {
    await expect(user.del(`/tasks/${generateUUID()}/checklist/${generateUUID()}`)).to.eventually.be.rejected.and.eql({
      code: 404,
      error: 'NotFound',
      message: t('taskNotFound'),
    });
  });

  it('fails on checklist item not found', async () => {
    let createdTask = await user.post(`/tasks/group/${guild._id}`, {
      type: 'daily',
      text: 'daily with checklist',
    });

    await expect(user.del(`/tasks/${createdTask._id}/checklist/${generateUUID()}`)).to.eventually.be.rejected.and.eql({
      code: 404,
      error: 'NotFound',
      message: t('checklistItemNotFound'),
    });
  });
});
