import { mount, createLocalVue } from '@vue/test-utils';
import TagFilterPanel from '@/components/tasks/filter/tagFilterPanel';
import Store from '@/libs/store';

const localVue = createLocalVue();
localVue.use(Store);

describe('TagFilterPanel', () => {
  let wrapper;
  const setUserFake = sinon.fake();

  const userTag = { id: '1', name: 'Simple Tag 1' };
  const challengeTag = { id: '2', name: 'Challenge tag', challenge: true };
  const groupTag = { id: 1, name: 'Group tag', group: true };

  function createWrapper (tags = [userTag], selectedTags = []) {
    // Not shallow since we want to inspect tag button state inside the draggable.
    return mount(TagFilterPanel, {
      store: new Store({
        state: { user: { data: { tags } } },
        getters: {},
        actions: { 'user:set': setUserFake },
      }),
      localVue,
      mocks: { $t: s => s },
      propsData: { selectedTags },
    });
  }

  beforeEach(() => {
    wrapper = createWrapper();
  });

  afterEach(sinon.reset);

  function saveButton () {
    return wrapper.find('button');
  }

  function toggleEditButton () {
    return wrapper.find('a.btn-filters-secondary');
  }

  function toggleEditMode () {
    toggleEditButton().trigger('click');
  }

  describe('header buttons', () => {
    it('should display edit tags and clear selection disabled when opening without selection', () => {
      expect(wrapper.find('a.reset-filters.disabled').exists()).to.be.true;
      expect(saveButton().exists()).to.be.false;
      expect(toggleEditButton().text()).to.equal('editTags2');
    });

    it('should display edit tags and clear selection enabled when opening with selection', () => {
      wrapper = createWrapper([userTag], [userTag.id]);

      expect(wrapper.find('a.reset-filters.disabled').exists()).to.be.false;
      expect(wrapper.find('a.reset-filters').exists()).to.be.true;
      expect(saveButton().exists()).to.be.false;
      expect(toggleEditButton().text()).to.equal('editTags2');
    });

    it('should display cancel and save button when switching to edit mode', () => {
      toggleEditMode();

      expect(wrapper.find('a.reset-filters').exists()).to.be.false;
      expect(saveButton().exists()).to.be.true;
      expect(toggleEditButton().text()).to.equal('cancel');
    });
  });

  describe('Tag sections', () => {
    beforeEach(() => {
      wrapper = createWrapper([userTag, challengeTag, groupTag]);
      toggleEditMode();
    });

    it('should set user section tags to editable and draggable', () => {
      expect(wrapper.find('.tags .tag.editable').exists()).to.be.true;
      expect(wrapper.find('.tags .drag-handle').exists()).to.be.true;
    });

    it('should set challenge section tags to editable but not draggable', () => {
      expect(wrapper.find('.challenges .tag.editable').exists()).to.be.true;
      expect(wrapper.find('.challenges .drag-handle').exists()).to.be.false;
    });

    it('should keep group section tags uneditable', () => {
      expect(wrapper.find('.groups .tag').exists()).to.be.true;
      expect(wrapper.find('.groups .tag.editable').exists()).to.be.false;
      expect(wrapper.find('.groups .drag-handle').exists()).to.be.false;
    });
  });

  describe('Tag editing behaviour', () => {
    beforeEach(toggleEditMode);

    it('should push tags to backend when clicking save', () => {
      saveButton().trigger('click');

      expect(setUserFake.calledOnce).to.be.true;
      expect(setUserFake.lastCall.lastArg).to.deep.equal({ tags: [userTag] });
    });

    it('should add new tag to list when hitting enter', () => {
      const newTagInput = wrapper.find('.new-tag-item');
      newTagInput.setValue('New tag');
      newTagInput.trigger('keydown.enter');

      expect(wrapper.vm.tags.user.tags.length).to.equal(2);
      expect(wrapper.vm.tags.user.tags[1].name).to.equal('New tag');
    });

    it('should add new tag to list when hitting save button', () => {
      wrapper.find('.new-tag-item').setValue('New tag');
      saveButton().trigger('click');

      const savedtags = setUserFake.lastCall.lastArg.tags;
      expect(savedtags.length).to.equal(2);
      expect(savedtags[0]).to.deep.equal(userTag);
      expect(savedtags[1].name).to.equal('New tag');
    });

    it('should change tag name when updating input', () => {
      const tagInput = wrapper.find('.tag input[type=text]');

      tagInput.setValue('Changed user tag');

      expect(wrapper.vm.tags.user.tags).to.deep.equal([{ id: '1', name: 'Changed user tag' }]);
    });

    it('should revert changes when hitting cancel', () => {
      wrapper.find('.tag input[type=text]').setValue('Changed user tag');
      wrapper.find('.new-tag-item').setValue('New tag');

      toggleEditButton().trigger('click');

      expect(wrapper.vm.tags.user.tags).to.deep.equal([userTag]);
    });
  });
});
