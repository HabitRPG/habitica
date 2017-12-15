import stripeModule from 'stripe';
import cc from 'coupon-code';

import {
  generateGroup,
} from '../../../../../../helpers/api-unit.helper.js';
import { model as User } from '../../../../../../../website/server/models/user';
import { model as Coupon } from '../../../../../../../website/server/models/coupon';
import stripePayments from '../../../../../../../website/server/libs/stripePayments';
import payments from '../../../../../../../website/server/libs/payments';
import common from '../../../../../../../website/common';

const i18n = common.i18n;

describe('checkout with subscription', () => {
  const subKey = 'basic_3mo';
  const stripe = stripeModule('test');
  let user, group, data, gift, sub, groupId, email, headers, coupon, customerIdResponse, subscriptionId, token;
  let spy;
  let stripeCreateCustomerSpy;
  let stripePaymentsCreateSubSpy;

  beforeEach(async () => {
    user = new User();
    user.profile.name = 'sender';
    user.purchased.plan.customerId = 'customer-id';
    user.purchased.plan.planId = subKey;
    user.purchased.plan.lastBillingDate = new Date();

    group = generateGroup({
      name: 'test group',
      type: 'guild',
      privacy: 'public',
      leader: user._id,
    });
    group.purchased.plan.customerId = 'customer-id';
    group.purchased.plan.planId = subKey;
    await group.save();

    sub = {
      key: 'basic_3mo',
    };

    data = {
      user,
      sub,
      customerId: 'customer-id',
      paymentMethod: 'Payment Method',
    };

    email = 'example@example.com';
    customerIdResponse = 'test-id';
    subscriptionId = 'test-sub-id';
    token = 'test-token';

    spy = sinon.stub(stripe.subscriptions, 'update');
    spy.returnsPromise().resolves;

    stripeCreateCustomerSpy = sinon.stub(stripe.customers, 'create');
    let stripCustomerResponse = {
      id: customerIdResponse,
      subscriptions: {
        data: [{id: subscriptionId}],
      },
    };
    stripeCreateCustomerSpy.returnsPromise().resolves(stripCustomerResponse);

    stripePaymentsCreateSubSpy = sinon.stub(payments, 'createSubscription');
    stripePaymentsCreateSubSpy.returnsPromise().resolves({});

    data.groupId = group._id;
    data.sub.quantity = 3;
  });

  afterEach(function () {
    sinon.restore(stripe.subscriptions.update);
    stripe.customers.create.restore();
    payments.createSubscription.restore();
  });

  it('should throw an error if we are missing a token', async () => {
    await expect(stripePayments.checkout({
      user,
      gift,
      sub,
      groupId,
      email,
      headers,
      coupon,
    }))
    .to.eventually.be.rejected.and.to.eql({
      httpCode: 400,
      name: 'BadRequest',
      message: 'Missing req.body.id',
    });
  });

  it('should throw an error when coupon code is missing', async () => {
    sub.discount = 40;

    await expect(stripePayments.checkout({
      token,
      user,
      gift,
      sub,
      groupId,
      email,
      headers,
      coupon,
    }))
    .to.eventually.be.rejected.and.to.eql({
      httpCode: 400,
      name: 'BadRequest',
      message: i18n.t('couponCodeRequired'),
    });
  });

  it('should throw an error when coupon code is invalid', async () => {
    sub.discount = 40;
    sub.key = 'google_6mo';
    coupon = 'example-coupon';

    let couponModel = new Coupon();
    couponModel.event = 'google_6mo';
    await couponModel.save();

    sinon.stub(cc, 'validate').returns('invalid');

    await expect(stripePayments.checkout({
      token,
      user,
      gift,
      sub,
      groupId,
      email,
      headers,
      coupon,
    }))
    .to.eventually.be.rejected.and.to.eql({
      httpCode: 400,
      name: 'BadRequest',
      message: i18n.t('invalidCoupon'),
    });
    cc.validate.restore();
  });

  it('subscribes with amazon with a coupon', async () => {
    sub.discount = 40;
    sub.key = 'google_6mo';
    coupon = 'example-coupon';

    let couponModel = new Coupon();
    couponModel.event = 'google_6mo';
    let updatedCouponModel = await couponModel.save();

    sinon.stub(cc, 'validate').returns(updatedCouponModel._id);

    await stripePayments.checkout({
      token,
      user,
      gift,
      sub,
      groupId,
      email,
      headers,
      coupon,
    }, stripe);

    expect(stripeCreateCustomerSpy).to.be.calledOnce;
    expect(stripeCreateCustomerSpy).to.be.calledWith({
      email,
      metadata: { uuid: user._id },
      card: token,
      plan: sub.key,
    });

    expect(stripePaymentsCreateSubSpy).to.be.calledOnce;
    expect(stripePaymentsCreateSubSpy).to.be.calledWith({
      user,
      customerId: customerIdResponse,
      paymentMethod: 'Stripe',
      sub,
      headers,
      groupId: undefined,
      subscriptionId: undefined,
    });

    cc.validate.restore();
  });

  it('subscribes a user', async () => {
    sub = data.sub;

    await stripePayments.checkout({
      token,
      user,
      gift,
      sub,
      groupId,
      email,
      headers,
      coupon,
    }, stripe);

    expect(stripeCreateCustomerSpy).to.be.calledOnce;
    expect(stripeCreateCustomerSpy).to.be.calledWith({
      email,
      metadata: { uuid: user._id },
      card: token,
      plan: sub.key,
    });

    expect(stripePaymentsCreateSubSpy).to.be.calledOnce;
    expect(stripePaymentsCreateSubSpy).to.be.calledWith({
      user,
      customerId: customerIdResponse,
      paymentMethod: 'Stripe',
      sub,
      headers,
      groupId: undefined,
      subscriptionId: undefined,
    });
  });

  it('subscribes a group', async () => {
    token = 'test-token';
    sub = data.sub;
    groupId = group._id;
    email = 'test@test.com';
    headers = {};

    await stripePayments.checkout({
      token,
      user,
      gift,
      sub,
      groupId,
      email,
      headers,
      coupon,
    }, stripe);

    expect(stripeCreateCustomerSpy).to.be.calledOnce;
    expect(stripeCreateCustomerSpy).to.be.calledWith({
      email,
      metadata: { uuid: user._id },
      card: token,
      plan: sub.key,
      quantity: 3,
    });

    expect(stripePaymentsCreateSubSpy).to.be.calledOnce;
    expect(stripePaymentsCreateSubSpy).to.be.calledWith({
      user,
      customerId: customerIdResponse,
      paymentMethod: 'Stripe',
      sub,
      headers,
      groupId,
      subscriptionId,
    });
  });

  it('subscribes a group with the correct number of group members', async () => {
    token = 'test-token';
    sub = data.sub;
    groupId = group._id;
    email = 'test@test.com';
    headers = {};
    user = new User();
    user.guilds.push(groupId);
    await user.save();
    group.memberCount = 2;
    await group.save();

    await stripePayments.checkout({
      token,
      user,
      gift,
      sub,
      groupId,
      email,
      headers,
      coupon,
    }, stripe);

    expect(stripeCreateCustomerSpy).to.be.calledOnce;
    expect(stripeCreateCustomerSpy).to.be.calledWith({
      email,
      metadata: { uuid: user._id },
      card: token,
      plan: sub.key,
      quantity: 4,
    });

    expect(stripePaymentsCreateSubSpy).to.be.calledOnce;
    expect(stripePaymentsCreateSubSpy).to.be.calledWith({
      user,
      customerId: customerIdResponse,
      paymentMethod: 'Stripe',
      sub,
      headers,
      groupId,
      subscriptionId,
    });
  });
});
