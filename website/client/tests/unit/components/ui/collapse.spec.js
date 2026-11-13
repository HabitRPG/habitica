import { describe, expect, test } from 'vitest';
import { mount } from '@vue/test-utils';

import Collapse from '@/components/ui/collapse';

describe('collapse.vue', () => {
  test('shows and hides its content with the visible prop', async () => {
    const wrapper = mount(Collapse, {
      propsData: { visible: false },
      slots: { default: '<p>content</p>' },
    });
    expect(wrapper.element.style.display).to.equal('none');

    wrapper.setProps({ visible: true });
    await wrapper.vm.$nextTick();
    expect(wrapper.element.style.display).to.equal('');
    expect(wrapper.text()).to.equal('content');
  });
});
