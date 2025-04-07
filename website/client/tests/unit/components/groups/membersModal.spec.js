import {
  describe, expect, test, beforeEach, afterEach,
} from 'vitest';
import Vue from 'vue';
import MembersModalComponent from '@/components/groups/membersModal.vue';

describe.skip('Members Modal Component', () => {
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

    test('should have an empty object as sort-option at start', () => {
      const defaultData = vm.data();
      expect(defaultData.sortOption).to.eq({});
    });

    test('should accept sort-option object', () => {
      const sortOption = vm.data().sortOption[0];
      vm.sort(sortOption);
      Vue.nextTick(() => {
        expect(vm.data().sortOption).to.eq(sortOption);
      });
    });
  });
});
