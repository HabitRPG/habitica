import { shallowMount, createLocalVue } from '@vue/test-utils';

import ChatCard from '@/components/chat/chatCard.vue';
import Store from '@/libs/store';

const localVue = createLocalVue();
localVue.use(Store);

describe('ChatCard', () => {
  function createUser (username) {
    return {
      auth: { local: { username } },
      profile: { name: username },
      contributor: {},
      flags: {},
    };
  }

  function mountWrapper (msg) {
    return shallowMount(ChatCard, {
      propsData: { msg },
      store: new Store({
        state: {
          user: { data: createUser('Tester') },
        },
        getters: {},
        actions: {},
      }),
      localVue,
      mocks: { $t: string => string },
    });
  }

  it('shows the message text', () => {
    const wrapper = mountWrapper({ text: 'test', likes: {} });

    expect(wrapper.find('div.text').text()).to.equal('test');
    expect(wrapper.find('div.mentioned-icon').exists()).to.be.false;
  });

  it('shows mention dot if user is mentioned', () => {
    const wrapper = mountWrapper({ text: '@Tester', likes: {} });

    expect(wrapper.find('div.mentioned-icon').exists()).to.be.true;
  });

  // Bug fixed by https://github.com/HabitRPG/habitica/pull/12177
  it('shows mention dot if user is mentioned after almostmention', () => {
    const wrapper = mountWrapper({ text: 'thetester @Tester', likes: {} });

    expect(wrapper.find('div.mentioned-icon').exists()).to.be.true;
  });
});
