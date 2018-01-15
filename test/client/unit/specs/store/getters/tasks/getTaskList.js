import generateStore from 'client/store';

describe('Store Getters for Tasks', () => {
  let store, habits, dailys, todos, rewards;

  beforeEach(() => {
    store = generateStore();
  });

  describe('Unfiltered Task List', () => {
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
      let returnedTasks = store.getters['tasks:getTaskList']({ type: 'habit' });
      expect(returnedTasks).to.eq(habits);

      returnedTasks = store.getters['tasks:getTaskList']({ type: 'daily' });
      expect(returnedTasks).to.eq(dailys);

      returnedTasks = store.getters['tasks:getTaskList']({ type: 'todo' });
      expect(returnedTasks).to.eq(todos);

      returnedTasks = store.getters['tasks:getTaskList']({ type: 'reward' });
      expect(returnedTasks).to.eq(rewards);
    });

    it('should return provided task list if overrided', () => {
      let override = [
        { id: 99 },
        { id: 100 },
      ];
      let returnedTasks = store.getters['tasks:getTaskList']({
        type: 'habit',
        override,
      });
      expect(returnedTasks).to.eq(override);
      expect(returnedTasks).to.not.eq(habits);
    });
  });

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
      let returnedTasks = store.getters['tasks:getTaskList']({
        type: 'habit',
        filterType: { label: 'yellowred' },
      });

      expect(returnedTasks[0]).to.eq(habits[0]);
    });

    it('should return strong habits', () => {
      let returnedTasks = store.getters['tasks:getTaskList']({
        type: 'habit',
        filterType: { label: 'greenblue' },
      });

      expect(returnedTasks[0]).to.eq(habits[1]);
    });

    it('should return scheduled todos', () => {
      let returnedTasks = store.getters['tasks:getTaskList']({
        type: 'todo',
        filterType: { label: 'scheduled' },
      });

      expect(returnedTasks[0]).to.eq(todos[0]);
    });

    it('should return completed todos', () => {
      let returnedTasks = store.getters['tasks:getTaskList']({
        type: 'todo',
        filterType: { label: 'complete2' },
      });

      expect(returnedTasks[0]).to.eq(todos[1]);
    });
  });

  describe('Tag Filters', () => {
    beforeEach(() => {
      dailys = [
        { tags: [3, 4] },
        { tags: [2, 3] },
        { tags: [] },
        { tags: [1, 3] },
      ];
      store.state.tasks.data = {
        dailys,

      };
    });
    it('should return tasks with single tag', () => {
      let returnedTasks = store.getters['tasks:getTaskList']({
        type: 'daily',
        tagList: [3],
      });

      expect(returnedTasks[0]).to.eq(dailys[0]);
      expect(returnedTasks[1]).to.eq(dailys[1]);
      expect(returnedTasks[2]).to.eq(dailys[3]);
    });

    it('should only return tasks with all tags', () => {
      let returnedTasks = store.getters['tasks:getTaskList']({
        type: 'daily',
        tagList: [2, 3],
      });

      expect(returnedTasks[0]).to.eq(dailys[1]);
    });
  });

  describe('Search Filters', () => {
    beforeEach(() => {
      habits = [
        {
          text: 'Hello world 1',
          note: '',
          checklist: [],
        },
        {
          text: 'Hello world 2',
          note: '',
          checklist: [],
        },
        {
          text: 'Habit task title',
          note: '',
          checklist: [
            { text: 'Check 1' },
            { text: 'Check 2' },
            { text: 'Check 3' },
          ],
        },
        {
          text: 'Hello world 3',
          note: 'Habit task note',
          checklist: [
            { text: 'Checkitem 1' },
            { text: 'Checkitem 2' },
            { text: 'Checkitem 3' },
          ],
        },
      ];

      store.state.tasks.data = {
        habits,
      };
    });

    it('should return tasks with search term in title', () => {
      let returnedTasks = store.getters['tasks:getTaskList']({
        type: 'habit',
        searchText: 'TITLE',
      });
      expect(returnedTasks[0]).to.eq(habits[2]);
    });

    it('should return tasks with search term in note', () => {
      let returnedTasks = store.getters['tasks:getTaskList']({
        type: 'habit',
        searchText: 'NOTE',
      });

      expect(returnedTasks[0]).to.eq(habits[3]);
    });

    it('should return tasks with search term in checklist title', () => {
      let returnedTasks = store.getters['tasks:getTaskList']({
        type: 'habit',
        searchText: 'CHECK',
      });

      expect(returnedTasks[0]).to.eq(habits[2]);
      expect(returnedTasks[1]).to.eq(habits[3]);

      returnedTasks = store.getters['tasks:getTaskList']({
        type: 'habit',
        searchText: 'CHECKITEM',
      });

      expect(returnedTasks[0]).to.eq(habits[3]);
    });
  });
});
