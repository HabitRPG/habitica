import {
  describe, expect, test, beforeEach,
} from 'vitest';
import { mount } from '@vue/test-utils';
import Vue from 'vue';

import CategoryTags from '@/components/categories/categoryTags.vue';

describe('Category Tags', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = mount(CategoryTags, {
      propsData: {
        categories: [],
      },
      slots: {
        default: '<p>This is a slot.</p>',
      },
      mocks: {
        $t: string => string,
      },
    });
  });

  test('displays a category', () => {
    wrapper.setProps({
      categories: [
        {
          name: 'test',
        },
      ],
    });
    return Vue.nextTick().then(() => {
      expect(wrapper.contains('.category-label')).to.eq(true);
      expect(wrapper.find('.category-label').text()).to.eq('test');
    });
  });

  test('displays a habitica official in purple', () => {
    wrapper.setProps({
      categories: [
        {
          name: 'habitica_official',
        },
      ],
    });
    expect(wrapper.contains('.category-label-purple')).to.eq(true);
    expect(wrapper.find('.category-label').text()).to.eq('habitica_official');
  });

  test('displays owner label', () => {
    wrapper.setProps({
      owner: true,
    });
    expect(wrapper.contains('.category-label-blue')).to.eq(true);
    expect(wrapper.find('.category-label').text()).to.eq('owned');
  });

  test('displays member label', () => {
    wrapper.setProps({
      member: true,
    });
    expect(wrapper.contains('.category-label-green')).to.eq(true);
    expect(wrapper.find('.category-label').text()).to.eq('joined');
  });

  test('displays additional content at the end', () => {
    expect(wrapper.find('p').text()).to.eq('This is a slot.');
  });
});
