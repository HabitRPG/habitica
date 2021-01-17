import { shallowMount, createLocalVue } from '@vue/test-utils';
import TaskTagPanel from '@/components/tasks/taskTagPanel.vue';
import Store from '@/libs/store';

const localVue = createLocalVue();
localVue.use(Store);

describe.only('TaskTagPanel', () => { // eslint-disable-line mocha/no-exclusive-tests
  const simpleTag = { id: '1', name: 'Simple Tag 1' };

  function createWrapper (tags = [simpleTag], selectedTags = []) {
    const setUserStub = sinon.stub();

    const store = new Store({
      state: { user: { data: { tags } } },
      getters: {},
      actions: { 'user:set': setUserStub },
    });
    return shallowMount(TaskTagPanel, {
      store,
      localVue,
      mocks: { $t: s => s },
      propsData: { selectedTags },
    });
  }

  afterEach(sinon.restore);

  describe('header buttons', () => {
    it('should display edit tags and clear selection disabled when opening without selection', () => {
      const wrapper = createWrapper();

      expect(wrapper.find('a.reset-filters.disabled').exists()).to.be.true;
      expect(wrapper.find('a.btn-primary').exists()).to.be.false;
      expect(wrapper.find('a.btn-filters-secondary').text()).to.equal('editTags2');
    });

    it('should display edit tags and clear selection enabled when opening with selection', () => {
      const wrapper = createWrapper([simpleTag], [simpleTag.id]);

      expect(wrapper.find('a.reset-filters.disabled').exists()).to.be.false;
      expect(wrapper.find('a.reset-filters').exists()).to.be.true;
      expect(wrapper.find('a.btn-primary').exists()).to.be.false;
      expect(wrapper.find('a.btn-filters-secondary').text()).to.equal('editTags2');
    });

    it('should display cancel and save button when switching to edit mode', () => {
      const wrapper = createWrapper();

      const editToggleLink = wrapper.find('a.btn-filters-secondary');
      editToggleLink.trigger('click');

      expect(wrapper.find('a.reset-filters').exists()).to.be.false;
      expect(wrapper.find('a.btn-primary').exists()).to.be.true;
      expect(editToggleLink.text()).to.equal('cancel');
    });
  });

  describe('Tag grouping', () => {
    it('should render a challenge tag under challenge header', () => {
      const activeChallengeTag = {
        id: '1',
        name: 'Challenge1',
        challenge: true,
      };

      const wrapper = createWrapper([activeChallengeTag]);

      const typedTags = wrapper.vm.tags;
      expect(typedTags.challenges.tags.length).to.equal(1);
      expect(typedTags.challenges.tags[0]).to.equal(activeChallengeTag);
    });

    it('should render a challenge tag under normal tag header when the challenge is no longer active', () => {
      const inactiveChallengeTag = {
        id: '1',
        name: 'Challenge1',
        challenge: false,
      };

      const wrapper = createWrapper([inactiveChallengeTag]);

      const typedTags = wrapper.vm.tags;
      expect(typedTags.challenges.tags.length).to.equal(0);
      expect(typedTags.user.tags.length).to.equal(1);
      expect(typedTags.user.tags[0]).to.equal(inactiveChallengeTag);
    });
  });
});
