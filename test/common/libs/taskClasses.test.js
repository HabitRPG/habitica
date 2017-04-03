import taskClasses from '../../../website/common/script/libs/taskClasses';

describe('taskClasses', () => {
  let task = {};
  let filters = {};
  let result;

  describe('a todo task', () => {
    beforeEach(() => {
      task = { type: 'todo', _editing: false, tags: [] };
    });

    it('is hidden', () => {
      filters = { a: true };
      result = taskClasses(task, filters, 0, Number(new Date()), false, true);
      expect(result).to.eql('hidden');
    });
    it('is beingEdited', () => {
      task._editing = true;
      result = taskClasses(task, filters);
      expect(result.split(' ').indexOf('beingEdited')).to.not.eql(-1);
    });
    it('is completed', () => {
      task.completed = true;
      result = taskClasses(task, filters);
      expect(result.split(' ').indexOf('completed')).to.not.eql(-1);
      task.completed = false;
      result = taskClasses(task, filters);
      expect(result.split(' ').indexOf('completed')).to.eql(-1);
      expect(result.split(' ').indexOf('uncompleted')).to.not.eql(-1);
    });
  });

  describe('a daily task', () => {
    it('is completed', () => {
      task = { type: 'daily' };
      result = taskClasses(task);
      expect(result.split(' ').indexOf('completed')).to.not.eql(-1);
    });

    it('is uncompleted'); // this requires stubbing the internal dependency shouldDo in taskClasses
  });

  describe('a habit', () => {
    it('that is wide', () => {
      task = { type: 'habit', up: true, down: true };
      result = taskClasses(task);
      expect(result.split(' ').indexOf('habit-wide')).to.not.eql(-1);
    });
    it('that is narrow', () => {
      task = { type: 'habit' };
      result = taskClasses(task);
      expect(result.split(' ').indexOf('habit-narrow')).to.not.eql(-1);
    });
  });

  describe('varies based on priority', () => {
    it('trivial', () => {
      task.priority = 0.1;
      result = taskClasses(task);
      expect(result.split(' ').indexOf('difficulty-trivial')).to.not.eql(-1);
    });
    it('hard', () => {
      task.priority = 2;
      result = taskClasses(task);
      expect(result.split(' ').indexOf('difficulty-hard')).to.not.eql(-1);
    });
  });

  describe('varies based on value', () => {
    it('color-worst', () => {
      task.value = -30;
      result = taskClasses(task);
      expect(result.split(' ').indexOf('color-worst')).to.not.eql(-1);
    });
    it('color-neutral', () => {
      task.value = 0;
      result = taskClasses(task);
      expect(result.split(' ').indexOf('color-neutral')).to.not.eql(-1);
    });
  });
});
