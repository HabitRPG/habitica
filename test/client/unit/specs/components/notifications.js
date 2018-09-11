import { shallowMount, createLocalVue } from '@vue/test-utils';
import NotificationsComponent from 'client/components/notifications.vue';
import Store from 'client/libs/store';
import { hasClass } from 'client/store/getters/members';

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
      },
      getters: {
        'members:hasClass': hasClass,
      },
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
});
