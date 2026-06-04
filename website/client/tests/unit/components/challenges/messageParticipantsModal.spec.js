import {
  describe, expect, test,
} from 'vitest';
import { shallowMount, createLocalVue } from '@vue/test-utils';
import sinon from 'sinon';
import MessageParticipantsModal from '@/components/challenges/messageParticipantsModal.vue';
import Store from '@/libs/store';

const localVue = createLocalVue();
localVue.use(Store);

describe('Message Participants Modal', () => {
  function mountComponent () {
    const calls = {
      messagePayload: null,
      snackbarPayload: null,
    };
    const store = new Store({
      state: {},
      actions: {
        'challenges:messageChallengeParticipants': (storeArg, payload) => {
          calls.messagePayload = payload;
          return {
            sent: 3,
            skipped: 1,
          };
        },
        'snackbars:add': (storeArg, payload) => {
          calls.snackbarPayload = payload;
        },
      },
      getters: {},
    });
    const wrapper = shallowMount(MessageParticipantsModal, {
      store,
      localVue,
      propsData: {
        challengeId: 'challenge-id',
      },
      mocks: {
        $t: (key, values) => {
          if (!values) return key;
          return `${key}:${values.sent}:${values.skipped}`;
        },
      },
      stubs: ['b-modal'],
    });
    wrapper.vm.$root.$emit = sinon.spy();

    return { calls, wrapper };
  }

  test('disables send for blank text', async () => {
    const { calls, wrapper } = mountComponent();

    await wrapper.setData({ message: '   ' });
    await wrapper.vm.sendMessage();

    expect(wrapper.vm.sendDisabled).to.equal(true);
    expect(calls.messagePayload).to.equal(null);
  });

  test('dispatches messageChallengeParticipants for valid text', async () => {
    const { calls, wrapper } = mountComponent();

    await wrapper.setData({ message: 'Challenge update' });
    await wrapper.vm.sendMessage();

    expect(calls.messagePayload).to.eql({
      challengeId: 'challenge-id',
      message: 'Challenge update',
    });
  });

  test('shows success summary after sending', async () => {
    const { calls, wrapper } = mountComponent();

    await wrapper.setData({ message: 'Challenge update' });
    await wrapper.vm.sendMessage();

    expect(calls.snackbarPayload.text).to.equal('messageParticipantsSent:3:1');
    sinon.assert.calledWith(wrapper.vm.$root.$emit, 'bv::hide::modal', 'message-participants-modal');
  });
});
