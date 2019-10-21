import stripeModule from 'stripe';

import {
  generateGroup,
} from '../../../../../helpers/api-unit.helper';
import { model as User } from '../../../../../../website/server/models/user';
import stripePayments from '../../../../../../website/server/libs/payments/stripe';
import payments from '../../../../../../website/server/libs/payments/payments';
import common from '../../../../../../website/common';

const { i18n } = common;

describe('cancel subscription', () => {
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
