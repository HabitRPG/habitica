import Vue from 'vue';
import TaskColumn from 'client/components/tasks/column.vue';

/* eslint-disable no-exclusive-tests */

describe('Task Column Component', () => {
  let vm, Ctor, tasks;

  describe('Task Filtering', () => {
    beforeEach(() => {
      Ctor = Vue.extend(TaskColumn);
      vm = new Ctor().$mount();
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

      it('should return tasks with search term in title: case insensitive', () => {
        ['Title', 'TITLE', 'title', 'tItLe'].forEach((term) => {
          expect(vm.filterBySearchText(tasks, term)[0]).to.eq(tasks[2]);
        });
      });

      it('should return tasks with search term in note: case insensitive', () => {
        ['Note', 'NOTE', 'note', 'nOtE'].forEach((term) => {
          expect(vm.filterBySearchText(tasks, term)[0]).to.eq(tasks[3]);
        });
      });

      it('should return tasks with search term in checklist title: case inse', () => {
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

/* eslint-enable no-exclusive-tests */
