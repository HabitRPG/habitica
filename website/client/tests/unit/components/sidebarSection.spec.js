import { mount } from '@vue/test-utils';

import SidebarSection from '@/components/sidebarSection.vue';

describe('Sidebar Section', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = mount(SidebarSection, {
      propsData: {
        title: 'Hello World',
      },
      slots: {
        default: '<p>This is a test.</p>',
      },
    });
  });

  it('displays title', () => {
    expect(wrapper.find('h3').text()).to.eq('Hello World');
  });

  it('displays contents', () => {
    expect(wrapper.find('.section-body').find('p').text()).to.eq('This is a test.');
  });

  it('displays tooltip icon', () => {
    expect(wrapper.contains('.section-info')).to.eq(false);
    wrapper.setProps({ tooltip: 'This is a test' });
    expect(wrapper.contains('.section-info')).to.eq(true);
  });

  it('hides contents', () => {
    expect(wrapper.find('.section-body').element.style.display).to.not.eq('none');
    wrapper.find('[role="button"').trigger('click');
    expect(wrapper.find('.section-body').element.style.display).to.eq('none');
    wrapper.find('[role="button"').trigger('click');
    expect(wrapper.find('.section-body').element.style.display).to.not.eq('none');
  });

  it('can hide contents by default', () => {
    wrapper = mount(SidebarSection, {
      propsData: {
        title: 'Hello World',
        show: false,
      },
      slots: {
        default: '<p>This is a test.</p>',
      },
    });

    expect(wrapper.find('.section-body').element.style.display).to.eq('none');
  });
});
