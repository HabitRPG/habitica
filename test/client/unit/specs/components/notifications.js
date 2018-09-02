import { shallowMount, createLocalVue } from '@vue/test-utils';
import NotificationsComponent from 'client/components/notifications.vue';
import Store from 'client/libs/store';
import { toNextLevel } from 'common/script/statHelpers';

const localVue = createLocalVue();
localVue.use(Store);

describe('Notifications', () => {
  let store;

  beforeEach(() => {
    store = new Store({
      state: {
        user: {
          data: {
            stats: {
              lvl: 0,
            },
            flags: {},
            preferences: {},
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
      getters: {},
    });
  });

  it('set user has class computed prop', () => {
    const wrapper = shallowMount(NotificationsComponent, { store, localVue });

    expect(wrapper.vm.userHasClass).to.be.false;

    store.state.user.data.stats.lvl = 10;
    store.state.user.data.flags.classSelected = true;
    store.state.user.data.preferences.disableClasses = false;

    expect(wrapper.vm.userHasClass).to.be.true;
  });

  describe.only('user exp notifcation', () => {
    it('notifies when user gets more exp', () => {
      const wrapper = shallowMount(NotificationsComponent, { store, localVue });
      const expSpy = sinon.spy(wrapper.vm, 'exp');
      store.state.user.data.stats.lvl = 10;

      const userExpBefore = 10;
      const userExpAfter = 12;
      wrapper.vm.displayUserExpNotifications(userExpAfter, userExpBefore);

      expect(expSpy).to.be.calledWith(userExpAfter - userExpBefore);
      expSpy.restore();
    });

    it('when user levels with exact xp', () => {
      const wrapper = shallowMount(NotificationsComponent, { store, localVue });
      const expSpy = sinon.spy(wrapper.vm, 'exp');
      store.state.user.data.stats.lvl = 10;

      const expEarned = 5;
      const userExpBefore = toNextLevel(store.state.user.data.stats.lvl - 1) - expEarned;
      const userExpAfter = 0;
      wrapper.vm.displayUserExpNotifications(userExpAfter, userExpBefore);

      expect(expSpy).to.be.calledWith(expEarned);
      expSpy.restore();
    });

    it('when user levels with exact more exp than needed', () => {
      const wrapper = shallowMount(NotificationsComponent, { store, localVue });
      const expSpy = sinon.spy(wrapper.vm, 'exp');
      store.state.user.data.stats.lvl = 10;

      const expEarned = 10;
      const expNeeded = 5;
      const userExpBefore = toNextLevel(store.state.user.data.stats.lvl - 1) - expNeeded;
      const userExpAfter = 5;
      wrapper.vm.displayUserExpNotifications(userExpAfter, userExpBefore);

      expect(expSpy).to.be.calledWith(expEarned);
      expSpy.restore();
    });

    it('when user has more exp than needed then levels', () => {
      const wrapper = shallowMount(NotificationsComponent, { store, localVue });
      const expSpy = sinon.spy(wrapper.vm, 'exp');
      store.state.user.data.stats.lvl = 10;

      const expEarned = 10;
      const expNeeded = -5;
      const userExpBefore = toNextLevel(store.state.user.data.stats.lvl - 1) - expNeeded;
      const userExpAfter = 15;
      wrapper.vm.displayUserExpNotifications(userExpAfter, userExpBefore);

      expect(expSpy).to.be.calledWith(expEarned);
      expSpy.restore();
    });

    it('when user multilevels', () => {
      const wrapper = shallowMount(NotificationsComponent, { store, localVue });
      const expSpy = sinon.spy(wrapper.vm, 'exp');
      store.state.user.data.stats.lvl = 10;

      const expEarned = 10;
      const expNeeded = -5;
      const userExpBefore = toNextLevel(store.state.user.data.stats.lvl - 1) + toNextLevel(store.state.user.data.stats.lvl) - expNeeded;
      const userExpAfter = 15;
      wrapper.vm.displayUserExpNotifications(userExpAfter, userExpBefore);

      expect(expSpy).to.be.calledWith(expEarned);
      expSpy.restore();
    });

    it('when user dies', () => {
      const wrapper = shallowMount(NotificationsComponent, { store, localVue });
      const expSpy = sinon.spy(wrapper.vm, 'exp');
      store.state.user.data.stats.lvl = 10;

      const expEarned = -20;
      const userExpBefore = 20;
      const userExpAfter = 0;
      wrapper.vm.displayUserExpNotifications(userExpAfter, userExpBefore);

      expect(expSpy).to.be.calledWith(expEarned);
      expSpy.restore();
    });
  });
});
