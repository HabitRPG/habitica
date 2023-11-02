import Vue from 'vue';
import { shallowMount, createLocalVue } from '@vue/test-utils';

import BootstrapVue from 'bootstrap-vue';
import MessageCard from '@/components/messages/messageCard.vue';
import Store from '@/libs/store';

const localVue = createLocalVue();
localVue.use(Store);
localVue.use(Vue.directive('b-tooltip', {}));
localVue.use(BootstrapVue);

describe('MessageCard', () => {
  function createMessage (text) {
    return { text, likes: {} };
  }

  function createUser (username) {
    return {
      auth: { local: { username } },
      profile: { name: username },
      contributor: {},
      flags: {},
    };
  }

  const message = createMessage('test');
  let wrapper;

  beforeEach(() => {
    wrapper = shallowMount(MessageCard, {
      propsData: { msg: message },
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
  });

  it('shows the message text', () => {
    expect(wrapper.find('div.text').text()).to.equal(message.text);
    expect(wrapper.find('div.mentioned-icon').exists()).to.be.false;
  });

  it('shows mention dot if user is mentioned', () => {
    wrapper.setProps({ msg: createMessage('@Tester') });

    expect(wrapper.find('div.mentioned-icon').exists()).to.be.true;
  });

  // Bug fixed by https://github.com/HabitRPG/habitica/pull/12177
  it('shows mention dot if user is mentioned after almostmention', () => {
    wrapper.setProps({ msg: createMessage('thetester @Tester') });

    expect(wrapper.find('div.mentioned-icon').exists()).to.be.true;
  });
});
