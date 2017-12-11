import stripeModule from 'stripe';

import {
  generateGroup,
} from '../../../../../../helpers/api-unit.helper.js';
import { model as User } from '../../../../../../../website/server/models/user';
import stripePayments from '../../../../../../../website/server/libs/stripePayments';
import payments from '../../../../../../../website/server/libs/payments';
import common from '../../../../../../../website/common';

const i18n = common.i18n;

describe('cancel subscription', () => {
  const subKey = 'basic_3mo';
  const stripe = stripeModule('test');
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
