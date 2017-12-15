import stripeModule from 'stripe';

import { model as User } from '../../../../../../../website/server/models/user';
import stripePayments from '../../../../../../../website/server/libs/stripePayments';
import payments from '../../../../../../../website/server/libs/payments';
import common from '../../../../../../../website/common';

const i18n = common.i18n;

describe('checkout', () => {
  const subKey = 'basic_3mo';
  const stripe = stripeModule('test');
  let stripeChargeStub, paymentBuyGemsStub, paymentCreateSubscritionStub;
  let user, gift, groupId, email, headers, coupon, customerIdResponse, token;

  beforeEach(() => {
    user = new User();
    user.profile.name = 'sender';
    user.purchased.plan.customerId = 'customer-id';
    user.purchased.plan.planId = subKey;
    user.purchased.plan.lastBillingDate = new Date();

    token = 'test-token';

    customerIdResponse = 'example-customerIdResponse';
    let stripCustomerResponse = {
      id: customerIdResponse,
    };
    stripeChargeStub = sinon.stub(stripe.charges, 'create').returnsPromise().resolves(stripCustomerResponse);
    paymentBuyGemsStub = sinon.stub(payments, 'buyGems').returnsPromise().resolves({});
    paymentCreateSubscritionStub = sinon.stub(payments, 'createSubscription').returnsPromise().resolves({});
  });

  afterEach(() => {
    stripe.charges.create.restore();
    payments.buyGems.restore();
    payments.createSubscription.restore();
  });

  it('should error if gem amount is too low', async () => {
    let receivingUser = new User();
    receivingUser.save();
    gift = {
      type: 'gems',
      gems: {
        amount: 0,
        uuid: receivingUser._id,
      },
    };

    await expect(stripePayments.checkout({
      token,
      user,
      gift,
      groupId,
      email,
      headers,
      coupon,
    }, stripe))
    .to.eventually.be.rejected.and.to.eql({
      httpCode: 400,
      message: 'Amount must be at least 1.',
      name: 'BadRequest',
    });
  });


  it('should error if user cannot get gems', async () => {
    gift = undefined;
    sinon.stub(user, 'canGetGems').returnsPromise().resolves(false);

    await expect(stripePayments.checkout({
      token,
      user,
      gift,
      groupId,
      email,
      headers,
      coupon,
    }, stripe)).to.eventually.be.rejected.and.to.eql({
      httpCode: 401,
      message: i18n.t('groupPolicyCannotGetGems'),
      name: 'NotAuthorized',
    });
  });

  it('should purchase gems', async () => {
    gift = undefined;
    sinon.stub(user, 'canGetGems').returnsPromise().resolves(true);

    await stripePayments.checkout({
      token,
      user,
      gift,
      groupId,
      email,
      headers,
      coupon,
    }, stripe);

    expect(stripeChargeStub).to.be.calledOnce;
    expect(stripeChargeStub).to.be.calledWith({
      amount: 500,
      currency: 'usd',
      card: token,
    });

    expect(paymentBuyGemsStub).to.be.calledOnce;
    expect(paymentBuyGemsStub).to.be.calledWith({
      user,
      customerId: customerIdResponse,
      paymentMethod: 'Stripe',
      gift,
    });
    expect(user.canGetGems).to.be.calledOnce;
    user.canGetGems.restore();
  });

  it('should gift gems', async () => {
    let receivingUser = new User();
    await receivingUser.save();
    gift = {
      type: 'gems',
      uuid: receivingUser._id,
      gems: {
        amount: 16,
      },
    };

    await stripePayments.checkout({
      token,
      user,
      gift,
      groupId,
      email,
      headers,
      coupon,
    }, stripe);

    expect(stripeChargeStub).to.be.calledOnce;
    expect(stripeChargeStub).to.be.calledWith({
      amount: '400',
      currency: 'usd',
      card: token,
    });

    expect(paymentBuyGemsStub).to.be.calledOnce;
    expect(paymentBuyGemsStub).to.be.calledWith({
      user,
      customerId: customerIdResponse,
      paymentMethod: 'Gift',
      gift,
    });
  });

  it('should gift a subscription', async () => {
    let receivingUser = new User();
    receivingUser.save();
    gift = {
      type: 'subscription',
      subscription: {
        key: subKey,
        uuid: receivingUser._id,
      },
    };

    await stripePayments.checkout({
      token,
      user,
      gift,
      groupId,
      email,
      headers,
      coupon,
    }, stripe);

    gift.member = receivingUser;
    expect(stripeChargeStub).to.be.calledOnce;
    expect(stripeChargeStub).to.be.calledWith({
      amount: '1500',
      currency: 'usd',
      card: token,
    });

    expect(paymentCreateSubscritionStub).to.be.calledOnce;
    expect(paymentCreateSubscritionStub).to.be.calledWith({
      user,
      customerId: customerIdResponse,
      paymentMethod: 'Gift',
      gift,
    });
  });
});
