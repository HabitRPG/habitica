// VueJS produces following warnings if the corresponding imports are not used
// [Vue warn]: You are using the runtime-only build of Vue where the template option is not available. Either pre-compile the templates into render functions, or use the compiler-included build.
// import Vue from 'vue/dist/vue';

import { shallow } from '@vue/test-utils';

import TaskColumn from 'client/components/tasks/column.vue';

import Store from 'client/libs/store';

// eslint-disable no-exclusive-tests

describe.only('Task Column', () => {
  let wrapper, type;

  beforeEach(() => {
    type = 'habit';
    wrapper = shallow(TaskColumn, {
      propsData: {
        type,
      },
      mocks: {
        $t () {}, // vue-test-utils throws error if this is not mocked for i18n,
      },
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

  describe.only('Computed Properties', () => {
    let habits, taskListOverride, store, getters, state;
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
      getters = {
        'tasks:getFilteredTaskList': (type, filter) => habits,
      };
      store = new Store({state, getters});
    });

    it('returns task list from props for group-plan', () => {
      wrapper = shallow(TaskColumn, {
        propsData: {
          type,
          taskListOverride,
        },
        mocks: {
          $t () {}, // vue-test-utils throws error if this is not mocked for i18n,
        },
        store,
      });

      wrapper.vm.taskList.forEach((el, i) => {
        expect(el).to.eq(taskListOverride[i]);
      });
    });

    // it('returns task list from store for user', () => {
    //   wrapper = shallow(TaskColumn, {
    //     propsData: {
    //       type,
    //       taskListOverride,
    //       isUser: true,
    //     },
    //     mocks: {
    //       $t () {}, // vue-test-utils throws error if this is not mocked for i18n,
    //     },
    //     store,
    //   });

    //   wrapper.vm.taskList.forEach((el, i) => {
    //     expect(el).to.eq(habits[i]);
    //   });
    //   // eslint-disable-next-line no-console
    //   console.log(store);
    //   // eslint-disable-next-line no-console
    //   console.log(store._vm.$options.computed);
    // });
  });

  describe('Task List', () => {
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
