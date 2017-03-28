import stripeModule from 'stripe';
import cc from 'coupon-code';

import {
  generateGroup,
} from '../../../../helpers/api-unit.helper.js';
import { model as User } from '../../../../../website/server/models/user';
import { model as Group } from '../../../../../website/server/models/group';
import { model as Coupon } from '../../../../../website/server/models/coupon';
import stripePayments from '../../../../../website/server/libs/stripePayments';
import payments from '../../../../../website/server/libs/payments';
import common from '../../../../../website/common';
import logger from '../../../../../website/server/libs/logger';
import { v4 as uuid } from 'uuid';

const i18n = common.i18n;

describe('Stripe Payments', () => {
  let subKey = 'basic_3mo';
  let stripe = stripeModule('test');

  describe('checkout', () => {
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

    it('should purchase gems', async () => {
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
    });

    it('should gift gems', async () => {
      let receivingUser = new User();
      receivingUser.save();
      gift = {
        type: 'gems',
        gems: {
          amount: 16,
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

  describe('checkout with subscription', () => {
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

  describe('edit subscription', () => {
    let user, groupId, group, token;

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

      token = 'test-token';
    });

    it('throws an error if there is no customer id', async () => {
      user.purchased.plan.customerId = undefined;

      await expect(stripePayments.editSubscription({
        user,
        groupId: undefined,
      }))
      .to.eventually.be.rejected.and.to.eql({
        httpCode: 401,
        name: 'NotAuthorized',
        message: i18n.t('missingSubscription'),
      });
    });

    it('throws an error if a token is not provided', async () => {
      await expect(stripePayments.editSubscription({
        user,
        groupId: undefined,
      }))
      .to.eventually.be.rejected.and.to.eql({
        httpCode: 400,
        name: 'BadRequest',
        message: 'Missing req.body.id',
      });
    });

    it('throws an error if the group is not found', async () => {
      await expect(stripePayments.editSubscription({
        token,
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
      let nonLeader = new User();
      nonLeader.guilds.push(groupId);
      await nonLeader.save();

      await expect(stripePayments.editSubscription({
        token,
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
      let stripeListSubscriptionStub, stripeUpdateSubscriptionStub, subscriptionId;

      beforeEach(() => {
        subscriptionId = 'subId';
        stripeListSubscriptionStub = sinon.stub(stripe.customers, 'listSubscriptions')
          .returnsPromise().resolves({
            data: [{id: subscriptionId}],
          });

        stripeUpdateSubscriptionStub = sinon.stub(stripe.customers, 'updateSubscription').returnsPromise().resolves({});
      });

      afterEach(() => {
        stripe.customers.listSubscriptions.restore();
        stripe.customers.updateSubscription.restore();
      });

      it('edits a user subscription', async () => {
        await stripePayments.editSubscription({
          token,
          user,
          groupId: undefined,
        }, stripe);

        expect(stripeListSubscriptionStub).to.be.calledOnce;
        expect(stripeListSubscriptionStub).to.be.calledWith(user.purchased.plan.customerId);
        expect(stripeUpdateSubscriptionStub).to.be.calledOnce;
        expect(stripeUpdateSubscriptionStub).to.be.calledWith(
          user.purchased.plan.customerId,
          subscriptionId,
          { card: token }
        );
      });

      it('edits a group subscription', async () => {
        await stripePayments.editSubscription({
          token,
          user,
          groupId,
        }, stripe);

        expect(stripeListSubscriptionStub).to.be.calledOnce;
        expect(stripeListSubscriptionStub).to.be.calledWith(group.purchased.plan.customerId);
        expect(stripeUpdateSubscriptionStub).to.be.calledOnce;
        expect(stripeUpdateSubscriptionStub).to.be.calledWith(
          group.purchased.plan.customerId,
          subscriptionId,
          { card: token }
        );
      });
    });
  });

  describe('cancel subscription', () => {
    let user, groupId, group;

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
      let nonLeader = new User();
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
      let stripeDeleteCustomerStub, paymentsCancelSubStub, stripeRetrieveStub, subscriptionId, currentPeriodEndTimeStamp;

      beforeEach(() => {
        subscriptionId = 'subId';
        stripeDeleteCustomerStub = sinon.stub(stripe.customers, 'del').returnsPromise().resolves({});
        paymentsCancelSubStub = sinon.stub(payments, 'cancelSubscription').returnsPromise().resolves({});

        currentPeriodEndTimeStamp = (new Date()).getTime();
        stripeRetrieveStub = sinon.stub(stripe.customers, 'retrieve')
          .returnsPromise().resolves({
            subscriptions: {
              data: [{id: subscriptionId, current_period_end: currentPeriodEndTimeStamp}], // eslint-disable-line camelcase
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
        });
      });
    });
  });

  describe('#upgradeGroupPlan', () => {
    let spy, data, user, group;

    beforeEach(async function () {
      user = new User();
      user.profile.name = 'sender';

      data = {
        user,
        sub: {
          key: 'basic_3mo', // @TODO: Validate that this is group
        },
        customerId: 'customer-id',
        paymentMethod: 'Payment Method',
        headers: {
          'x-client': 'habitica-web',
          'user-agent': '',
        },
      };

      group = generateGroup({
        name: 'test group',
        type: 'guild',
        privacy: 'public',
        leader: user._id,
      });
      await group.save();

      spy = sinon.stub(stripe.subscriptions, 'update');
      spy.returnsPromise().resolves([]);
      data.groupId = group._id;
      data.sub.quantity = 3;
      stripePayments.setStripeApi(stripe);
    });

    afterEach(function () {
      sinon.restore(stripe.subscriptions.update);
    });

    it('updates a group plan quantity', async () => {
      data.paymentMethod = 'Stripe';
      await payments.createSubscription(data);

      let updatedGroup = await Group.findById(group._id).exec();
      expect(updatedGroup.purchased.plan.quantity).to.eql(3);

      updatedGroup.memberCount += 1;
      await updatedGroup.save();

      await stripePayments.chargeForAdditionalGroupMember(updatedGroup);

      expect(spy.calledOnce).to.be.true;
      expect(updatedGroup.purchased.plan.quantity).to.eql(4);
    });
  });

  describe('handleWebhooks', () => {
    describe('all events', () => {
      const eventType = 'account.updated';
      const event = {id: 123};
      const eventRetrieved = {type: eventType};

      beforeEach(() => {
        sinon.stub(stripe.events, 'retrieve').returnsPromise().resolves(eventRetrieved);
        sinon.stub(logger, 'error');
      });

      afterEach(() => {
        stripe.events.retrieve.restore();
        logger.error.restore();
      });

      it('logs an error if an unsupported webhook event is passed', async () => {
        const error = new Error(`Missing handler for Stripe webhook ${eventType}`);
        await stripePayments.handleWebhooks({requestBody: event}, stripe);
        expect(logger.error).to.have.been.called.once;
        expect(logger.error).to.have.been.calledWith(error, {event: eventRetrieved});
      });

      it('retrieves and validates the event from Stripe', async () => {
        await stripePayments.handleWebhooks({requestBody: event}, stripe);
        expect(stripe.events.retrieve).to.have.been.called.once;
        expect(stripe.events.retrieve).to.have.been.calledWith(event.id);
      });
    });

    describe('customer.subscription.deleted', () => {
      const eventType = 'customer.subscription.deleted';

      beforeEach(() => {
        sinon.stub(stripe.customers, 'del').returnsPromise().resolves({});
        sinon.stub(payments, 'cancelSubscription').returnsPromise().resolves({});
      });

      afterEach(() => {
        stripe.customers.del.restore();
        payments.cancelSubscription.restore();
      });

      it('does not do anything if event.request is null (subscription cancelled manually)', async () => {
        sinon.stub(stripe.events, 'retrieve').returnsPromise().resolves({
          id: 123,
          type: eventType,
          request: null,
        });

        await stripePayments.handleWebhooks({requestBody: {}}, stripe);

        expect(stripe.events.retrieve).to.have.been.called.once;
        expect(stripe.customers.del).to.not.have.been.called;
        expect(payments.cancelSubscription).to.not.have.been.called;
        stripe.events.retrieve.restore();
      });

      describe('user subscription', () => {
        it('throws an error if the user is not found', async () => {
          const customerId = 456;
          sinon.stub(stripe.events, 'retrieve').returnsPromise().resolves({
            id: 123,
            type: eventType,
            data: {
              object: {
                plan: {
                  id: 'basic_earned',
                },
                customer: customerId,
              },
            },
          });

          await expect(stripePayments.handleWebhooks({requestBody: {}}, stripe)).to.eventually.be.rejectedWith({
            message: i18n.t('userNotFound'),
            httpCode: 404,
            name: 'NotFound',
          });

          expect(stripe.customers.del).to.not.have.been.called;
          expect(payments.cancelSubscription).to.not.have.been.called;

          stripe.events.retrieve.restore();
        });

        it('deletes the customer on Stripe and calls payments.cancelSubscription', async () => {
          const customerId = '456';

          let subscriber = new User();
          subscriber.purchased.plan.customerId = customerId;
          subscriber.purchased.plan.paymentMethod = 'Stripe';
          await subscriber.save();

          sinon.stub(stripe.events, 'retrieve').returnsPromise().resolves({
            id: 123,
            type: eventType,
            data: {
              object: {
                plan: {
                  id: 'basic_earned',
                },
                customer: customerId,
              },
            },
          });

          await stripePayments.handleWebhooks({requestBody: {}}, stripe);

          expect(stripe.customers.del).to.have.been.calledOnce;
          expect(stripe.customers.del).to.have.been.calledWith(customerId);
          expect(payments.cancelSubscription).to.have.been.calledOnce;

          let cancelSubscriptionOpts = payments.cancelSubscription.lastCall.args[0];
          expect(cancelSubscriptionOpts.user._id).to.equal(subscriber._id);
          expect(cancelSubscriptionOpts.paymentMethod).to.equal('Stripe');
          expect(cancelSubscriptionOpts.groupId).to.be.undefined;

          stripe.events.retrieve.restore();
        });
      });

      describe('group plan subscription', () => {
        it('throws an error if the group is not found', async () => {
          const customerId = 456;
          sinon.stub(stripe.events, 'retrieve').returnsPromise().resolves({
            id: 123,
            type: eventType,
            data: {
              object: {
                plan: {
                  id: 'group_monthly',
                },
                customer: customerId,
              },
            },
          });

          await expect(stripePayments.handleWebhooks({requestBody: {}}, stripe)).to.eventually.be.rejectedWith({
            message: i18n.t('groupNotFound'),
            httpCode: 404,
            name: 'NotFound',
          });

          expect(stripe.customers.del).to.not.have.been.called;
          expect(payments.cancelSubscription).to.not.have.been.called;

          stripe.events.retrieve.restore();
        });

        it('throws an error if the group leader is not found', async () => {
          const customerId = 456;

          let subscriber = generateGroup({
            name: 'test group',
            type: 'guild',
            privacy: 'public',
            leader: uuid(),
          });
          subscriber.purchased.plan.customerId = customerId;
          subscriber.purchased.plan.paymentMethod = 'Stripe';
          await subscriber.save();

          sinon.stub(stripe.events, 'retrieve').returnsPromise().resolves({
            id: 123,
            type: eventType,
            data: {
              object: {
                plan: {
                  id: 'group_monthly',
                },
                customer: customerId,
              },
            },
          });

          await expect(stripePayments.handleWebhooks({requestBody: {}}, stripe)).to.eventually.be.rejectedWith({
            message: i18n.t('userNotFound'),
            httpCode: 404,
            name: 'NotFound',
          });

          expect(stripe.customers.del).to.not.have.been.called;
          expect(payments.cancelSubscription).to.not.have.been.called;

          stripe.events.retrieve.restore();
        });

        it('deletes the customer on Stripe and calls payments.cancelSubscription', async () => {
          const customerId = '456';

          let leader = new User();
          await leader.save();

          let subscriber = generateGroup({
            name: 'test group',
            type: 'guild',
            privacy: 'public',
            leader: leader._id,
          });
          subscriber.purchased.plan.customerId = customerId;
          subscriber.purchased.plan.paymentMethod = 'Stripe';
          await subscriber.save();

          sinon.stub(stripe.events, 'retrieve').returnsPromise().resolves({
            id: 123,
            type: eventType,
            data: {
              object: {
                plan: {
                  id: 'group_monthly',
                },
                customer: customerId,
              },
            },
          });

          await stripePayments.handleWebhooks({requestBody: {}}, stripe);

          expect(stripe.customers.del).to.have.been.calledOnce;
          expect(stripe.customers.del).to.have.been.calledWith(customerId);
          expect(payments.cancelSubscription).to.have.been.calledOnce;

          let cancelSubscriptionOpts = payments.cancelSubscription.lastCall.args[0];
          expect(cancelSubscriptionOpts.user._id).to.equal(leader._id);
          expect(cancelSubscriptionOpts.paymentMethod).to.equal('Stripe');
          expect(cancelSubscriptionOpts.groupId).to.equal(subscriber._id);

          stripe.events.retrieve.restore();
        });
      });
    });
  });
});
