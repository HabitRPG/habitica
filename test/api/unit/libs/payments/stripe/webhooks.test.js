import stripeModule from 'stripe';
import nconf from 'nconf';
import { v4 as uuid } from 'uuid';
import moment from 'moment';
import {
  generateGroup,
} from '../../../../../helpers/api-unit.helper';
import { model as User } from '../../../../../../website/server/models/user';
import stripePayments from '../../../../../../website/server/libs/payments/stripe';
import payments from '../../../../../../website/server/libs/payments/payments';
import common from '../../../../../../website/common';
import logger from '../../../../../../website/server/libs/logger';
import * as oneTimePayments from '../../../../../../website/server/libs/payments/stripe/oneTimePayments';
import * as subscriptions from '../../../../../../website/server/libs/payments/stripe/subscriptions';

const { i18n } = common;

describe('Stripe - Webhooks', () => {
  const stripe = stripeModule('test');
  const endpointSecret = nconf.get('STRIPE_WEBHOOKS_ENDPOINT_SECRET');
  const headers = {};
  const body = {};

  describe('all events', () => {
    let event;
    let constructEventStub;

    beforeEach(() => {
      event = { type: 'payment_intent.created' };
      constructEventStub = sandbox.stub(stripe.webhooks, 'constructEvent');
      constructEventStub.returns(event);
      sandbox.stub(logger, 'error');
    });

    it('throws if the event can\'t be validated', async () => {
      const err = new Error('fail');
      constructEventStub.throws(err);
      await expect(stripePayments.handleWebhooks({ body: event, headers }, stripe))
        .to.eventually.be.rejected.and.to.eql({
          httpCode: 400,
          name: 'BadRequest',
          message: `Webhook Error: ${err.message}`,
        });

      expect(logger.error).to.have.been.calledOnce;
      const calledWith = logger.error.getCall(0).args;
      expect(calledWith[0].message).to.equal('Error verifying Stripe webhook');
      expect(calledWith[1]).to.eql({ err });
    });

    it('logs an error if an unsupported webhook event is passed', async () => {
      event.type = 'account.updated';
      await expect(stripePayments.handleWebhooks({ body, headers }, stripe))
        .to.eventually.be.rejected.and.to.eql({
          httpCode: 400,
          name: 'BadRequest',
          message: `Missing handler for Stripe webhook ${event.type}`,
        });

      expect(logger.error).to.have.been.calledOnce;
      const calledWith = logger.error.getCall(0).args;
      expect(calledWith[0].message).to.equal('Error handling Stripe webhook');
      expect(calledWith[1].event).to.eql(event);
      expect(calledWith[1].err.message).to.eql(`Missing handler for Stripe webhook ${event.type}`);
    });

    it('retrieves and validates the event from Stripe', async () => {
      await stripePayments.handleWebhooks({ body, headers }, stripe);
      expect(stripe.webhooks.constructEvent).to.have.been.calledOnce;
      expect(stripe.webhooks.constructEvent)
        .to.have.been.calledWith(body, undefined, endpointSecret);
    });
  });

  describe('customer.subscription.deleted', () => {
    const eventType = 'customer.subscription.deleted';
    let event;
    let constructEventStub;

    beforeEach(() => {
      event = { type: eventType };
      constructEventStub = sandbox.stub(stripe.webhooks, 'constructEvent');
      constructEventStub.returns(event);
    });

    beforeEach(() => {
      sandbox.stub(stripe.customers, 'del').resolves({});
      sandbox.stub(payments, 'cancelSubscription').resolves({});
    });

    it('does not do anything if event.request is not null (subscription cancelled manually)', async () => {
      constructEventStub.returns({
        id: 123,
        type: eventType,
        request: { id: 123 },
      });

      await stripePayments.handleWebhooks({ body, headers }, stripe);

      expect(stripe.webhooks.constructEvent).to.have.been.calledOnce;
      expect(stripe.customers.del).to.not.have.been.called;
      expect(payments.cancelSubscription).to.not.have.been.called;
    });

    describe('user subscription', () => {
      it('throws an error if the user is not found', async () => {
        const customerId = 456;
        constructEventStub.returns({
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
          request: { id: null },
        });

        await expect(stripePayments.handleWebhooks({ body, headers }, stripe))
          .to.eventually.be.rejectedWith({
            message: i18n.t('userNotFound'),
            httpCode: 404,
            name: 'NotFound',
          });

        expect(stripe.customers.del).to.not.have.been.called;
        expect(payments.cancelSubscription).to.not.have.been.called;
      });

      it('deletes the customer on Stripe and calls payments.cancelSubscription', async () => {
        const customerId = '456';

        const subscriber = new User();
        subscriber.purchased.plan.customerId = customerId;
        subscriber.purchased.plan.paymentMethod = 'Stripe';
        await subscriber.save();

        constructEventStub.returns({
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
          request: { id: null },
        });

        await stripePayments.handleWebhooks({ body, headers }, stripe);

        expect(stripe.customers.del).to.have.been.calledOnce;
        expect(stripe.customers.del).to.have.been.calledWith(customerId);
        expect(payments.cancelSubscription).to.have.been.calledOnce;

        const cancelSubscriptionOpts = payments.cancelSubscription.lastCall.args[0];
        expect(cancelSubscriptionOpts.user._id).to.equal(subscriber._id);
        expect(cancelSubscriptionOpts.paymentMethod).to.equal('Stripe');
        expect(Math.round(moment(cancelSubscriptionOpts.nextBill).diff(new Date(), 'days', true))).to.equal(3);
        expect(cancelSubscriptionOpts.groupId).to.be.undefined;
      });
    });

    describe('group plan subscription', () => {
      it('throws an error if the group is not found', async () => {
        const customerId = 456;
        constructEventStub.returns({
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
          request: { id: null },
        });

        await expect(stripePayments.handleWebhooks({ body, headers }, stripe))
          .to.eventually.be.rejectedWith({
            message: i18n.t('groupNotFound'),
            httpCode: 404,
            name: 'NotFound',
          });

        expect(stripe.customers.del).to.not.have.been.called;
        expect(payments.cancelSubscription).to.not.have.been.called;
      });

      it('throws an error if the group leader is not found', async () => {
        const customerId = 456;

        const subscriber = generateGroup({
          name: 'test group',
          type: 'guild',
          privacy: 'public',
          leader: uuid(),
        });
        subscriber.purchased.plan.customerId = customerId;
        subscriber.purchased.plan.paymentMethod = 'Stripe';
        await subscriber.save();

        constructEventStub.returns({
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
          request: { id: null },
        });

        await expect(stripePayments.handleWebhooks({ body, headers }, stripe))
          .to.eventually.be.rejectedWith({
            message: i18n.t('userNotFound'),
            httpCode: 404,
            name: 'NotFound',
          });

        expect(stripe.customers.del).to.not.have.been.called;
        expect(payments.cancelSubscription).to.not.have.been.called;
      });

      it('deletes the customer on Stripe and calls payments.cancelSubscription', async () => {
        const customerId = '456';

        const leader = new User();
        await leader.save();

        const subscriber = generateGroup({
          name: 'test group',
          type: 'guild',
          privacy: 'public',
          leader: leader._id,
        });
        subscriber.purchased.plan.customerId = customerId;
        subscriber.purchased.plan.paymentMethod = 'Stripe';
        await subscriber.save();

        constructEventStub.returns({
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
          request: { id: null },
        });

        await stripePayments.handleWebhooks({ body, headers }, stripe);

        expect(stripe.customers.del).to.have.been.calledOnce;
        expect(stripe.customers.del).to.have.been.calledWith(customerId);
        expect(payments.cancelSubscription).to.have.been.calledOnce;

        const cancelSubscriptionOpts = payments.cancelSubscription.lastCall.args[0];
        expect(cancelSubscriptionOpts.user._id).to.equal(leader._id);
        expect(cancelSubscriptionOpts.paymentMethod).to.equal('Stripe');
        expect(Math.round(moment(cancelSubscriptionOpts.nextBill).diff(new Date(), 'days', true))).to.equal(3);
        expect(cancelSubscriptionOpts.groupId).to.equal(subscriber._id);
      });
    });
  });

  describe('checkout.session.completed', () => {
    const eventType = 'checkout.session.completed';
    let event;
    let constructEventStub;
    const session = {};

    beforeEach(() => {
      session.metadata = {};
      event = { type: eventType, data: { object: session } };
      constructEventStub = sandbox.stub(stripe.webhooks, 'constructEvent');
      constructEventStub.returns(event);

      sandbox.stub(oneTimePayments, 'applyGemPayment').resolves({});
      sandbox.stub(subscriptions, 'applySubscription').resolves({});
      sandbox.stub(subscriptions, 'handlePaymentMethodChange').resolves({});
    });

    it('handles changing an user sub', async () => {
      session.metadata.type = 'edit-card-user';

      await stripePayments.handleWebhooks({ body, headers }, stripe);

      expect(stripe.webhooks.constructEvent).to.have.been.calledOnce;
      expect(subscriptions.handlePaymentMethodChange).to.have.been.calledOnce;
      expect(subscriptions.handlePaymentMethodChange).to.have.been.calledWith(session);
    });

    it('handles changing a group sub', async () => {
      session.metadata.type = 'edit-card-group';

      await stripePayments.handleWebhooks({ body, headers }, stripe);

      expect(stripe.webhooks.constructEvent).to.have.been.calledOnce;
      expect(subscriptions.handlePaymentMethodChange).to.have.been.calledOnce;
      expect(subscriptions.handlePaymentMethodChange).to.have.been.calledWith(session);
    });

    it('applies a subscription', async () => {
      session.metadata.type = 'subscription';

      await stripePayments.handleWebhooks({ body, headers }, stripe);

      expect(stripe.webhooks.constructEvent).to.have.been.calledOnce;
      expect(subscriptions.applySubscription).to.have.been.calledOnce;
      expect(subscriptions.applySubscription).to.have.been.calledWith(session);
    });

    it('handles a one time payment', async () => {
      session.metadata.type = 'something else';

      await stripePayments.handleWebhooks({ body, headers }, stripe);

      expect(stripe.webhooks.constructEvent).to.have.been.calledOnce;
      expect(oneTimePayments.applyGemPayment).to.have.been.calledOnce;
      expect(oneTimePayments.applyGemPayment).to.have.been.calledWith(session);
    });
  });
});
