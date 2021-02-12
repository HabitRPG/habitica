import { shallowMount, createLocalVue } from '@vue/test-utils';

import Store from '@/libs/store';

import successModal from '@/components/payments/successModal';

const localVue = createLocalVue();
localVue.use(Store);

describe('Success modal', () => {
  let wrapper;

  function firePaymentSuccess (data) {
    wrapper.vm.$root.$emit('habitica:payment-success', data);
  }

  beforeEach(async () => {
    wrapper = shallowMount(successModal, {
      store: new Store({
        state: {},
        getters: {},
        actions: {},
      }),
      localVue,
      mocks: { $t: (...args) => JSON.stringify(args) },
      stubs: {
        'b-modal': {
          template: '<div><slot name="modal-header"></slot><slot></slot><footer><slot name="modal-footer"></slot></footer></div>',
        },
      },
    });
  });

  it('Displays payment success when buying gems', () => {
    firePaymentSuccess({
      paymentType: 'gems',
      gemsBlock: { gems: 5 },
    });

    expect(wrapper.find('h2').text()).to.equal('["paymentSuccessful"]');
    expect(wrapper.find('section :first-child').text()).to.equal('["paymentYouReceived"]');
    expect(wrapper.find('.details-block').text()).to.equal('5');
    expect(wrapper.find('footer').text()).to.equal('["giftSubscriptionText4"]');
  });

  it('Displays success when gifting gems from balance', () => {
    firePaymentSuccess({
      paymentType: 'gift-gems-balance',
      giftReceiver: 'Lucky User',
      gift: { gems: { amount: 3 } },
    });

    expect(wrapper.find('h2').text()).to.equal('["success"]');
    expect(wrapper.find('section :first-child').text()).to.equal('["paymentYouSentGems",{"name":"Lucky User"}]');
    expect(wrapper.find('.details-block').text()).to.equal('3');
  });

  it('Displays payment success when gifting gems through payment', () => {
    firePaymentSuccess({
      paymentType: 'gift-gems',
      giftReceiver: 'Lucky User',
      gift: { gems: { amount: 7 } },
    });

    expect(wrapper.find('h2').text()).to.equal('["paymentSuccessful"]');
    expect(wrapper.find('section :first-child').text()).to.equal('["paymentYouSentGems",{"name":"Lucky User"}]');
    expect(wrapper.find('.details-block').text()).to.equal('7');
    expect(wrapper.find('footer').text()).to.equal('["giftSubscriptionText4"]');
  });

  it('Displays payment success when gifting subscription', () => {
    firePaymentSuccess({
      paymentType: 'gift-subscription',
      giftReceiver: 'Very lucky User',
      subscriptionKey: 'basic_6mo',
    });

    expect(wrapper.find('h2').text()).to.equal('["paymentSuccessful"]');
    expect(wrapper.find('section :first-child').text()).to.equal('["paymentYouSentSubscription",{"name":"Very lucky User","months":6}]');
    expect(wrapper.find('.details-block').exists()).to.be.false;
    expect(wrapper.find('footer').text()).to.equal('["giftSubscriptionText4"]');
  });

  it('Displays payment success when subscribing', () => {
    firePaymentSuccess({
      paymentType: 'subscription',
      subscriptionKey: 'basic_6mo',
    });

    expect(wrapper.find('h2').text()).to.equal('["paymentSuccessful"]');
    expect(wrapper.find('section :first-child').text()).to.equal('["nowSubscribed"]');
    expect(wrapper.find('.details-block').text()).to.equal('["paymentSubBilling",{"amount":30,"months":6}]');
    expect(wrapper.find('footer').text()).to.equal('["giftSubscriptionText4"]');
  });

  it('Displays payment success when creating new group plan', () => {
    firePaymentSuccess({
      paymentType: 'groupPlan',
      subscriptionKey: 'basic_6mo',
      newGroup: true,
      group: {
        name: 'The best group',
        memberCount: 5,
      },
    });

    expect(wrapper.find('h2').text()).to.equal('["paymentSuccessful"]');
    expect(wrapper.find('section :first-child').text()).to.equal('["groupPlanCreated",{"groupName":"The best group"}]');
    expect(wrapper.find('.details-block').text()).to.equal('["paymentSubBilling",{"amount":42,"months":6}]');
    expect(wrapper.find('footer').text()).to.equal('["giftSubscriptionText4"]');
  });

  it('Displays payment success when upgrading group plan', () => {
    firePaymentSuccess({
      paymentType: 'groupPlan',
      subscriptionKey: 'basic_6mo',
      group: {
        name: 'The best group',
        memberCount: 2,
      },
    });

    expect(wrapper.find('h2').text()).to.equal('["paymentSuccessful"]');
    expect(wrapper.find('section :first-child').text()).to.equal('["groupPlanUpgraded",{"groupName":"The best group"}]');
    expect(wrapper.find('.details-block').text()).to.equal('["paymentSubBilling",{"amount":33,"months":6}]');
    expect(wrapper.find('footer').text()).to.equal('["giftSubscriptionText4"]');
  });

  it('Displays payment success when upgrading group plan without memberCount', () => {
    firePaymentSuccess({
      paymentType: 'groupPlan',
      subscriptionKey: 'basic_3mo',
      group: { name: 'The solo group' },
    });

    expect(wrapper.find('h2').text()).to.equal('["paymentSuccessful"]');
    expect(wrapper.find('section :first-child').text()).to.equal('["groupPlanUpgraded",{"groupName":"The solo group"}]');
    expect(wrapper.find('.details-block').text()).to.equal('["paymentSubBilling",{"amount":15,"months":3}]');
    expect(wrapper.find('footer').text()).to.equal('["giftSubscriptionText4"]');
  });
});
