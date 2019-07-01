import { shallowMount, createLocalVue } from '@vue/test-utils';
import ChallengeDetailComponent from 'client/components/challenges/challengeDetail.vue';
import Store from 'client/libs/store';

const localVue = createLocalVue();
localVue.use(Store);

describe('Challenge Detail', () => {
  let store;
  let wrapper;

  beforeEach(() => {
    store = new Store({
      state: {
        user: {
          data: {
            contributor: {
              admin: false,
            },
            challenges: [],
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
          {_id: '1', group: { name: '', type: ''}, memberCount: 1, name: '', summary: '', description: '', leader: '', price: 1},
        ],
        'tasks:getChallengeTasks': () => [
          {_id: '1', type: 'habit'},
          {_id: '2', type: 'daily'},
          {_id: '3', type: 'reward'},
          {_id: '4', type: 'todo'},
        ],
      },
      getters: {
      },
    });
    wrapper = shallowMount(ChallengeDetailComponent, {
      store,
      localVue,
      mocks: {
        $t: (string) => string,
      },
    });
  });

  it('removes a destroyed task from task list', () => {
    let taskToRemove = {_id: '1', type: 'habit'};
    wrapper.vm.taskDestroyed(taskToRemove);
    expect(wrapper.vm.tasksByType[taskToRemove.type].length).to.eq(0);
  });
});
