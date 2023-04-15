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

  it('returns a vue instance', () => {
    wrapper = makeWrapper();
    expect(wrapper.isVueInstance()).to.be.true;
  });

  describe('Passed Properties', () => {
    beforeEach(() => {
      wrapper = makeWrapper();
    });

    it('defaults isUser to false', () => {
      expect(wrapper.vm.isUser).to.be.false;
    });

    it('passes isUser to component instance', () => {
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

    it('returns task list from props for group-plan', () => {
      wrapper.setProps({ taskListOverride });

      wrapper.vm.taskList.forEach((el, i) => {
        expect(el).to.eq(taskListOverride[i]);
      });

      wrapper.setProps({ isUser: false });

      wrapper.vm.taskList.forEach((el, i) => {
        expect(el).to.eq(taskListOverride[i]);
      });
    });

    it('returns task list from store for user', () => {
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

      it('returns all tasks if no tag is given', () => {
        const returnedTasks = wrapper.vm.filterByTagList(tasks);
        expect(returnedTasks).to.have.lengthOf(tasks.length);
        tasks.forEach((task, i) => {
          expect(returnedTasks[i]).to.eq(task);
        });
      });

      it('returns tasks for given single tag', () => {
        const returnedTasks = wrapper.vm.filterByTagList(tasks, [3]);

        expect(returnedTasks).to.have.lengthOf(3);
        expect(returnedTasks[0]).to.eq(tasks[0]);
        expect(returnedTasks[1]).to.eq(tasks[1]);
        expect(returnedTasks[2]).to.eq(tasks[3]);
      });

      it('returns tasks for given multiple tags', () => {
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

      it('returns all tasks for empty search term', () => {
        const returnedTasks = wrapper.vm.filterBySearchText(tasks);
        expect(returnedTasks).to.have.lengthOf(tasks.length);
        tasks.forEach((task, i) => {
          expect(returnedTasks[i]).to.eq(task);
        });
      });

      it('returns tasks for search term in title /i', () => {
        ['Title', 'TITLE', 'title', 'tItLe'].forEach(term => {
          expect(wrapper.vm.filterBySearchText(tasks, term)[0]).to.eq(tasks[2]);
        });
      });

      it('returns tasks for search term in note /i', () => {
        ['Note', 'NOTE', 'note', 'nOtE'].forEach(term => {
          expect(wrapper.vm.filterBySearchText(tasks, term)[0]).to.eq(tasks[3]);
        });
      });

      it('returns tasks for search term in checklist title /i', () => {
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
  });
});
