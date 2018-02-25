// VueJS produces following warnings if the corresponding imports are not used
// [Vue warn]: You are using the runtime-only build of Vue where the template option is not available. Either pre-compile the templates into render functions, or use the compiler-included build.
// import Vue from 'vue/dist/vue';

import { shallow, createLocalVue } from '@vue/test-utils';

import TaskColumn from 'client/components/tasks/column.vue';

import Store from 'client/libs/store';
import { flattenAndNamespace } from 'client/libs/store/helpers/internals';

// eslint-disable no-exclusive-tests

const localVue = createLocalVue();
localVue.use(Store);

describe('Task Column', () => {
  let wrapper, type;
  let store, getters, state;
  let habits, taskListOverride, tasks;

  beforeEach(() => {
    getters = flattenAndNamespace({
      tasks: {
        // (...) => { ... } will return a value
        // (...) => (...) => { ... } stucture used because getters must return functions
        getFilteredTaskList: (a, b) => (c, d) => habits,
        getUnfilteredTaskList: (a) => (b) => habits,
      },
    });

    state = {
      tasks: {
        habits,
      },
    };

    store = new Store({state, getters});

    type = 'habit';
    wrapper = shallow(TaskColumn, {
      propsData: {
        type,
      },
      mocks: {
        $t () {}, // vue-test-utils throws error if this is not mocked for i18n,
      },
      stubs: ['b-modal'], // <b-modal> is a custom component and not tested here
      store,
      localVue,
    });
  });

  it('returns a vue instance', () => {
    expect(wrapper.isVueInstance()).to.be.true;
  });

  describe('Passed Properties', () => {
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
    beforeEach(() => {
      type = 'habit';
      habits = [
        { id: 1 },
        { id: 2 },
      ];
      taskListOverride = [
        { id: 3 },
        { id: 4 },
      ];
    });

    it('returns task list from props for group-plan', () => {
      wrapper.setProps({ taskListOverride });

      wrapper.vm.taskList.forEach((el, i) => {
        expect(el).to.eq(taskListOverride[i]);
      });
      
      wrapper.setProps({ isUser: false, taskListOverride });

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

  describe('Task List', () => {
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
        let returnedTasks = wrapper.vm.filterByTagList(tasks);
        expect(returnedTasks).to.have.lengthOf(tasks.length);
        tasks.forEach((task, i) => {
          expect(returnedTasks[i]).to.eq(task);
        });
      });

      it('returns all tasks for given single tag', () => {
        let returnedTasks = wrapper.vm.filterByTagList(tasks, [3]);

        expect(returnedTasks).to.have.lengthOf(3);
        expect(returnedTasks[0]).to.eq(tasks[0]);
        expect(returnedTasks[1]).to.eq(tasks[1]);
        expect(returnedTasks[2]).to.eq(tasks[3]);
      });

      it('returns all tasks for given multiple tags', () => {
        let returnedTasks = wrapper.vm.filterByTagList(tasks, [2, 3]);

        expect(returnedTasks).to.have.lengthOf(1);
        expect(returnedTasks[0]).to.eq(tasks[1]);
      });
    });

    describe('Filter By Search Text', () => {
      beforeEach(() => {
        tasks = [
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
            text: 'Generic Task Title',
            note: '',
            checklist: [
              { text: 'Check 1' },
              { text: 'Check 2' },
              { text: 'Check 3' },
            ],
          },
          {
            text: 'Hello world 3',
            note: 'Generic Task Note',
            checklist: [
              { text: 'Checkitem 1' },
              { text: 'Checkitem 2' },
              { text: 'Checkitem 3' },
            ],
          },
        ];
      });

      it('should return all tasks for empty search term', () => {
        let returnedTasks = wrapper.vm.filterBySearchText(tasks);
        expect(returnedTasks).to.have.lengthOf(tasks.length);
        tasks.forEach((task, i) => {
          expect(returnedTasks[i]).to.eq(task);
        });
      });

      it('should return tasks for search term in title /i', () => {
        ['Title', 'TITLE', 'title', 'tItLe'].forEach((term) => {
          expect(wrapper.vm.filterBySearchText(tasks, term)[0]).to.eq(tasks[2]);
        });
      });

      it('should return tasks for search term in note /i', () => {
        ['Note', 'NOTE', 'note', 'nOtE'].forEach((term) => {
          expect(wrapper.vm.filterBySearchText(tasks, term)[0]).to.eq(tasks[3]);
        });
      });

      it('should return tasks for search term in checklist title /i', () => {
        ['Check', 'CHECK', 'check', 'cHeCK'].forEach((term) => {
          let returnedTasks = wrapper.vm.filterBySearchText(tasks, term);

          expect(returnedTasks[0]).to.eq(tasks[2]);
          expect(returnedTasks[1]).to.eq(tasks[3]);
        });

        ['Checkitem', 'CHECKITEM', 'checkitem', 'cHeCKiTEm'].forEach((term) => {
          expect(wrapper.vm.filterBySearchText(tasks, term)[0]).to.eq(tasks[3]);
        });
      });
    });
  });
});
