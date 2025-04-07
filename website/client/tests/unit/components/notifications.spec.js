import {
  describe, expect, test, beforeEach, chai,
} from 'vitest';
import { shallowMount, createLocalVue } from '@vue/test-utils';
import { toNextLevel } from '@/../../common/script/statHelpers';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import NotificationsComponent from '@/components/notifications.vue';
import Store from '@/libs/store';
import { hasClass } from '@/store/getters/members';

chai.use(sinonChai);

const localVue = createLocalVue();
localVue.use(Store);

describe('Notifications', () => {
  let store;
  let wrapper;

  beforeEach(() => {
    store = new Store({
      state: {
        user: {
          data: {
            stats: {
              lvl: 0,
            },
            flags: {},
            preferences: { suppressModals: {} },
            party: {
              quest: {
              },
            },
          },
        },
      },
      actions: {
        'user:fetch': () => {},
        'tasks:fetchUserTasks': () => {},
        'snackbars:add': () => {},
      },
      getters: {
        'members:hasClass': hasClass,
      },
    });
    wrapper = shallowMount(NotificationsComponent, {
      store,
      localVue,
      mocks: {
        $t: string => string,
      },
    });
  });

  test('set user has class computed prop', () => {
    expect(wrapper.vm.userHasClass).to.be.false;

    store.state.user.data.stats.lvl = 10;
    store.state.user.data.flags.classSelected = true;
    store.state.user.data.preferences.disableClasses = false;

    expect(wrapper.vm.userHasClass).to.be.true;
  });

  describe('user exp notifcation', () => {
    test('notifies when user gets more exp', () => {
      const expSpy = sinon.spy(wrapper.vm, 'exp');

      const userLevel = 10;
      store.state.user.data.stats.lvl = userLevel;

      const userExpBefore = 10;
      const userExpAfter = 12;
      wrapper.vm
        .displayUserExpAndLvlNotifications(userExpAfter, userExpBefore, userLevel, userLevel);

      expect(expSpy).to.be.calledWith(userExpAfter - userExpBefore);
      expSpy.restore();
    });

    test('when user levels with exact xp', () => {
      const expSpy = sinon.spy(wrapper.vm, 'exp');

      const userLevelBefore = 9;
      const userLevelAfter = 10;
      store.state.user.data.stats.lvl = userLevelAfter;

      const expEarned = 5;
      const userExpBefore = toNextLevel(userLevelBefore) - expEarned;
      const userExpAfter = 0;
      wrapper.vm
        .displayUserExpAndLvlNotifications(
          userExpAfter,
          userExpBefore,
          userLevelAfter,
          userLevelBefore,
        );

      expect(expSpy).to.be.calledWith(expEarned);
      expSpy.restore();
    });

    test('when user levels with exact more exp than needed', () => {
      const expSpy = sinon.spy(wrapper.vm, 'exp');

      const userLevelBefore = 9;
      const userLevelAfter = 10;
      store.state.user.data.stats.lvl = userLevelAfter;

      const expEarned = 10;
      const expNeeded = 5;
      const userExpBefore = toNextLevel(userLevelBefore) - expNeeded;
      const userExpAfter = 5;
      wrapper.vm.displayUserExpAndLvlNotifications(
        userExpAfter,
        userExpBefore,
        userLevelAfter,
        userLevelBefore,
      );

      expect(expSpy).to.be.calledWith(expEarned);
      expSpy.restore();
    });

    test('when user has more exp than needed then levels', () => {
      const expSpy = sinon.spy(wrapper.vm, 'exp');

      const userLevelBefore = 9;
      const userLevelAfter = 10;
      store.state.user.data.stats.lvl = userLevelAfter;

      const expEarned = 10;
      const expNeeded = -5;
      const userExpBefore = toNextLevel(userLevelBefore) - expNeeded;
      const userExpAfter = 15;
      wrapper.vm.displayUserExpAndLvlNotifications(
        userExpAfter,
        userExpBefore,
        userLevelAfter,
        userLevelBefore,
      );

      expect(expSpy).to.be.calledWith(expEarned);
      expSpy.restore();
    });

    test('when user multilevels', () => {
      const expSpy = sinon.spy(wrapper.vm, 'exp');

      const userLevelBefore = 8;
      const userLevelAfter = 10;
      store.state.user.data.stats.lvl = userLevelAfter;

      const expEarned = 10 + toNextLevel(userLevelBefore + 1);
      const expNeeded = 5;
      const userExpBefore = toNextLevel(userLevelBefore) - expNeeded;
      const userExpAfter = 5;
      wrapper.vm.displayUserExpAndLvlNotifications(
        userExpAfter,
        userExpBefore,
        userLevelAfter,
        userLevelBefore,
      );

      expect(expSpy).to.be.calledWith(expEarned);
      expSpy.restore();
    });

    test('when user looses xp', () => {
      const expSpy = sinon.spy(wrapper.vm, 'exp');

      const userLevel = 10;
      store.state.user.data.stats.lvl = userLevel;

      const userExpBefore = 10;
      const userExpAfter = 5;
      wrapper.vm.displayUserExpAndLvlNotifications(
        userExpAfter,
        userExpBefore,
        userLevel,
        userLevel,
      );

      expect(expSpy).to.be.calledWith(userExpAfter - userExpBefore);
      expSpy.restore();
    });

    test('when user looses xp under 0', () => {
      const expSpy = sinon.spy(wrapper.vm, 'exp');

      const userLevel = 10;
      store.state.user.data.stats.lvl = userLevel;

      const userExpBefore = 5;
      const userExpAfter = -3;
      wrapper.vm.displayUserExpAndLvlNotifications(
        userExpAfter,
        userExpBefore,
        userLevel,
        userLevel,
      );

      expect(expSpy).to.be.calledWith(userExpAfter - userExpBefore);
      expSpy.restore();
    });

    test('when user dies', () => {
      const expSpy = sinon.spy(wrapper.vm, 'exp');

      const userLevelBefore = 10;
      const userLevelAfter = 9;
      store.state.user.data.stats.lvl = userLevelAfter;

      const expEarned = -20;
      const userExpBefore = 20;
      const userExpAfter = 0;
      wrapper.vm.displayUserExpAndLvlNotifications(
        userExpAfter,
        userExpBefore,
        userLevelAfter,
        userLevelBefore,
      );

      expect(expSpy).to.be.calledWith(expEarned);
      expSpy.restore();
    });
  });
});
