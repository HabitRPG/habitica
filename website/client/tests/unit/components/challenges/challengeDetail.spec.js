import {
  describe, expect, test, beforeEach,
} from 'vitest';
import { shallowMount, createLocalVue } from '@vue/test-utils';
import ChallengeDetailComponent from '@/components/challenges/challengeDetail.vue';
import Store from '@/libs/store';

const localVue = createLocalVue();
localVue.use(Store);

describe('Challenge Detail', () => {
  let store;
  let wrapper;

  function mountComponent (user = {}) {
    store = new Store({
      state: {
        user: {
          data: {
            _id: user._id || 'member-id',
            contributor: {
              admin: false,
            },
            challenges: [],
            permissions: user.permissions || {},
            stats: {
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
        'members:getChallengeMembers': () => {},
        'challenges:getChallenge': () => [
          {
            _id: '1', group: { name: '', type: '' }, memberCount: 1, name: '', summary: '', description: '', leader: '', price: 1,
          },
        ],
        'tasks:getChallengeTasks': () => [
          { _id: '1', type: 'habit' },
          { _id: '2', type: 'daily' },
          { _id: '3', type: 'reward' },
          { _id: '4', type: 'todo' },
        ],
        'common:setTitle': () => {},
      },
      getters: {
      },
    });
    wrapper = shallowMount(ChallengeDetailComponent, {
      store,
      localVue,
      methods: {
        loadChallenge: async () => {},
        handleExternalLinks: () => {},
      },
      mocks: {
        $t: string => string,
      },
      stubs: {
        'b-dropdown': true,
        'b-dropdown-item': true,
        MessageParticipantsModal: true,
      },
    });
  }

  beforeEach(() => {
    mountComponent();
  });

  test('removes a destroyed task from task list', () => {
    const taskToRemove = { _id: '1', type: 'habit' };
    wrapper.vm.taskDestroyed(taskToRemove);
    expect(wrapper.vm.tasksByType[taskToRemove.type].length).to.eq(0);
  });

  test('shows message participants action to the challenge leader', async () => {
    mountComponent({ _id: 'leader-id' });
    await wrapper.setData({ challenge: { _id: 'challenge-id', leader: { _id: 'leader-id' } } });

    expect(wrapper.text()).to.include('messageParticipants');
  });

  test('shows message participants action to a challenge admin', async () => {
    mountComponent({ permissions: { challengeAdmin: true } });
    await wrapper.setData({ challenge: { _id: 'challenge-id', leader: { _id: 'leader-id' } } });

    expect(wrapper.text()).to.include('messageParticipants');
  });

  test('hides message participants action from regular participants', async () => {
    mountComponent({ _id: 'member-id' });
    await wrapper.setData({ challenge: { _id: 'challenge-id', leader: { _id: 'leader-id' } } });

    expect(wrapper.text()).to.not.include('messageParticipants');
  });
});
