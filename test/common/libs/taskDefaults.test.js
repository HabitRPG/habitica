import moment from 'moment';

import taskDefaults from '../../../website/common/script/libs/taskDefaults';
import getUtcOffset from '../../../website/common/script/fns/getUtcOffset';
import { generateUser } from '../../helpers/common.helper';

describe('taskDefaults', () => {
  it('applies defaults to undefined type or habit', () => {
    const task = taskDefaults({}, generateUser());
    expect(task.type).to.eql('habit');
    expect(task._id).to.exist;
    expect(task.text).to.eql(task._id);
    expect(task.tags).to.eql([]);
    expect(task.value).to.eql(0);
    expect(task.priority).to.eql(1);
    expect(task.up).to.eql(true);
    expect(task.down).to.eql(true);
    expect(task.history).to.eql([]);
    expect(task.frequency).to.equal('daily');
    expect(task.counterUp).to.equal(0);
    expect(task.counterDown).to.equal(0);
  });

  it('applies defaults to a daily', () => {
    const task = taskDefaults({ type: 'daily' }, generateUser());
    expect(task.type).to.eql('daily');
    expect(task._id).to.exist;
    expect(task.text).to.eql(task._id);
    expect(task.tags).to.eql([]);
    expect(task.value).to.eql(0);
    expect(task.priority).to.eql(1);
    expect(task.history).to.eql([]);
    expect(task.completed).to.eql(false);
    expect(task.streak).to.eql(0);
    expect(task.repeat).to.eql({
      m: true,
      t: true,
      w: true,
      th: true,
      f: true,
      s: true,
      su: true,
    });
    expect(task.frequency).to.eql('weekly');
    expect(task.startDate).to.exist;
  });

  it('applies defaults a reward', () => {
    const task = taskDefaults({ type: 'reward' }, generateUser());
    expect(task.type).to.eql('reward');
    expect(task._id).to.exist;
    expect(task.text).to.eql(task._id);
    expect(task.tags).to.eql([]);
    expect(task.value).to.eql(10);
    expect(task.priority).to.eql(1);
  });

  it('applies defaults a todo', () => {
    const task = taskDefaults({ type: 'todo' }, generateUser());
    expect(task.type).to.eql('todo');
    expect(task._id).to.exist;
    expect(task.text).to.eql(task._id);
    expect(task.tags).to.eql([]);
    expect(task.value).to.eql(0);
    expect(task.priority).to.eql(1);
    expect(task.completed).to.eql(false);
  });

  it('starts a task yesterday if user cron is later today', () => {
    // Configure to have a day start that's *always* tomorrow.
    const user = generateUser({ 'preferences.dayStart': 25 });
    const task = taskDefaults({ type: 'daily' }, user);

    expect(task.startDate).to.eql(
      moment()
        .utcOffset(getUtcOffset(user))
        .startOf('day')
        .subtract(1, 'day')
        .toDate(),
    );
  });
});
