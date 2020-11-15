import Vue from 'vue';
import DrawerComponent from '@/components/ui/drawer.vue';

describe('DrawerComponent', () => {
  it('sets the correct default data', () => {
    expect(DrawerComponent.data).to.be.a('function');
    const defaultData = DrawerComponent.data();
    expect(defaultData.isOpened).to.be.true;
  });

  it('renders the correct title', () => {
    const Ctor = Vue.extend(DrawerComponent);
    const vm = new Ctor({
      propsData: {
        title: 'My title',
      },
    }).$mount();

    expect(vm.$el.textContent.trim()).to.be.equal('My title');
  });
});
