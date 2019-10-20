import Vue from 'vue';
import MemberDetailsComponent from '@/components/memberDetails.vue';

describe('Members Details Component', () => {
  let CTor;
  let vm;

  beforeEach(() => {
    CTor = Vue.extend(MemberDetailsComponent);
    vm = new CTor().$mount();
  });

  afterEach(() => {
    vm.$destroy();
  });

  it.skip('prevents flickering by setting a 1px margin-right on elements of class member-stats', () => {
    const memberstats = vm.$el.querySelector('.member-stats');
    const style = window.getComputedStyle(memberstats, null);
    const marginRightProp = style.getPropertyValue('margin-right');
    expect(marginRightProp).to.equal('1');
  });
});
