import moment from 'moment';
import stripeModule from 'stripe';

import {
  generateGroup,
} from '../../../../helpers/api-unit.helper.js';
import { model as User } from '../../../../../website/server/models/user';
import { model as Coupon } from '../../../../../website/server/models/coupon';
import stripePayments from '../../../../../website/server/libs/stripePayments';
import payments from '../../../../../website/server/libs/payments';
import common from '../../../../../website/common';

const i18n = common.i18n;

describe.only('Stripe Payments', () => {
  let subKey = 'basic_3mo';
  let stripe = stripeModule('test');

  describe('checkout', () => {
    let user, group, data;
    let spy;
    let stripeCreateCustomerSpy;
    let createSubSpy;

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

      data = {
        user,
        sub: {
          key: 'basic_3mo',
        },
        customerId: 'customer-id',
        paymentMethod: 'Payment Method',
      };

      spy = sinon.stub(stripe.subscriptions, 'update');
      spy.returnsPromise().resolves;

      stripeCreateCustomerSpy = sinon.stub(stripe.customers, 'create');
      let stripCustomerResponse = {
        subscriptions: {
          data: [{id: 'test-id'}],
        },
      };
      stripeCreateCustomerSpy.returnsPromise().resolves(stripCustomerResponse);

      createSubSpy = sinon.stub(payments, 'createSubscription');
      createSubSpy.returnsPromise().resolves({});

      data.groupId = group._id;
      data.sub.quantity = 3;
    });

    afterEach(function () {
      sinon.restore(stripe.subscriptions.update);
      stripe.customers.create.restore();
      payments.createSubscription.restore();
    });

    it('subscribes with stripe', async () => {
      let token = 'test-token';
      let gift;
      let sub = data.sub;
      let groupId = group._id;
      let email = 'test@test.com';
      let headers = {};
      let coupon;

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

      expect(stripeCreateCustomerSpy.calledOnce).to.be.true;
      expect(createSubSpy.calledOnce).to.be.true;
    });
  });
});
