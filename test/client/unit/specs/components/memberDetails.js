import Vue from 'vue';
import MemberDetailsComponent from 'client/components/memberDetails.vue';

  describe('Members Details Component', () => {
    let CTor;
    let vm;

    beforeEach(() => {
      CTor = Vue.extend(MembersModalComponent);
      vm = new CTor().$mount();
    });

    afterEach(() => {
      vm.$destroy();
    });

    it('prevents flickering by setting a 1px margin-right on elements of class member-stats', () => {
      expect(vm.find('.member-stats').element.style['margin-right']).to.equal('1');
    });
  });
