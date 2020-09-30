import { shallowMount, createLocalVue } from '@vue/test-utils';
import Task from '@/components/tasks/task.vue';
import Store from '@/libs/store';

const localVue = createLocalVue();
localVue.use(Store);

describe('Task', () => {
  let wrapper;

  function makeWrapper (additionalSetup = {}) {
    return shallowMount(Task, {
      propsData: {
        task: {
          group: {},
        },
      },
      store: {
        state: {},
        getters: {
          'tasks:getTaskClasses': () => ({}),
          'tasks:canEdit': () => ({}),
          'tasks:canDelete': () => ({}),
        },
      },
      mocks: { $t () {} },
      directives: { 'b-tooltip': {} },
      localVue,
      ...additionalSetup,
    });
  }

  it('returns a vue instance', () => {
    wrapper = makeWrapper();
    expect(wrapper.isVueInstance()).to.be.true;
  });
});
