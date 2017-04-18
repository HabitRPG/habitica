import taskDefaults from '../../../website/common/script/libs/taskDefaults';

describe('taskDefaults', () => {
  it('applies defaults to undefined type or habit', () => {
    let task = taskDefaults();
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
    let task = taskDefaults({ type: 'daily' });
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
    let task = taskDefaults({ type: 'reward' });
    expect(task.type).to.eql('reward');
    expect(task._id).to.exist;
    expect(task.text).to.eql(task._id);
    expect(task.tags).to.eql([]);
    expect(task.value).to.eql(10);
    expect(task.priority).to.eql(1);
  });

  it('applies defaults a todo', () => {
    let task = taskDefaults({ type: 'todo' });
    expect(task.type).to.eql('todo');
    expect(task._id).to.exist;
    expect(task.text).to.eql(task._id);
    expect(task.tags).to.eql([]);
    expect(task.value).to.eql(0);
    expect(task.priority).to.eql(1);
    expect(task.completed).to.eql(false);
  });
});
