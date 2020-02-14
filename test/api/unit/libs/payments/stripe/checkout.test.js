import stripeModule from 'stripe';

import { model as User } from '../../../../../../website/server/models/user';
import stripePayments from '../../../../../../website/server/libs/payments/stripe';
import payments from '../../../../../../website/server/libs/payments/payments';
import common from '../../../../../../website/common';

const { i18n } = common;

describe('checkout', () => {
  const subKey = 'basic_3mo';
  const stripe = stripeModule('test');
  let stripeChargeStub; let paymentBuyGemsStub; let
    paymentCreateSubscritionStub;
  let user; let gift; let groupId; let email; let headers; let coupon; let customerIdResponse; let
    token;

  beforeEach(() => {
    user = new User();
    user.profile.name = 'sender';
    user.purchased.plan.customerId = 'customer-id';
    user.purchased.plan.planId = subKey;
    user.purchased.plan.lastBillingDate = new Date();

    token = 'test-token';

    customerIdResponse = 'example-customerIdResponse';
    const stripCustomerResponse = {
      id: customerIdResponse,
    };
    stripeChargeStub = sinon.stub(stripe.charges, 'create').resolves(stripCustomerResponse);
    paymentBuyGemsStub = sinon.stub(payments, 'buyGems').resolves({});
    paymentCreateSubscritionStub = sinon.stub(payments, 'createSubscription').resolves({});
  });

  afterEach(() => {
    stripe.charges.create.restore();
    payments.buyGems.restore();
    payments.createSubscription.restore();
  });

  it('should error if there is no token', async () => {
    await expect(stripePayments.checkout({
      user,
      gift,
      groupId,
      email,
      headers,
      coupon,
    }, stripe))
      .to.eventually.be.rejected.and.to.eql({
        httpCode: 400,
        message: 'Missing req.body.id',
        name: 'BadRequest',
      });
  });

  it('should error if gem amount is too low', async () => {
    const receivingUser = new User();
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
    sinon.stub(user, 'canGetGems').resolves(false);

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
    sinon.stub(user, 'canGetGems').resolves(true);

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
    const receivingUser = new User();
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
    const receivingUser = new User();
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
