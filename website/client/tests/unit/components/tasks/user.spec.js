import { shallowMount, createLocalVue } from '@vue/test-utils';
import User from '@/components/tasks/user.vue';
import Store from '@/libs/store';

const localVue = createLocalVue();
localVue.use(Store);

describe('Tasks User', () => {
  function createWrapper (challengeTag) {
    const store = new Store({
      state: { user: { data: { tags: [challengeTag] } } },
      getters: {},
      actions: { 'common:setTitle': () => {} },
    });
    return shallowMount(User, {
      store,
      localVue,
      mocks: { $t: s => s },
      stubs: ['b-tooltip'],
    });
  }

  it('returns a vue instance', () => {
    const wrapper = createWrapper();
    expect(wrapper.isVueInstance()).to.be.true;
  });
});
