import { shallowMount, createLocalVue } from '@vue/test-utils';

import TagFilterButton from '@/components/tasks/filter/tagFilterButton.vue';

const localVue = createLocalVue();

describe('TagFilterButton', () => {
  const tag = { id: 1, name: 'tag 1' };

  function createWrapper (properties) {
    return shallowMount(TagFilterButton, {
      localVue,
      propsData: {
        editable: false,
        draggable: false,
        selected: false,
        tag,
        ...properties,
      },
    });
  }

  describe('initial state', () => {
    it('should display checkbox and label when it\'s not editable', () => {
      const wrapper = createWrapper();

      const checkbox = wrapper.find('input[type=checkbox]:not(.invisible)');
      expect(checkbox.exists()).to.be.true;
      expect(checkbox.element.checked).to.be.false;
      expect(wrapper.find('label').exists()).to.be.true;
      expect(wrapper.find('input[type=text]').exists()).to.be.false;
      expect(wrapper.find('.drag-handle').exists()).to.be.false;
      expect(wrapper.find('.editable').exists()).to.be.false;
    });

    it('should have checkbox checked when it\'s selected', () => {
      const wrapper = createWrapper({ selected: true });

      const checkbox = wrapper.find('input[type=checkbox]:not(.invisible)');
      expect(checkbox.exists()).to.be.true;
      expect(checkbox.element.checked).to.be.true;
    });

    it('should display text input and remove icon when it\'s editable', () => {
      const wrapper = createWrapper({ editable: true });

      expect(wrapper.find('label').exists()).to.be.false;
      expect(wrapper.find('input[type=text]').exists()).to.be.true;
      expect(wrapper.find('input[type=checkbox].invisible').exists()).to.be.true;
      expect(wrapper.find('.drag-handle').exists()).to.be.false;
      expect(wrapper.find('.editable').exists()).to.be.true;
    });

    it('should display drag icon when it\'s draggable', () => {
      const wrapper = createWrapper({ draggable: true });

      expect(wrapper.find('.drag-handle').exists()).to.be.true;
    });
  });

  describe('events', () => {
    it('should fire toggle event when checkbox clicked', () => {
      const wrapper = createWrapper();

      wrapper.find('input[type=checkbox]').trigger('click');

      const emittedToggles = wrapper.emitted().toggle;
      expect(emittedToggles.length).to.equal(1);
      expect(emittedToggles[0][0]).to.equal(tag);
    });

    it('should fire toggle event when label clicked', () => {
      const wrapper = createWrapper();

      wrapper.find('label').trigger('click');

      const emittedToggles = wrapper.emitted().toggle;
      expect(emittedToggles.length).to.equal(1);
      expect(emittedToggles[0][0]).to.equal(tag);
    });

    it('should fire remove event when remove-icon clicked', () => {
      const wrapper = createWrapper({ editable: true });

      wrapper.find('.remove-button').trigger('click');

      const emittedRemoves = wrapper.emitted().remove;
      expect(emittedRemoves.length).to.equal(1);
      expect(emittedRemoves[0][0]).to.equal(tag);
    });

    it('should update tag when text changed', () => {
      const currentTagValue = tag.name;
      const newTagValue = 'new tag value';
      const wrapper = createWrapper({ editable: true });

      const textInput = wrapper.find('input[type="text"]');
      textInput.setValue(newTagValue);

      expect(tag.name).to.equal(newTagValue);
      tag.name = currentTagValue;
    });
  });
});
