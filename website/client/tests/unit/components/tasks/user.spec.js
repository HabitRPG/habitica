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

  describe('Computed Properties', () => {
    it('should render a challenge tag under challenge header in tag filter popup when the challenge is active', () => {
      const activeChallengeTag = {
        id: '1',
        name: 'Challenge1',
        challenge: true,
      };
      const wrapper = createWrapper(activeChallengeTag);
      const computedTagsByType = wrapper.vm.tagsByType;

      expect(computedTagsByType.challenges.tags.length).to.equal(1);
      expect(computedTagsByType.challenges.tags[0].id).to.equal(activeChallengeTag.id);
      expect(computedTagsByType.challenges.tags[0].name).to.equal(activeChallengeTag.name);
    });

    it('should render a challenge tag under normal tag header in tag filter popup when the challenge is no longer active', () => {
      const inactiveChallengeTag = {
        id: '1',
        name: 'Challenge1',
        challenge: false,
      };
      const wrapper = createWrapper(inactiveChallengeTag);
      const computedTagsByType = wrapper.vm.tagsByType;

      expect(computedTagsByType.challenges.tags.length).to.equal(0);
      expect(computedTagsByType.user.tags.length).to.equal(1);
      expect(computedTagsByType.user.tags[0].id).to.equal(inactiveChallengeTag.id);
      expect(computedTagsByType.user.tags[0].name).to.equal(inactiveChallengeTag.name);
    });
  });
});
