// VueJS produces following warnings if the corresponding imports are not used
// [Vue warn]: You are using the runtime-only build of Vue where the template option is not available. Either pre-compile the templates into render functions, or use the compiler-included build.
import Vue from 'vue/dist/vue';

import TaskColumn from 'client/components/tasks/column.vue';

import generateStore from 'client/store';

describe('Task Column Component', () => {
  let vm, Ctor, tasks;

  describe('Passed Data (Props)', () => {
    beforeEach(() => {
      Ctor = Vue.extend(TaskColumn);
    });
    it('returns a default value of false for isUser', () => {
      vm = new Ctor({
        propsData: {
          type: 'habit',
        },
      }).$mount();
      expect(vm.isUser).to.eq(false);
    });
    it('returns a true value for isUser', () => {
      vm = new Ctor({
        propsData: {
          type: 'habit',
          isUser: true,
        },
      }).$mount();
      expect(vm.isUser).to.eq(true);
    });
    afterEach(() => {
      vm.$destroy();
    });
  });

  describe('Task List', () => {
    let store, userTasks, groupTasks;

    beforeEach(() => {
      store = generateStore();
      Ctor = Vue.extend(TaskColumn);
      groupTasks = [
        { id: 1234 },
        { id: 2345 },
        { id: 1543 },
        { id: 6543 },
      ];
      userTasks = [
        { id: 1 },
        { id: 2 },
      ];
      store.state.tasks.data = {
        habits: userTasks,
      };
    });
    it('returns task list override for default value of isUser', () => {
      vm = new Ctor({
        propsData: {
          type: 'habit',
          taskListOverride: groupTasks,
        },
        store,
      }).$mount();
      expect(vm.isUser).to.eq(false);
      expect(vm.taskListOverride).to.eq(groupTasks);
      expect(vm.taskList).to.eq(groupTasks);
    });

    it('returns task list override for false value of isUser', () => {
      vm = new Ctor({
        propsData: {
          type: 'habit',
          isUser: false,
          taskListOverride: groupTasks,
        },
        store,
      }).$mount();
      expect(vm.isUser).to.eq(false);
      expect(vm.taskListOverride).to.eq(groupTasks);
      expect(vm.taskList).to.eq(groupTasks);
    });
    // @TODO: 'returns store task list for true value of isUser'

    afterEach(() => {
      vm.$destroy();
    });
  });

  describe('Task Filtering', () => {
    beforeEach(() => {
      Ctor = Vue.extend(TaskColumn);
      vm = new Ctor({
        propsData: {
          type: 'habit',
        },
      }).$mount();
    });

    describe('by Tags', () => {
      beforeEach(() => {
        tasks = [
          { tags: [3, 4] },
          { tags: [2, 3] },
          { tags: [] },
          { tags: [1, 3] },
        ];
      });

      it('returns all tasks when given no tags', () => {
        let returnedTasks = vm.filterByTagList(tasks);
        expect(returnedTasks).to.have.lengthOf(tasks.length);
        tasks.forEach((task, i) => {
          expect(returnedTasks[i]).to.eq(task);
        });
      });

      it('returns all tasks with given single tag', () => {
        let returnedTasks = vm.filterByTagList(tasks, [3]);

        expect(returnedTasks).to.have.lengthOf(3);
        expect(returnedTasks[0]).to.eq(tasks[0]);
        expect(returnedTasks[1]).to.eq(tasks[1]);
        expect(returnedTasks[2]).to.eq(tasks[3]);
      });

      it('returns all tasks with given multiple tags', () => {
        let returnedTasks = vm.filterByTagList(tasks, [2, 3]);

        expect(returnedTasks).to.have.lengthOf(1);
        expect(returnedTasks[0]).to.eq(tasks[1]);
      });
    });

    describe('by Search Text', () => {
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

      it('should return all tasks with empty search term', () => {
        let returnedTasks = vm.filterBySearchText(tasks);
        expect(returnedTasks).to.have.lengthOf(tasks.length);
        tasks.forEach((task, i) => {
          expect(returnedTasks[i]).to.eq(task);
        });
      });

      it('should return tasks with search term in title /i', () => {
        ['Title', 'TITLE', 'title', 'tItLe'].forEach((term) => {
          expect(vm.filterBySearchText(tasks, term)[0]).to.eq(tasks[2]);
        });
      });

      it('should return tasks with search term in note /i', () => {
        ['Note', 'NOTE', 'note', 'nOtE'].forEach((term) => {
          expect(vm.filterBySearchText(tasks, term)[0]).to.eq(tasks[3]);
        });
      });

      it('should return tasks with search term in checklist title /i', () => {
        ['Check', 'CHECK', 'check', 'cHeCK'].forEach((term) => {
          let returnedTasks = vm.filterBySearchText(tasks, term);

          expect(returnedTasks[0]).to.eq(tasks[2]);
          expect(returnedTasks[1]).to.eq(tasks[3]);
        });

        ['Checkitem', 'CHECKITEM', 'checkitem', 'cHeCKiTEm'].forEach((term) => {
          expect(vm.filterBySearchText(tasks, term)[0]).to.eq(tasks[3]);
        });
      });
    });

    afterEach(() => {
      vm.$destroy();
    });
  });
});
