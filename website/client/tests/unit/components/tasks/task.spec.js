import { shallowMount, createLocalVue } from '@vue/test-utils';
import moment from 'moment';

import Task from '@/components/tasks/task.vue';
import Store from '@/libs/store';

const localVue = createLocalVue();
localVue.use(Store);

describe('Task', () => {
  let wrapper;

  function makeWrapper (additionalTaskData = {}, additionalUserData = {}) {
    return shallowMount(Task, {
      propsData: {
        task: {
          group: {},
          ...additionalTaskData,
        },
      },
      store: {
        state: {
          user: {
            data: {
              preferences: {},
              ...additionalUserData,
            },
          },
        },
        getters: {
          'tasks:getTaskClasses': () => ({}),
          'tasks:canEdit': () => ({}),
          'tasks:canDelete': () => ({}),
        },
      },
      mocks: { $t: (key, params) => key + (params ? JSON.stringify(params) : '') },
      directives: { 'b-tooltip': {} },
      localVue,
    });
  }

  it('returns a vue instance', () => {
    wrapper = makeWrapper();
    expect(wrapper.isVueInstance()).to.be.true;
  });

  describe('Due date calculation', () => {
    let clock;

    function setClockTo (time) {
      const now = moment(time);
      clock = sinon.useFakeTimers(now.toDate());
      return now;
    }

    afterEach(() => {
      clock.restore();
    });

    it('formats due date to today if due today', () => {
      const now = setClockTo('2019-09-17T17:57:00+02:00');
      wrapper = makeWrapper({ date: now });

      expect(wrapper.vm.formatDueDate()).to.equal('dueIn{"dueIn":"today"}');
    });

    it('formats due date to tomorrow if due tomorrow', () => {
      const now = setClockTo('2012-06-12T14:17:28Z');
      wrapper = makeWrapper({ date: now.add(1, 'day') });

      expect(wrapper.vm.formatDueDate()).to.equal('dueIn{"dueIn":"in a day"}');
    });

    it('formats due date to 5 days if due in 5 days', () => {
      const now = setClockTo();
      wrapper = makeWrapper({ date: now.add(5, 'days') });

      expect(wrapper.vm.formatDueDate()).to.equal('dueIn{"dueIn":"in 5 days"}');
    });

    it('formats due date to tomorrow if today but before dayStart', () => {
      const now = setClockTo('2019-06-12T04:23:37+02:00');
      wrapper = makeWrapper({ date: now.add(8, 'hours') }, { preferences: { dayStart: 7 } });

      expect(wrapper.vm.formatDueDate()).to.equal('dueIn{"dueIn":"in a day"}');
    });
  });
});
