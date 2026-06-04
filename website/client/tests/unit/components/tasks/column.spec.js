import {
  describe, expect, test, beforeEach,
} from 'vitest';
import { shallowMount, createLocalVue } from '@vue/test-utils';
import TaskColumn from '@/components/tasks/column.vue';
import Store from '@/libs/store';

const localVue = createLocalVue();
localVue.use(Store);

describe('Task Column', () => {
  let wrapper;

  function makeWrapper (additionalSetup = {}) {
    const type = 'habit';
    const mocks = {
      $t () {},
    };
    const stubs = ['b-modal']; // <b-modal> is a custom component and not tested here

    return shallowMount(TaskColumn, {
      propsData: { type },
      store: {
        getters: {
          'tasks:getFilteredTaskList': () => [],
        },

        state: {
          user: {
            data: {
              preferences: {
                tasks: {
                  activeFilter: {},
                },
              },
            },
          },
        },
      },
      mocks,
      stubs,
      localVue,
      ...additionalSetup,
    });
  }

  test('returns a vue instance', () => {
    wrapper = makeWrapper();
    expect(wrapper.isVueInstance()).to.be.true;
  });

  describe('Passed Properties', () => {
    beforeEach(() => {
      wrapper = makeWrapper();
    });

    test('defaults isUser to false', () => {
      expect(wrapper.vm.isUser).to.be.false;
    });

    test('passes isUser to component instance', () => {
      wrapper.setProps({ isUser: false });

      expect(wrapper.vm.isUser).to.be.false;

      wrapper.setProps({ isUser: true });

      expect(wrapper.vm.isUser).to.be.true;
    });
  });

  describe('Computed Properties', () => {
    let taskListOverride;
    let habits;

    beforeEach(() => {
      habits = [
        { id: 1 },
        { id: 2 },
      ];

      taskListOverride = [
        { id: 3 },
        { id: 4 },
      ];

      const getters = {
        // (...) => { ... } will return a value
        // (...) => (...) => { ... } will return a function
        // Task Column expects a function
        'tasks:getFilteredTaskList': () => () => habits,
      };

      const store = new Store({
        getters,
        state: {
          user: {
            data: {
              preferences: {
                tasks: {
                  activeFilter: {},
                },
              },
            },
          },
        },
      });

      wrapper = makeWrapper({ store });
    });

    test('returns task list from props for group-plan', () => {
      wrapper.setProps({ taskListOverride });

      wrapper.vm.taskList.forEach((el, i) => {
        expect(el).to.eq(taskListOverride[i]);
      });

      wrapper.setProps({ isUser: false });

      wrapper.vm.taskList.forEach((el, i) => {
        expect(el).to.eq(taskListOverride[i]);
      });
    });

    test('returns task list from store for user', () => {
      wrapper.setProps({ isUser: true, taskListOverride });

      wrapper.vm.taskList.forEach((el, i) => {
        expect(el).to.eq(habits[i]);
      });
    });
  });

  describe('Methods', () => {
    let tasks;

    describe('Filter By Tags', () => {
      beforeEach(() => {
        tasks = [
          { tags: [3, 4] },
          { tags: [2, 3] },
          { tags: [] },
          { tags: [1, 3] },
        ];
      });

      test('returns all tasks if no tag is given', () => {
        const returnedTasks = wrapper.vm.filterByTagList(tasks);
        expect(returnedTasks).to.have.lengthOf(tasks.length);
        tasks.forEach((task, i) => {
          expect(returnedTasks[i]).to.eq(task);
        });
      });

      test('returns tasks for given single tag', () => {
        const returnedTasks = wrapper.vm.filterByTagList(tasks, [3]);

        expect(returnedTasks).to.have.lengthOf(3);
        expect(returnedTasks[0]).to.eq(tasks[0]);
        expect(returnedTasks[1]).to.eq(tasks[1]);
        expect(returnedTasks[2]).to.eq(tasks[3]);
      });

      test('returns tasks for given multiple tags', () => {
        const returnedTasks = wrapper.vm.filterByTagList(tasks, [2, 3]);

        expect(returnedTasks).to.have.lengthOf(1);
        expect(returnedTasks[0]).to.eq(tasks[1]);
      });
    });

    describe('Filter By Search Text', () => {
      beforeEach(() => {
        tasks = [
          {
            text: 'Hello world 1',
            notes: '',
            checklist: [],
          },
          {
            text: 'Hello world 2',
            notes: '',
            checklist: [],
          },
          {
            text: 'Generic Task Title',
            notes: '',
            checklist: [
              { text: 'Check 1' },
              { text: 'Check 2' },
              { text: 'Check 3' },
            ],
          },
          {
            text: 'Hello world 3',
            notes: 'Generic Task Note',
            checklist: [
              { text: 'Checkitem 1' },
              { text: 'Checkitem 2' },
              { text: 'Checkitem 3' },
            ],
          },
        ];
      });

      test('returns all tasks for empty search term', () => {
        const returnedTasks = wrapper.vm.filterBySearchText(tasks);
        expect(returnedTasks).to.have.lengthOf(tasks.length);
        tasks.forEach((task, i) => {
          expect(returnedTasks[i]).to.eq(task);
        });
      });

      test('returns tasks for search term in title /i', () => {
        ['Title', 'TITLE', 'title', 'tItLe'].forEach(term => {
          expect(wrapper.vm.filterBySearchText(tasks, term)[0]).to.eq(tasks[2]);
        });
      });

      test('returns tasks for search term in note /i', () => {
        ['Note', 'NOTE', 'note', 'nOtE'].forEach(term => {
          expect(wrapper.vm.filterBySearchText(tasks, term)[0]).to.eq(tasks[3]);
        });
      });

      test('returns tasks for search term in checklist title /i', () => {
        ['Check', 'CHECK', 'check', 'cHeCK'].forEach(term => {
          const returnedTasks = wrapper.vm.filterBySearchText(tasks, term);

          expect(returnedTasks[0]).to.eq(tasks[2]);
          expect(returnedTasks[1]).to.eq(tasks[3]);
        });

        ['Checkitem', 'CHECKITEM', 'checkitem', 'cHeCKiTEm'].forEach(term => {
          expect(wrapper.vm.filterBySearchText(tasks, term)[0]).to.eq(tasks[3]);
        });
      });
    });

    // each board type should hit the right move route
    describe('moveTo (task ordering route)', () => {
      function makeStore (userData = {}, extraGetters = {}) {
        return new Store({
          getters: {
            'tasks:getFilteredTaskList': () => () => [],
            'tasks:getUnfilteredTaskList': () => () => [],
            ...extraGetters,
          },
          state: {
            user: {
              data: {
                preferences: { tasks: { activeFilter: {} } },
                tasksOrder: { habits: [] },
                ...userData,
              },
            },
          },
        });
      }

      function stubDispatch (vm) {
        const calls = [];
        vm.$store.dispatch = (action, payload) => {
          calls.push({ action, payload });
          return Promise.resolve(['b', 'a']);
        };
        return calls;
      }

      test('challenge tasks (no group.id) use tasks:move and keep the user order untouched', async () => {
        wrapper = makeWrapper({ store: makeStore() });
        wrapper.setProps({
          isUser: false,
          challenge: { _id: 'c1' },
          taskListOverride: [{ _id: 'a', group: {} }, { _id: 'b', group: {} }],
        });
        const calls = stubDispatch(wrapper.vm);

        await wrapper.vm.moveTo({ _id: 'a', group: {} }, 'bottom');

        expect(calls).to.have.lengthOf(1);
        expect(calls[0].action).to.eq('tasks:move');
        // an overridden list must never overwrite the user's personal order
        expect(wrapper.vm.user.tasksOrder.habits.join(',')).to.eq('');
      });

      test('group-plan tasks (with group.id) use tasks:moveGroupTask', async () => {
        wrapper = makeWrapper({ store: makeStore() });
        wrapper.setProps({
          isUser: false,
          group: { _id: 'g1' },
          taskListOverride: [{ _id: 'a', group: { id: 'g1' } }, { _id: 'b', group: { id: 'g1' } }],
        });
        const calls = stubDispatch(wrapper.vm);

        await wrapper.vm.moveTo({ _id: 'a', group: { id: 'g1' } }, 'bottom');

        expect(calls).to.have.lengthOf(1);
        expect(calls[0].action).to.eq('tasks:moveGroupTask');
      });

      test('user tasks use tasks:move and update the user order', async () => {
        const store = makeStore(
          { tasksOrder: { habits: ['a', 'b'] } },
          { 'tasks:getUnfilteredTaskList': () => () => [{ _id: 'a', group: {} }, { _id: 'b', group: {} }] },
        );
        wrapper = makeWrapper({ store });
        wrapper.setProps({ isUser: true });
        const calls = stubDispatch(wrapper.vm);

        await wrapper.vm.moveTo({ _id: 'a', group: {} }, 'bottom');

        expect(calls).to.have.lengthOf(1);
        expect(calls[0].action).to.eq('tasks:move');
        expect(wrapper.vm.user.tasksOrder.habits.join(',')).to.eq('b,a');
      });
    });
  });
});
