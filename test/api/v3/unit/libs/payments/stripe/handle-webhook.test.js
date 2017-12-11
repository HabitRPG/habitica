import stripeModule from 'stripe';

import {
  generateGroup,
} from '../../../../../../helpers/api-unit.helper.js';
import { model as User } from '../../../../../../../website/server/models/user';
import stripePayments from '../../../../../../../website/server/libs/stripePayments';
import payments from '../../../../../../../website/server/libs/payments';
import common from '../../../../../../../website/common';
import logger from '../../../../../../../website/server/libs/logger';
import { v4 as uuid } from 'uuid';
import moment from 'moment';

const i18n = common.i18n;

describe('Stripe - Webhooks', () => {
  const stripe = stripeModule('test');

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
        request: 123,
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
          request: null,
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
          request: null,
        });

        await stripePayments.handleWebhooks({requestBody: {}}, stripe);

        expect(stripe.customers.del).to.have.been.calledOnce;
        expect(stripe.customers.del).to.have.been.calledWith(customerId);
        expect(payments.cancelSubscription).to.have.been.calledOnce;

        let cancelSubscriptionOpts = payments.cancelSubscription.lastCall.args[0];
        expect(cancelSubscriptionOpts.user._id).to.equal(subscriber._id);
        expect(cancelSubscriptionOpts.paymentMethod).to.equal('Stripe');
        expect(Math.round(moment(cancelSubscriptionOpts.nextBill).diff(new Date(), 'days', true))).to.equal(3);
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
          request: null,
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
          request: null,
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
          request: null,
        });

        await stripePayments.handleWebhooks({requestBody: {}}, stripe);

        expect(stripe.customers.del).to.have.been.calledOnce;
        expect(stripe.customers.del).to.have.been.calledWith(customerId);
        expect(payments.cancelSubscription).to.have.been.calledOnce;

        let cancelSubscriptionOpts = payments.cancelSubscription.lastCall.args[0];
        expect(cancelSubscriptionOpts.user._id).to.equal(leader._id);
        expect(cancelSubscriptionOpts.paymentMethod).to.equal('Stripe');
        expect(Math.round(moment(cancelSubscriptionOpts.nextBill).diff(new Date(), 'days', true))).to.equal(3);
        expect(cancelSubscriptionOpts.groupId).to.equal(subscriber._id);

        stripe.events.retrieve.restore();
      });
    });
  });
});
