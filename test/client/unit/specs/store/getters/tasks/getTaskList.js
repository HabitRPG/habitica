import generateStore from 'client/store';

// helper functions
// import shuffle from 'lodash/shuffle';

// Library / Utility Function
// import { orderSingleTypeTasks } from 'client/libs/store/helpers/orderTasks.js';

/* eslint-disable no-exclusive-tests */

describe.only('Store Getters for Tasks', () => {
  let store, habits, dailys, todos, rewards;

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
      let returnedTasks = store.getters['tasks:getFilteredTaskList']({
        type: 'habit',
        filterType: { label: 'yellowred' },
      });

      expect(returnedTasks[0]).to.eq(habits[0]);
    });

    it('should return strong habits', () => {
      let returnedTasks = store.getters['tasks:getFilteredTaskList']({
        type: 'habit',
        filterType: { label: 'greenblue' },
      });

      expect(returnedTasks[0]).to.eq(habits[1]);
    });

    it('should return scheduled todos', () => {
      let returnedTasks = store.getters['tasks:getFilteredTaskList']({
        type: 'todo',
        filterType: { label: 'scheduled' },
      });

      expect(returnedTasks[0]).to.eq(todos[0]);
    });

    it('should return completed todos', () => {
      let returnedTasks = store.getters['tasks:getFilteredTaskList']({
        type: 'todo',
        filterType: { label: 'complete2' },
      });

      expect(returnedTasks[0]).to.eq(todos[1]);
    });
  });
});

// describe.only('Store Order Helper for Tasks', () => {
//   let store, habits;
//   // dailys, todos, rewards;

//   beforeEach(() => {
//     store = generateStore();
//     // Get user preference data and user tasks order data
//     store.state.user.data = {
//       preferences: {},
//       tasksOrder: {
//         habits: [],
//         dailys: [],
//         todos: [],
//         rewards: [],
//       },
//     };
//   });

//   describe('Task ordering for single task type', () => {
//     beforeEach(() => {
//       habits = [
//         {id: 1},
//         {id: 2},
//         {id: 3},
//         {id: 4},
//         {id: 5},
//       ];
//     });

//     it('should return tasks by original order', () => {
//       let shuffledTasks = shuffle(habits);

//       console.log(shuffledTasks, orderSingleTypeTasks(shuffledTasks, habits));
//     });
//   });
// });


/* eslint-enable no-exclusive-tests */

