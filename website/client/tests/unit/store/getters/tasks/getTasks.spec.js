import generateStore from '@/store';

describe('Store Getters for Tasks', () => {
  let store; let habits; let dailys; let todos; let
    rewards;

  beforeEach(() => {
    store = generateStore();
    // Get user preference data and user tasks order data
    store.state.user.data = {
      preferences: {},
      tasksOrder: {
        habits: [],
        dailys: [],
        todos: [],
        rewards: [],
      },
    };
  });

  describe('Task List', () => {
    beforeEach(() => {
      habits = [
        { id: 1 },
        { id: 2 },
      ];
      dailys = [
        { id: 3 },
        { id: 4 },
      ];
      todos = [
        { id: 5 },
        { id: 6 },
      ];
      rewards = [
        { id: 7 },
        { id: 8 },
      ];
      store.state.tasks.data = {
        habits,
        dailys,
        todos,
        rewards,
      };
    });

    it('should returns all tasks by task type', () => {
      let returnedTasks = store.getters['tasks:getUnfilteredTaskList']('habit');
      expect(returnedTasks).to.eq(habits);

      returnedTasks = store.getters['tasks:getUnfilteredTaskList']('daily');
      expect(returnedTasks).to.eq(dailys);

      returnedTasks = store.getters['tasks:getUnfilteredTaskList']('todo');
      expect(returnedTasks).to.eq(todos);

      returnedTasks = store.getters['tasks:getUnfilteredTaskList']('reward');
      expect(returnedTasks).to.eq(rewards);
    });
  });

  // @TODO add task filter check for rewards and dailys
  describe('Task Filters', () => {
    beforeEach(() => {
      habits = [
        // weak habit
        { value: 0 },
        // strong habit
        { value: 2 },
      ];
      todos = [
        // scheduled todos
        { completed: false, date: 'Mon, 15 Jan 2018 12:18:29 GMT' },
        // completed todos
        { completed: true },
      ];
      store.state.tasks.data = {
        habits,
        todos,
      };
    });

    it('should return weak habits', () => {
      const returnedTasks = store.getters['tasks:getFilteredTaskList']({
        type: 'habit',
        filterType: 'yellowred',
      });

      expect(returnedTasks[0]).to.eq(habits[0]);
    });

    it('should return strong habits', () => {
      const returnedTasks = store.getters['tasks:getFilteredTaskList']({
        type: 'habit',
        filterType: 'greenblue',
      });

      expect(returnedTasks[0]).to.eq(habits[1]);
    });

    it('should return scheduled todos', () => {
      const returnedTasks = store.getters['tasks:getFilteredTaskList']({
        type: 'todo',
        filterType: 'scheduled',
      });

      expect(returnedTasks[0]).to.eq(todos[0]);
    });

    it('should return completed todos', () => {
      const returnedTasks = store.getters['tasks:getFilteredTaskList']({
        type: 'todo',
        filterType: 'complete2',
      });

      expect(returnedTasks[0]).to.eq(todos[1]);
    });
  });
});
