import stripeModule from 'stripe';

import {
  generateGroup,
} from '../../../../../helpers/api-unit.helper';
import { model as User } from '../../../../../../website/server/models/user';
import stripePayments from '../../../../../../website/server/libs/payments/stripe';
import common from '../../../../../../website/common';

const { i18n } = common;

describe('stripe - edit subscription', () => {
  const subKey = 'basic_3mo';
  const stripe = stripeModule('test');
  let user; let groupId; let group; let
    token;

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
    const nonLeader = new User();
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
    let stripeListSubscriptionStub; let stripeUpdateSubscriptionStub; let
      subscriptionId;

    beforeEach(() => {
      subscriptionId = 'subId';
      stripeListSubscriptionStub = sinon.stub(stripe.subscriptions, 'list')
        .resolves({
          data: [{ id: subscriptionId }],
        });

      stripeUpdateSubscriptionStub = sinon.stub(stripe.subscriptions, 'update').resolves({});
    });

    afterEach(() => {
      stripe.subscriptions.list.restore();
      stripe.subscriptions.update.restore();
    });

    it('edits a user subscription', async () => {
      await stripePayments.editSubscription({
        token,
        user,
        groupId: undefined,
      }, stripe);

      expect(stripeListSubscriptionStub).to.be.calledOnce;
      expect(stripeListSubscriptionStub).to.be.calledWith({
        customer: user.purchased.plan.customerId,
      });
      expect(stripeUpdateSubscriptionStub).to.be.calledOnce;
      expect(stripeUpdateSubscriptionStub).to.be.calledWith(
        subscriptionId,
        { card: token },
      );
    });

    it('edits a group subscription', async () => {
      await stripePayments.editSubscription({
        token,
        user,
        groupId,
      }, stripe);

      expect(stripeListSubscriptionStub).to.be.calledOnce;
      expect(stripeListSubscriptionStub).to.be.calledWith({
        customer: group.purchased.plan.customerId,
      });
      expect(stripeUpdateSubscriptionStub).to.be.calledOnce;
      expect(stripeUpdateSubscriptionStub).to.be.calledWith(
        subscriptionId,
        { card: token },
      );
    });
  });
});
