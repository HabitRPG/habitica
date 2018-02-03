import Vue from 'vue';
import MembersModalComponent from 'client/components/groups/membersModal.vue';

describe('Members Modal Component', () => {
  describe('Party Sort', () => {
    let CTor;
    let vm;

    beforeEach(() => {
      CTor = Vue.extend(MembersModalComponent);
      vm = new CTor().$mount();
    });

    afterEach(() => {
      vm.$destroy();
    });

    it('should have an empty object as sort-option at start', () => {
      const defaultData = vm.data();
      expect(defaultData.sortOption).to.eq({});
    });

    it('should accept sort-option object', () => {
      const sortOption = vm.data().sortOption[0];
      vm.sort(sortOption);
      Vue.nextTick(() => {
        expect(vm.data().sortOption).to.eq(sortOption);
      });
    });
  });
});
