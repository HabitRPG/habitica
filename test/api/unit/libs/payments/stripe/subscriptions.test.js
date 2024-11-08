import cc from 'coupon-code';
import stripeModule from 'stripe';

import { model as Coupon } from '../../../../../../website/server/models/coupon';
import common from '../../../../../../website/common';
import {
  checkSubData,
  applySubscription,
  chargeForAdditionalGroupMember,
  handlePaymentMethodChange,
} from '../../../../../../website/server/libs/payments/stripe/subscriptions';
import {
  generateGroup,
} from '../../../../../helpers/api-unit.helper';
import { model as User } from '../../../../../../website/server/models/user';
import payments from '../../../../../../website/server/libs/payments/payments';
import stripePayments from '../../../../../../website/server/libs/payments/stripe';

const { i18n } = common;

describe('Stripe - Subscriptions', () => {
  describe('checkSubData', () => {
    it('does not throw if the subscription can be used', async () => {
      const sub = common.content.subscriptionBlocks['basic_3mo']; // eslint-disable-line dot-notation
      const res = await checkSubData(sub);
      expect(res).to.equal(undefined);
    });

    it('throws if the subscription does not exists', async () => {
      await expect(checkSubData())
        .to.eventually.be.rejected.and.to.eql({
          httpCode: 400,
          name: 'BadRequest',
          message: i18n.t('missingSubscriptionCode'),
        });
    });

    it('throws if the subscription can\'t be used', async () => {
      const sub = common.content.subscriptionBlocks['group_plan_auto']; // eslint-disable-line dot-notation
      await expect(checkSubData(sub, true))
        .to.eventually.be.rejected.and.to.eql({
          httpCode: 400,
          name: 'BadRequest',
          message: i18n.t('missingSubscriptionCode'),
        });
    });

    it('throws if the subscription targets a group and an user is making the request', async () => {
      const sub = common.content.subscriptionBlocks['group_monthly']; // eslint-disable-line dot-notation
      await expect(checkSubData(sub, false))
        .to.eventually.be.rejected.and.to.eql({
          httpCode: 400,
          name: 'BadRequest',
          message: i18n.t('missingSubscriptionCode'),
        });
    });

    it('throws if the subscription targets an user and a group is making the request', async () => {
      const sub = common.content.subscriptionBlocks['basic_3mo']; // eslint-disable-line dot-notation
      await expect(checkSubData(sub, true))
        .to.eventually.be.rejected.and.to.eql({
          httpCode: 400,
          name: 'BadRequest',
          message: i18n.t('missingSubscriptionCode'),
        });
    });

    it('throws if the coupon is required but not passed', async () => {
      const sub = common.content.subscriptionBlocks['google_6mo']; // eslint-disable-line dot-notation
      await expect(checkSubData(sub, false))
        .to.eventually.be.rejected.and.to.eql({
          httpCode: 400,
          name: 'BadRequest',
          message: i18n.t('couponCodeRequired'),
        });
    });

    it('throws if the coupon is required but does not exist', async () => {
      const coupon = 'not-valid';
      const sub = common.content.subscriptionBlocks['google_6mo']; // eslint-disable-line dot-notation
      await expect(checkSubData(sub, false, coupon))
        .to.eventually.be.rejected.and.to.eql({
          httpCode: 400,
          name: 'BadRequest',
          message: i18n.t('invalidCoupon'),
        });
    });

    it('throws if the coupon is required but is invalid', async () => {
      const couponModel = new Coupon();
      couponModel.event = 'google_6mo';
      await couponModel.save();

      sandbox.stub(cc, 'validate').returns('invalid');

      const sub = common.content.subscriptionBlocks['google_6mo']; // eslint-disable-line dot-notation
      await expect(checkSubData(sub, false, couponModel._id))
        .to.eventually.be.rejected.and.to.eql({
          httpCode: 400,
          name: 'BadRequest',
          message: i18n.t('invalidCoupon'),
        });
    });

    it('works if the coupon is required and valid', async () => {
      const couponModel = new Coupon();
      couponModel.event = 'google_6mo';
      await couponModel.save();

      sandbox.stub(cc, 'validate').returns(couponModel._id);

      const sub = common.content.subscriptionBlocks['google_6mo']; // eslint-disable-line dot-notation
      await checkSubData(sub, false, couponModel._id);
    });
  });

  describe('applySubscription', () => {
    let user; let group; let sub;
    let groupId;
    let customerId; let subscriptionId;
    let subKey;
    let userFindByIdStub;
    let stripePaymentsCreateSubSpy;

    beforeEach(async () => {
      subKey = 'basic_3mo';
      sub = common.content.subscriptionBlocks[subKey];

      user = new User();
      await user.save();

      const execStub = sandbox.stub().resolves(user);
      userFindByIdStub = sandbox.stub(User, 'findById');
      userFindByIdStub.withArgs(user._id).returns({ exec: execStub });

      group = generateGroup({
        name: 'test group',
        type: 'guild',
        privacy: 'public',
        leader: user._id,
      });
      groupId = group._id;
      await group.save();

      // Add user to group
      user.guilds.push(groupId);
      await user.save();

      customerId = 'test-id';
      subscriptionId = 'test-sub-id';

      stripePaymentsCreateSubSpy = sandbox.stub(payments, 'createSubscription');
      stripePaymentsCreateSubSpy.resolves({});
    });

    it('subscribes a user', async () => {
      await applySubscription({
        customer: customerId,
        subscription: subscriptionId,
        metadata: {
          sub: JSON.stringify(sub),
          userId: user._id,
          groupId: null,
        },
        user,
      });

      expect(stripePaymentsCreateSubSpy).to.be.calledOnce;
      expect(stripePaymentsCreateSubSpy).to.be.calledWith({
        user,
        customerId,
        subscriptionId,
        paymentMethod: 'Stripe',
        sub: sinon.match({ ...sub }),
        groupId: null,
      });
    });

    it('subscribes a group', async () => {
      sub = common.content.subscriptionBlocks['group_monthly']; // eslint-disable-line dot-notation
      await applySubscription({
        customer: customerId,
        subscription: subscriptionId,
        metadata: {
          sub: JSON.stringify(sub),
          userId: user._id,
          groupId,
        },
        user,
      });

      expect(stripePaymentsCreateSubSpy).to.be.calledOnce;
      expect(stripePaymentsCreateSubSpy).to.be.calledWith({
        user,
        customerId,
        subscriptionId,
        paymentMethod: 'Stripe',
        sub: sinon.match({ ...sub }),
        groupId,
      });
    });

    it('subscribes a group with multiple users', async () => {
      const user2 = new User();
      user2.guilds.push(groupId);
      await user2.save();

      const execStub2 = sandbox.stub().resolves(user);
      userFindByIdStub.withArgs(user2._id).returns({ exec: execStub2 });

      group.memberCount = 2;
      await group.save();

      sub = common.content.subscriptionBlocks['group_monthly']; // eslint-disable-line dot-notation
      await applySubscription({
        customer: customerId,
        subscription: subscriptionId,
        metadata: {
          sub: JSON.stringify(sub),
          userId: user._id,
          groupId,
        },
        user,
      });

      expect(stripePaymentsCreateSubSpy).to.be.calledOnce;
      expect(stripePaymentsCreateSubSpy).to.be.calledWith({
        user,
        customerId,
        subscriptionId,
        paymentMethod: 'Stripe',
        sub: sinon.match({ ...sub }),
        groupId,
      });
    });
  });

  describe('handlePaymentMethodChange', () => {
    const stripe = stripeModule('test');

    it('updates the plan quantity based on the number of group members', async () => {
      const stripeIntentRetrieveStub = sandbox.stub(stripe.setupIntents, 'retrieve').resolves({
        payment_method: 1,
        metadata: {
          subscription_id: 2,
        },
      });
      const stripeSubUpdateStub = sandbox.stub(stripe.subscriptions, 'update');

      await handlePaymentMethodChange({}, stripe);
      expect(stripeIntentRetrieveStub).to.be.calledOnce;
      expect(stripeSubUpdateStub).to.be.calledOnce;
      expect(stripeSubUpdateStub).to.be.calledWith(2, {
        default_payment_method: 1,
      });
    });
  });

  describe('chargeForAdditionalGroupMember', () => {
    const stripe = stripeModule('test');
    let stripeUpdateSubStub;
    const plan = common.content.subscriptionBlocks['group_monthly']; // eslint-disable-line dot-notation

    let user; let group;

    beforeEach(async () => {
      user = new User();

      group = generateGroup({
        name: 'test group',
        type: 'guild',
        privacy: 'public',
        leader: user._id,
      });
      group.purchased.plan.customerId = 'customer-id';
      group.purchased.plan.planId = plan.key;
      group.purchased.plan.subscriptionId = 'sub-id';
      await group.save();

      stripeUpdateSubStub = sandbox.stub(stripe.subscriptions, 'update').resolves({});
    });

    it('updates the plan quantity based on the number of group members', async () => {
      group.memberCount = 4;
      const newQuantity = group.memberCount + plan.quantity - 1;

      await chargeForAdditionalGroupMember(group, stripe);
      expect(stripeUpdateSubStub).to.be.calledWithMatch(
        group.purchased.plan.subscriptionId,
        sinon.match({
          plan: group.purchased.plan.planId,
          quantity: newQuantity,
        }),
      );
      expect(group.purchased.plan.quantity).to.equal(newQuantity);
    });
  });

  describe('cancelSubscription', () => {
    const subKey = 'basic_3mo';
    const stripe = stripeModule('test');
    let user; let groupId; let
      group;

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

      groupId = group._id;
    });

    it('throws an error if there is no customer id', async () => {
      user.purchased.plan.customerId = undefined;

      await expect(stripePayments.cancelSubscription({
        user,
        groupId: undefined,
      }))
        .to.eventually.be.rejected.and.to.eql({
          httpCode: 401,
          name: 'NotAuthorized',
          message: i18n.t('missingSubscription'),
        });
    });

    it('throws an error if the group is not found', async () => {
      await expect(stripePayments.cancelSubscription({
        user,
        groupId: 'fake-group',
      }))
        .to.eventually.be.rejected.and.to.eql({
          httpCode: 404,
          name: 'NotFound',
          message: i18n.t('groupNotFound'),
        });
    });

    it('throws an error if user is not the group leader', async () => {
      const nonLeader = new User();
      nonLeader.guilds.push(groupId);
      await nonLeader.save();

      await expect(stripePayments.cancelSubscription({
        user: nonLeader,
        groupId,
      }))
        .to.eventually.be.rejected.and.to.eql({
          httpCode: 401,
          name: 'NotAuthorized',
          message: i18n.t('onlyGroupLeaderCanManageSubscription'),
        });
    });

    describe('success', () => {
      let stripeDeleteCustomerStub; let paymentsCancelSubStub;
      let stripeRetrieveStub; let subscriptionId; let
        currentPeriodEndTimeStamp;

      beforeEach(() => {
        subscriptionId = 'subId';
        stripeDeleteCustomerStub = sinon.stub(stripe.customers, 'del').resolves({});
        paymentsCancelSubStub = sinon.stub(payments, 'cancelSubscription').resolves({});

        currentPeriodEndTimeStamp = (new Date()).getTime();
        stripeRetrieveStub = sinon.stub(stripe.customers, 'retrieve')
          .resolves({
            subscriptions: {
              data: [{
                id: subscriptionId,
                current_period_end: currentPeriodEndTimeStamp,
              }], // eslint-disable-line camelcase
            },
          });
      });

      afterEach(() => {
        stripe.customers.del.restore();
        stripe.customers.retrieve.restore();
        payments.cancelSubscription.restore();
      });

      it('cancels a user subscription', async () => {
        await stripePayments.cancelSubscription({
          user,
          groupId: undefined,
        }, stripe);

        expect(stripeDeleteCustomerStub).to.be.calledOnce;
        expect(stripeDeleteCustomerStub).to.be.calledWith(user.purchased.plan.customerId);
        expect(stripeRetrieveStub).to.be.calledOnce;
        expect(stripeRetrieveStub).to.be.calledWith(user.purchased.plan.customerId);
        expect(paymentsCancelSubStub).to.be.calledOnce;
        expect(paymentsCancelSubStub).to.be.calledWith({
          user,
          groupId: undefined,
          nextBill: currentPeriodEndTimeStamp * 1000, // timestamp in seconds
          paymentMethod: 'Stripe',
          cancellationReason: undefined,
        });
      });

      it('cancels a group subscription', async () => {
        await stripePayments.cancelSubscription({
          user,
          groupId,
        }, stripe);

        expect(stripeDeleteCustomerStub).to.be.calledOnce;
        expect(stripeDeleteCustomerStub).to.be.calledWith(group.purchased.plan.customerId);
        expect(stripeRetrieveStub).to.be.calledOnce;
        expect(stripeRetrieveStub).to.be.calledWith(user.purchased.plan.customerId);
        expect(paymentsCancelSubStub).to.be.calledOnce;
        expect(paymentsCancelSubStub).to.be.calledWith({
          user,
          groupId,
          nextBill: currentPeriodEndTimeStamp * 1000, // timestamp in seconds
          paymentMethod: 'Stripe',
          cancellationReason: undefined,
        });
      });
    });
  });
});
