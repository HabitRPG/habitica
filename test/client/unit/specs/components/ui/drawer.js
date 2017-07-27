import Vue from 'vue';
import DrawerComponent from 'client/components/ui/drawer.vue';

describe('DrawerComponent', () => {
  it('sets the correct default data', () => {
    expect(DrawerComponent.data).to.be.a('function');
    const defaultData = DrawerComponent.data();
    expect(defaultData.open).to.be.true;
  });

  it('renders the correct title', () => {
    const Ctor = Vue.extend(DrawerComponent);
    const vm = new Ctor({propsData: {
      title: 'My title',
    }}).$mount();

    expect(vm.$el.textContent).to.be.equal('My title');
  });
});
