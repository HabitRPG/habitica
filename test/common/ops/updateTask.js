import updateTask from '../../../website/common/script/ops/updateTask';
import {
  generateHabit,
} from '../../helpers/common.helper';

describe('shared.ops.updateTask', () => {
  it('updates a task', () => {
    let now = new Date();
    let habit = generateHabit({
      tags: [
        '123',
        '456',
      ],

      reminders: [{
        id: '123',
        startDate: now,
        time: now,
      }],
    });

    let [res] = updateTask(habit, {
      body: {
        text: 'updated',
        id: '123',
        _id: '123',
        shortName: 'short-name',
        type: 'todo',
        tags: ['678'],
        checklist: [{
          completed: false,
          text: 'item',
          id: '123',
        }],
      },
    });

    expect(res.id).to.not.equal('123');
    expect(res._id).to.not.equal('123');
    expect(res.type).to.equal('habit');
    expect(res.text).to.equal('updated');
    expect(res.shortName).to.eql('short-name');
    expect(res.checklist).to.eql([{
      completed: false,
      text: 'item',
      id: '123',
    }]);
    expect(res.reminders).to.eql([{
      id: '123',
      startDate: now,
      time: now,
    }]);
    expect(res.tags).to.eql(['678']);
  });
});
