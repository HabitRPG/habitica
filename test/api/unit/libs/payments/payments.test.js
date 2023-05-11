import moment from 'moment';

import * as sender from '../../../../../website/server/libs/email';
import common from '../../../../../website/common';
import api from '../../../../../website/server/libs/payments/payments';
import * as analytics from '../../../../../website/server/libs/analyticsService';
import * as notifications from '../../../../../website/server/libs/pushNotifications';
import { model as User } from '../../../../../website/server/models/user';
import { translate as t } from '../../../../helpers/api-integration/v3';
import {
  generateGroup,
} from '../../../../helpers/api-unit.helper';
import * as worldState from '../../../../../website/server/libs/worldState';
import { TransactionModel } from '../../../../../website/server/models/transaction';

describe('payments/index', () => {
  let user;
  let group;
  let data;
  let plan;

  beforeEach(async () => {
    user = new User();
    user.profile.name = 'sender';
    user.auth.local.username = 'sender';
    await user.save();

    group = generateGroup({
      name: 'test group',
      type: 'guild',
      privacy: 'public',
      leader: user._id,
    });
    await group.save();

    sandbox.stub(sender, 'sendTxn');
    sandbox.stub(user, 'sendMessage');
    sandbox.stub(analytics.mockAnalyticsService, 'trackPurchase');
    sandbox.stub(analytics.mockAnalyticsService, 'track');
    sandbox.stub(notifications, 'sendNotification');

    data = {
      user,
      sub: {
        key: 'basic_3mo',
      },
      customerId: 'customer-id',
      paymentMethod: 'Payment Method',
      headers: {
        'x-client': 'habitica-web',
        'user-agent': '',
      },
    };

    plan = {
      planId: 'basic_3mo',
      customerId: 'customer-id',
      dateUpdated: new Date(),
      gemsBought: 0,
      paymentMethod: 'paymentMethod',
      extraMonths: 0,
      dateTerminated: null,
      lastBillingDate: new Date(),
      dateCreated: new Date(),
      mysteryItems: [],
      consecutive: {
        trinkets: 0,
        offset: 0,
        gemCapExtra: 0,
      },
    };
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('#createSubscription', () => {
    context('Purchasing a subscription as a gift', () => {
      let recipient;

      beforeEach(() => {
        recipient = new User();
        recipient.profile.name = 'recipient';
        data.gift = {
          member: recipient,
          subscription: {
            key: 'basic_3mo',
            months: 3,
          },
        };
      });

      it('awards the Royal Purple Jackalope pet', async () => {
        await api.createSubscription(data);

        expect(recipient.items.pets['Jackalope-RoyalPurple']).to.eql(5);
      });

      it('adds extra months to an existing subscription', async () => {
        recipient.purchased.plan = plan;

        expect(recipient.purchased.plan.extraMonths).to.eql(0);

        await api.createSubscription(data);

        expect(recipient.purchased.plan.extraMonths).to.eql(3);
      });

      it('add a transaction entry to the recipient', async () => {
        recipient.purchased.plan = plan;

        expect(recipient.purchased.plan.extraMonths).to.eql(0);

        await api.createSubscription(data);

        expect(recipient.purchased.plan.extraMonths).to.eql(3);

        const transactions = await TransactionModel
          .find({ userId: recipient._id })
          .sort({ createdAt: -1 })
          .exec();

        expect(transactions).to.have.lengthOf(1);
      });

      it('does not set negative extraMonths if plan has past dateTerminated date', async () => {
        const dateTerminated = moment().subtract(2, 'months').toDate();
        recipient.purchased.plan.dateTerminated = dateTerminated;

        await api.createSubscription(data);

        expect(recipient.purchased.plan.extraMonths).to.eql(0);
      });

      it('does not reset Gold-to-Gems cap on an existing subscription', async () => {
        recipient.purchased.plan = plan;
        recipient.purchased.plan.gemsBought = 12;

        await api.createSubscription(data);

        expect(recipient.purchased.plan.gemsBought).to.eql(12);
      });

      it('adds to date terminated for an existing plan with a future terminated date', async () => {
        const dateTerminated = moment().add(1, 'months').toDate();
        recipient.purchased.plan = plan;
        recipient.purchased.plan.dateTerminated = dateTerminated;

        await api.createSubscription(data);

        expect(recipient.purchased.plan.dateTerminated).to.eql(moment(dateTerminated).add(3, 'months').toDate());
      });

      it('replaces date terminated for an account with a past terminated date', async () => {
        const dateTerminated = moment().subtract(1, 'months').toDate();
        recipient.purchased.plan.dateTerminated = dateTerminated;

        await api.createSubscription(data);

        expect(moment(recipient.purchased.plan.dateTerminated).format('YYYY-MM-DD')).to.eql(moment().add(3, 'months').format('YYYY-MM-DD'));
      });

      it('sets a dateTerminated date for a user without an existing subscription', async () => {
        expect(recipient.purchased.plan.dateTerminated).to.not.exist;

        await api.createSubscription(data);

        expect(recipient.purchased.plan.dateTerminated).to.exist;
      });

      it('sets plan.dateUpdated if it did not previously exist', async () => {
        expect(recipient.purchased.plan.dateUpdated).to.not.exist;

        await api.createSubscription(data);

        expect(recipient.purchased.plan.dateUpdated).to.exist;
      });

      it('sets plan.dateUpdated if it did exist but the user has cancelled', async () => {
        recipient.purchased.plan.dateUpdated = moment().subtract(1, 'days').toDate();
        recipient.purchased.plan.dateTerminated = moment().subtract(1, 'days').toDate();
        recipient.purchased.plan.customerId = 'testing';

        await api.createSubscription(data);

        expect(moment(recipient.purchased.plan.dateUpdated).date()).to.eql(moment().date());
      });

      it('sets plan.dateUpdated if it did exist but the user has a corrupt plan', async () => {
        recipient.purchased.plan.dateUpdated = moment().subtract(1, 'days').toDate();

        await api.createSubscription(data);

        expect(moment(recipient.purchased.plan.dateUpdated).date()).to.eql(moment().date());
      });

      it('sets plan.dateCreated if it did not previously exist', async () => {
        expect(recipient.purchased.plan.dateCreated).to.not.exist;

        await api.createSubscription(data);

        expect(recipient.purchased.plan.dateCreated).to.exist;
      });

      it('sets plan.dateCurrentTypeCreated if it did not previously exist', async () => {
        expect(recipient.purchased.plan.dateCurrentTypeCreated).to.not.exist;

        await api.createSubscription(data);

        expect(recipient.purchased.plan.dateCurrentTypeCreated).to.exist;
      });

      it('keeps plan.dateCreated when changing subscription type', async () => {
        await api.createSubscription(data);
        const initialDate = recipient.purchased.plan.dateCreated;
        await api.createSubscription(data);
        expect(recipient.purchased.plan.dateCreated).to.eql(initialDate);
      });

      it('sets plan.dateCurrentTypeCreated when changing subscription type', async () => {
        await api.createSubscription(data);
        const initialDate = recipient.purchased.plan.dateCurrentTypeCreated;
        await api.createSubscription(data);
        expect(recipient.purchased.plan.dateCurrentTypeCreated).to.not.eql(initialDate);
      });

      it('does not change plan.customerId if it already exists', async () => {
        recipient.purchased.plan = plan;
        data.customerId = 'purchaserCustomerId';

        expect(recipient.purchased.plan.customerId).to.eql('customer-id');
        await api.createSubscription(data);

        expect(recipient.purchased.plan.customerId).to.eql('customer-id');
      });

      it('sets plan.perkMonthCount to 1 if user is not subscribed', async () => {
        recipient.purchased.plan = plan;
        recipient.purchased.plan.perkMonthCount = 1;
        recipient.purchased.plan.customerId = undefined;
        data.sub.key = 'basic_earned';
        data.gift.subscription.key = 'basic_earned';
        data.gift.subscription.months = 1;

        expect(recipient.purchased.plan.perkMonthCount).to.eql(1);
        await api.createSubscription(data);

        expect(recipient.purchased.plan.perkMonthCount).to.eql(1);
      });

      it('sets plan.perkMonthCount to 1 if field is not initialized', async () => {
        recipient.purchased.plan = plan;
        recipient.purchased.plan.perkMonthCount = -1;
        recipient.purchased.plan.customerId = undefined;
        data.sub.key = 'basic_earned';
        data.gift.subscription.key = 'basic_earned';
        data.gift.subscription.months = 1;

        expect(recipient.purchased.plan.perkMonthCount).to.eql(-1);
        await api.createSubscription(data);

        expect(recipient.purchased.plan.perkMonthCount).to.eql(1);
      });

      it('sets plan.perkMonthCount to 1 if user had previous count but lapsed subscription', async () => {
        recipient.purchased.plan = plan;
        recipient.purchased.plan.perkMonthCount = 2;
        recipient.purchased.plan.customerId = undefined;
        data.sub.key = 'basic_earned';
        data.gift.subscription.key = 'basic_earned';
        data.gift.subscription.months = 1;

        expect(recipient.purchased.plan.perkMonthCount).to.eql(2);
        await api.createSubscription(data);

        expect(recipient.purchased.plan.perkMonthCount).to.eql(1);
      });

      it('adds to plan.perkMonthCount if user is already subscribed', async () => {
        recipient.purchased.plan = plan;
        recipient.purchased.plan.perkMonthCount = 1;
        data.sub.key = 'basic_earned';
        data.gift.subscription.key = 'basic_earned';
        data.gift.subscription.months = 1;

        expect(recipient.purchased.plan.perkMonthCount).to.eql(1);
        await api.createSubscription(data);

        expect(recipient.purchased.plan.perkMonthCount).to.eql(2);
      });

      it('awards perks if plan.perkMonthCount reaches 3 with existing subscription', async () => {
        recipient.purchased.plan = plan;
        recipient.purchased.plan.perkMonthCount = 2;
        data.sub.key = 'basic_earned';
        data.gift.subscription.key = 'basic_earned';
        data.gift.subscription.months = 1;

        expect(recipient.purchased.plan.perkMonthCount).to.eql(2);
        expect(recipient.purchased.plan.consecutive.trinkets).to.eql(0);
        expect(recipient.purchased.plan.consecutive.gemCapExtra).to.eql(0);
        await api.createSubscription(data);

        expect(recipient.purchased.plan.perkMonthCount).to.eql(0);
        expect(recipient.purchased.plan.consecutive.trinkets).to.eql(1);
        expect(recipient.purchased.plan.consecutive.gemCapExtra).to.eql(5);
      });

      it('awards perks if plan.perkMonthCount reaches 3 without existing subscription', async () => {
        recipient.purchased.plan.perkMonthCount = 0;
        expect(recipient.purchased.plan.perkMonthCount).to.eql(0);
        expect(recipient.purchased.plan.consecutive.trinkets).to.eql(0);
        expect(recipient.purchased.plan.consecutive.gemCapExtra).to.eql(0);
        await api.createSubscription(data);

        expect(recipient.purchased.plan.perkMonthCount).to.eql(0);
        expect(recipient.purchased.plan.consecutive.trinkets).to.eql(1);
        expect(recipient.purchased.plan.consecutive.gemCapExtra).to.eql(5);
      });

      it('awards perks if plan.perkMonthCount reaches 3 without initialized field', async () => {
        expect(recipient.purchased.plan.perkMonthCount).to.eql(-1);
        expect(recipient.purchased.plan.consecutive.trinkets).to.eql(0);
        expect(recipient.purchased.plan.consecutive.gemCapExtra).to.eql(0);
        await api.createSubscription(data);

        expect(recipient.purchased.plan.perkMonthCount).to.eql(0);
        expect(recipient.purchased.plan.consecutive.trinkets).to.eql(1);
        expect(recipient.purchased.plan.consecutive.gemCapExtra).to.eql(5);
      });

      it('awards perks if plan.perkMonthCount goes over 3', async () => {
        recipient.purchased.plan = plan;
        recipient.purchased.plan.perkMonthCount = 2;
        data.sub.key = 'basic_earned';

        expect(recipient.purchased.plan.perkMonthCount).to.eql(2);
        expect(recipient.purchased.plan.consecutive.trinkets).to.eql(0);
        expect(recipient.purchased.plan.consecutive.gemCapExtra).to.eql(0);
        await api.createSubscription(data);

        expect(recipient.purchased.plan.perkMonthCount).to.eql(2);
        expect(recipient.purchased.plan.consecutive.trinkets).to.eql(1);
        expect(recipient.purchased.plan.consecutive.gemCapExtra).to.eql(5);
      });

      it('sets plan.customerId to "Gift" if it does not already exist', async () => {
        expect(recipient.purchased.plan.customerId).to.not.exist;

        await api.createSubscription(data);

        expect(recipient.purchased.plan.customerId).to.eql('Gift');
      });

      it('increases the buyer\'s transaction count', async () => {
        expect(user.purchased.txnCount).to.eql(0);

        await api.createSubscription(data);

        expect(user.purchased.txnCount).to.eql(1);
      });

      it('sends an email about the gift', async () => {
        await api.createSubscription(data);

        expect(sender.sendTxn).to.be.calledWith(recipient, 'gifted-subscription', [
          { name: 'GIFTER', content: 'sender' },
          { name: 'X_MONTHS_SUBSCRIPTION', content: 3 },
        ]);
      });

      it('sends a push notification about the gift', async () => {
        await api.createSubscription(data);
        expect(notifications.sendNotification).to.be.calledOnce;
      });

      it('tracks subscription purchase as gift', async () => {
        await api.createSubscription(data);

        expect(analytics.mockAnalyticsService.trackPurchase).to.be.calledOnce;
        expect(analytics.mockAnalyticsService.trackPurchase).to.be.calledWith({
          uuid: user._id,
          groupId: undefined,
          itemPurchased: 'Subscription',
          sku: 'payment method-subscription',
          purchaseType: 'subscribe',
          paymentMethod: data.paymentMethod,
          quantity: 1,
          gift: true,
          purchaseValue: 15,
          firstPurchase: true,
          headers: {
            'x-client': 'habitica-web',
            'user-agent': '',
          },
        });
      });

      context('No Active Promotion', () => {
        beforeEach(() => {
          sinon.stub(worldState, 'getCurrentEventList').returns([]);
        });

        afterEach(() => {
          worldState.getCurrentEventList.restore();
        });

        it('sends a private message about the gift', async () => {
          await api.createSubscription(data);
          const msg = '`Hello recipient, sender has sent you 3 months of subscription!`';

          expect(user.sendMessage).to.be.calledOnce;
          expect(user.sendMessage).to.be.calledWith(
            recipient,
            { receiverMsg: msg, senderMsg: msg, save: false },
          );
        });
      });

      context('Active Promotion', () => {
        beforeEach(() => {
          sinon.stub(worldState, 'getCurrentEventList').returns([{
            ...common.content.events.winter2021Promo,
            event: 'winter2021',
          }]);
        });

        afterEach(() => {
          worldState.getCurrentEventList.restore();
        });

        it('creates a gift subscription for purchaser and recipient if none exist', async () => {
          await api.createSubscription(data);

          expect(user.items.pets['Jackalope-RoyalPurple']).to.eql(5);
          expect(user.purchased.plan.customerId).to.eql('Gift');
          expect(user.purchased.plan.dateTerminated).to.exist;
          expect(user.purchased.plan.dateUpdated).to.exist;
          expect(user.purchased.plan.dateCreated).to.exist;

          expect(recipient.items.pets['Jackalope-RoyalPurple']).to.eql(5);
          expect(recipient.purchased.plan.customerId).to.eql('Gift');
          expect(recipient.purchased.plan.dateTerminated).to.exist;
          expect(recipient.purchased.plan.dateUpdated).to.exist;
          expect(recipient.purchased.plan.dateCreated).to.exist;
        });

        it('adds extraMonths to existing subscription for purchaser and creates a gift subscription for recipient without sub', async () => {
          user.purchased.plan = plan;

          expect(user.purchased.plan.extraMonths).to.eql(0);

          await api.createSubscription(data);

          expect(user.purchased.plan.extraMonths).to.eql(3);

          expect(recipient.items.pets['Jackalope-RoyalPurple']).to.eql(5);
          expect(recipient.purchased.plan.customerId).to.eql('Gift');
          expect(recipient.purchased.plan.dateTerminated).to.exist;
          expect(recipient.purchased.plan.dateUpdated).to.exist;
          expect(recipient.purchased.plan.dateCreated).to.exist;
        });

        it('adds extraMonths to existing subscription for recipient and creates a gift subscription for purchaser without sub', async () => {
          recipient.purchased.plan = plan;

          expect(recipient.purchased.plan.extraMonths).to.eql(0);

          await api.createSubscription(data);

          expect(recipient.purchased.plan.extraMonths).to.eql(3);

          expect(user.items.pets['Jackalope-RoyalPurple']).to.eql(5);
          expect(user.purchased.plan.customerId).to.eql('Gift');
          expect(user.purchased.plan.dateTerminated).to.exist;
          expect(user.purchased.plan.dateUpdated).to.exist;
          expect(user.purchased.plan.dateCreated).to.exist;
        });

        it('adds extraMonths to existing subscriptions for purchaser and recipient', async () => {
          user.purchased.plan = plan;
          recipient.purchased.plan = plan;

          expect(user.purchased.plan.extraMonths).to.eql(0);
          expect(recipient.purchased.plan.extraMonths).to.eql(0);

          await api.createSubscription(data);

          expect(user.purchased.plan.extraMonths).to.eql(3);
          expect(recipient.purchased.plan.extraMonths).to.eql(3);
        });

        it('sends a private message about the promotion', async () => {
          await api.createSubscription(data);
          const msg = '`Hello sender, you received 3 months of subscription as part of our holiday gift-giving promotion!`';

          expect(user.sendMessage).to.be.calledTwice;
          expect(user.sendMessage).to.be.calledWith(user, { receiverMsg: msg, save: false });
        });
      });
    });

    context('Purchasing a subscription for self', () => {
      it('creates a subscription', async () => {
        expect(user.purchased.plan.planId).to.not.exist;

        await api.createSubscription(data);

        expect(user.purchased.plan.planId).to.eql('basic_3mo');
        expect(user.purchased.plan.customerId).to.eql('customer-id');
        expect(user.purchased.plan.dateUpdated).to.exist;
        expect(user.purchased.plan.gemsBought).to.eql(0);
        expect(user.purchased.plan.perkMonthCount).to.eql(0);
        expect(user.purchased.plan.paymentMethod).to.eql('Payment Method');
        expect(user.purchased.plan.extraMonths).to.eql(0);
        expect(user.purchased.plan.dateTerminated).to.eql(null);
        expect(user.purchased.plan.lastBillingDate).to.not.exist;
        expect(user.purchased.plan.dateCreated).to.exist;
      });

      it('sets plan.dateCreated if it did not previously exist', async () => {
        expect(user.purchased.plan.dateCreated).to.not.exist;

        await api.createSubscription(data);

        expect(user.purchased.plan.dateCreated).to.exist;
      });

      it('sets plan.dateCurrentTypeCreated if it did not previously exist', async () => {
        expect(user.purchased.plan.dateCurrentTypeCreated).to.not.exist;

        await api.createSubscription(data);

        expect(user.purchased.plan.dateCurrentTypeCreated).to.exist;
      });

      it('keeps plan.dateCreated when changing subscription type', async () => {
        await api.createSubscription(data);
        const initialDate = user.purchased.plan.dateCreated;
        await api.createSubscription(data);
        expect(user.purchased.plan.dateCreated).to.eql(initialDate);
      });

      it('sets plan.dateCurrentTypeCreated when changing subscription type', async () => {
        await api.createSubscription(data);
        const initialDate = user.purchased.plan.dateCurrentTypeCreated;
        await api.createSubscription(data);
        expect(user.purchased.plan.dateCurrentTypeCreated).to.not.eql(initialDate);
      });

      it('keeps plan.perkMonthCount when changing subscription type', async () => {
        await api.createSubscription(data);
        user.purchased.plan.perkMonthCount = 2;
        await api.createSubscription(data);
        expect(user.purchased.plan.perkMonthCount).to.eql(2);
      });

      it('sets plan.perkMonthCount to zero when creating new monthly subscription', async () => {
        user.purchased.plan.perkMonthCount = 2;
        await api.createSubscription(data);
        expect(user.purchased.plan.perkMonthCount).to.eql(0);
      });

      it('sets plan.perkMonthCount to zero when creating new 3 month subscription', async () => {
        user.purchased.plan.perkMonthCount = 2;
        await api.createSubscription(data);
        expect(user.purchased.plan.perkMonthCount).to.eql(0);
      });

      it('updates plan.consecutive.offset when changing subscription type', async () => {
        await api.createSubscription(data);
        expect(user.purchased.plan.consecutive.offset).to.eql(3);
        data.sub.key = 'basic_6mo';
        await api.createSubscription(data);
        expect(user.purchased.plan.consecutive.offset).to.eql(6);
      });

      it('awards the Royal Purple Jackalope pet', async () => {
        await api.createSubscription(data);

        expect(user.items.pets['Jackalope-RoyalPurple']).to.eql(5);
      });

      it('sets extraMonths if plan has dateTerminated date', async () => {
        user.purchased.plan = plan;
        user.purchased.plan.dateTerminated = moment(new Date()).add(2, 'months');
        expect(user.purchased.plan.extraMonths).to.eql(0);

        await api.createSubscription(data);

        expect(user.purchased.plan.extraMonths).to.within(1.9, 2);
      });

      it('does not set negative extraMonths if plan has past dateTerminated date', async () => {
        user.purchased.plan = plan;
        user.purchased.plan.dateTerminated = moment(new Date()).subtract(2, 'months');
        expect(user.purchased.plan.extraMonths).to.eql(0);

        await api.createSubscription(data);

        expect(user.purchased.plan.extraMonths).to.eql(0);
      });

      it('does not reset Gold-to-Gems cap on additional subscription', async () => {
        user.purchased.plan = plan;
        user.purchased.plan.gemsBought = 10;

        await api.createSubscription(data);

        expect(user.purchased.plan.gemsBought).to.eql(10);
      });

      it('sets lastBillingDate if payment method is "Amazon Payments"', async () => {
        data.paymentMethod = 'Amazon Payments';

        await api.createSubscription(data);

        expect(user.purchased.plan.lastBillingDate).to.exist;
      });

      it('increases the user\'s transaction count', async () => {
        expect(user.purchased.txnCount).to.eql(0);

        await api.createSubscription(data);

        expect(user.purchased.txnCount).to.eql(1);
      });

      it('sends a transaction email', async () => {
        await api.createSubscription(data);

        expect(sender.sendTxn).to.be.calledOnce;
        expect(sender.sendTxn).to.be.calledWith(data.user, 'subscription-begins');
      });

      it('tracks subscription purchase', async () => {
        await api.createSubscription(data);

        expect(analytics.mockAnalyticsService.trackPurchase).to.be.calledOnce;
        expect(analytics.mockAnalyticsService.trackPurchase).to.be.calledWith({
          uuid: user._id,
          groupId: undefined,
          itemPurchased: 'Subscription',
          sku: 'payment method-subscription',
          purchaseType: 'subscribe',
          paymentMethod: data.paymentMethod,
          quantity: 1,
          gift: false,
          purchaseValue: 15,
          firstPurchase: true,
          headers: {
            'x-client': 'habitica-web',
            'user-agent': '',
          },
        });
      });

      context('Upgrades subscription', () => {
        it('from basic_earned to basic_6mo', async () => {
          data.sub.key = 'basic_earned';
          expect(user.purchased.plan.planId).to.not.exist;

          await api.createSubscription(data);

          expect(user.purchased.plan.planId).to.eql('basic_earned');
          expect(user.purchased.plan.customerId).to.eql('customer-id');
          const created = user.purchased.plan.dateCreated;
          const updated = user.purchased.plan.dateUpdated;

          data.sub.key = 'basic_6mo';
          data.updatedFrom = { key: 'basic_earned' };
          await api.createSubscription(data);
          expect(user.purchased.plan.planId).to.eql('basic_6mo');
          expect(user.purchased.plan.dateCreated).to.eql(created);
          expect(user.purchased.plan.dateUpdated).to.not.eql(updated);
          expect(user.purchased.plan.customerId).to.eql('customer-id');
        });

        it('from basic_3mo to basic_12mo', async () => {
          expect(user.purchased.plan.planId).to.not.exist;

          await api.createSubscription(data);

          expect(user.purchased.plan.planId).to.eql('basic_3mo');
          expect(user.purchased.plan.customerId).to.eql('customer-id');
          const created = user.purchased.plan.dateCreated;
          const updated = user.purchased.plan.dateUpdated;

          data.sub.key = 'basic_12mo';
          data.updatedFrom = { key: 'basic_3mo' };
          await api.createSubscription(data);
          expect(user.purchased.plan.planId).to.eql('basic_12mo');
          expect(user.purchased.plan.dateCreated).to.eql(created);
          expect(user.purchased.plan.dateUpdated).to.not.eql(updated);
          expect(user.purchased.plan.customerId).to.eql('customer-id');
        });
      });

      context('Downgrades subscription', () => {
        it('from basic_6mo to basic_earned', async () => {
          data.sub.key = 'basic_6mo';
          expect(user.purchased.plan.planId).to.not.exist;

          await api.createSubscription(data);

          expect(user.purchased.plan.planId).to.eql('basic_6mo');
          expect(user.purchased.plan.customerId).to.eql('customer-id');
          const created = user.purchased.plan.dateCreated;
          const updated = user.purchased.plan.dateUpdated;

          data.sub.key = 'basic_earned';
          data.updatedFrom = { key: 'basic_6mo' };
          await api.createSubscription(data);
          expect(user.purchased.plan.planId).to.eql('basic_earned');
          expect(user.purchased.plan.dateCreated).to.eql(created);
          expect(user.purchased.plan.dateUpdated).to.not.eql(updated);
          expect(user.purchased.plan.customerId).to.eql('customer-id');
        });

        it('from basic_12mo to basic_3mo', async () => {
          expect(user.purchased.plan.planId).to.not.exist;

          data.sub.key = 'basic_12mo';
          await api.createSubscription(data);

          expect(user.purchased.plan.planId).to.eql('basic_12mo');
          expect(user.purchased.plan.customerId).to.eql('customer-id');
          const created = user.purchased.plan.dateCreated;
          const updated = user.purchased.plan.dateUpdated;

          data.sub.key = 'basic_3mo';
          data.updatedFrom = { key: 'basic_12mo' };
          await api.createSubscription(data);
          expect(user.purchased.plan.planId).to.eql('basic_3mo');
          expect(user.purchased.plan.dateCreated).to.eql(created);
          expect(user.purchased.plan.dateUpdated).to.not.eql(updated);
          expect(user.purchased.plan.customerId).to.eql('customer-id');
        });
      });
    });

    context('Block subscription perks', () => {
      it('adds block months to plan.consecutive.offset', async () => {
        await api.createSubscription(data);

        expect(user.purchased.plan.consecutive.offset).to.eql(3);
      });

      it('does not add to plans.consecutive.offset if 1 month subscription', async () => {
        data.sub.key = 'basic_earned';
        await api.createSubscription(data);

        expect(user.purchased.plan.consecutive.offset).to.eql(0);
      });

      it('resets plans.consecutive.offset if 1 month subscription', async () => {
        user.purchased.plan.consecutive.offset = 1;
        await user.save();
        data.sub.key = 'basic_earned';
        await api.createSubscription(data);

        expect(user.purchased.plan.consecutive.offset).to.eql(0);
      });

      it('adds 5 to plan.consecutive.gemCapExtra for 3 month block', async () => {
        await api.createSubscription(data);

        expect(user.purchased.plan.consecutive.gemCapExtra).to.eql(5);
      });

      it('adds 10 to plan.consecutive.gemCapExtra for 6 month block', async () => {
        data.sub.key = 'basic_6mo';
        await api.createSubscription(data);

        expect(user.purchased.plan.consecutive.gemCapExtra).to.eql(10);
      });

      it('adds 20 to plan.consecutive.gemCapExtra for 12 month block', async () => {
        data.sub.key = 'basic_12mo';
        await api.createSubscription(data);

        expect(user.purchased.plan.consecutive.gemCapExtra).to.eql(20);
      });

      it('does not raise plan.consecutive.gemCapExtra higher than 25', async () => {
        data.sub.key = 'basic_12mo';

        await api.createSubscription(data);
        await api.createSubscription(data);

        expect(user.purchased.plan.consecutive.gemCapExtra).to.eql(25);
      });

      it('adds a plan.consecutive.trinkets for 3 month block', async () => {
        await api.createSubscription(data);

        expect(user.purchased.plan.consecutive.trinkets).to.eql(1);
      });

      it('adds 2 plan.consecutive.trinkets for 6 month block', async () => {
        data.sub.key = 'basic_6mo';

        await api.createSubscription(data);

        expect(user.purchased.plan.consecutive.trinkets).to.eql(2);
      });

      it('adds 4 plan.consecutive.trinkets for 12 month block', async () => {
        data.sub.key = 'basic_12mo';

        await api.createSubscription(data);

        expect(user.purchased.plan.consecutive.trinkets).to.eql(4);
      });

      context('Upgrades subscription', () => {
        context('Using payDifference logic', () => {
          beforeEach(async () => {
            data.updatedFrom = { logic: 'payDifference' };
          });
          it('Adds 10 to plan.consecutive.gemCapExtra from basic_earned to basic_6mo', async () => {
            data.sub.key = 'basic_earned';
            expect(user.purchased.plan.planId).to.not.exist;

            await api.createSubscription(data);

            expect(user.purchased.plan.planId).to.eql('basic_earned');
            expect(user.purchased.plan.consecutive.gemCapExtra).to.eql(0);

            data.sub.key = 'basic_6mo';
            data.updatedFrom.key = 'basic_earned';
            await api.createSubscription(data);
            expect(user.purchased.plan.planId).to.eql('basic_6mo');
            expect(user.purchased.plan.consecutive.gemCapExtra).to.eql(10);
          });

          it('Adds 15 to plan.consecutive.gemCapExtra when upgrading from basic_3mo to basic_12mo', async () => {
            expect(user.purchased.plan.planId).to.not.exist;

            await api.createSubscription(data);

            expect(user.purchased.plan.planId).to.eql('basic_3mo');
            expect(user.purchased.plan.consecutive.gemCapExtra).to.eql(5);

            data.sub.key = 'basic_12mo';
            data.updatedFrom.key = 'basic_3mo';
            await api.createSubscription(data);
            expect(user.purchased.plan.planId).to.eql('basic_12mo');
            expect(user.purchased.plan.consecutive.gemCapExtra).to.eql(20);
          });

          it('Adds 2 to plan.consecutive.trinkets from basic_earned to basic_6mo', async () => {
            data.sub.key = 'basic_earned';
            expect(user.purchased.plan.planId).to.not.exist;

            await api.createSubscription(data);

            expect(user.purchased.plan.planId).to.eql('basic_earned');
            expect(user.purchased.plan.consecutive.trinkets).to.eql(0);

            data.sub.key = 'basic_6mo';
            data.updatedFrom.key = 'basic_earned';
            await api.createSubscription(data);
            expect(user.purchased.plan.planId).to.eql('basic_6mo');
            expect(user.purchased.plan.consecutive.trinkets).to.eql(2);
          });

          it('Adds 2 to plan.consecutive.trinkets when upgrading from basic_6mo to basic_12mo', async () => {
            data.sub.key = 'basic_6mo';
            expect(user.purchased.plan.planId).to.not.exist;

            await api.createSubscription(data);

            expect(user.purchased.plan.planId).to.eql('basic_6mo');
            expect(user.purchased.plan.consecutive.trinkets).to.eql(2);

            data.sub.key = 'basic_12mo';
            data.updatedFrom.key = 'basic_6mo';
            await api.createSubscription(data);
            expect(user.purchased.plan.planId).to.eql('basic_12mo');
            expect(user.purchased.plan.consecutive.trinkets).to.eql(4);
          });

          it('Adds 3 to plan.consecutive.trinkets when upgrading from basic_3mo to basic_12mo', async () => {
            expect(user.purchased.plan.planId).to.not.exist;

            await api.createSubscription(data);

            expect(user.purchased.plan.planId).to.eql('basic_3mo');
            expect(user.purchased.plan.consecutive.trinkets).to.eql(1);

            data.sub.key = 'basic_12mo';
            data.updatedFrom.key = 'basic_3mo';
            await api.createSubscription(data);
            expect(user.purchased.plan.planId).to.eql('basic_12mo');
            expect(user.purchased.plan.consecutive.trinkets).to.eql(4);
          });
        });

        context('Using payFull logic', () => {
          beforeEach(async () => {
            data.updatedFrom = { logic: 'payFull' };
          });
          it('Adds 10 to plan.consecutive.gemCapExtra from basic_earned to basic_6mo', async () => {
            data.sub.key = 'basic_earned';
            expect(user.purchased.plan.planId).to.not.exist;

            await api.createSubscription(data);

            expect(user.purchased.plan.planId).to.eql('basic_earned');
            expect(user.purchased.plan.consecutive.gemCapExtra).to.eql(0);

            data.sub.key = 'basic_6mo';
            data.updatedFrom.key = 'basic_earned';
            await api.createSubscription(data);
            expect(user.purchased.plan.planId).to.eql('basic_6mo');
            expect(user.purchased.plan.consecutive.gemCapExtra).to.eql(10);
          });

          it('Adds 20 to plan.consecutive.gemCapExtra when upgrading from basic_3mo to basic_12mo', async () => {
            expect(user.purchased.plan.planId).to.not.exist;

            await api.createSubscription(data);

            expect(user.purchased.plan.planId).to.eql('basic_3mo');
            expect(user.purchased.plan.consecutive.gemCapExtra).to.eql(5);

            data.sub.key = 'basic_12mo';
            data.updatedFrom.key = 'basic_3mo';
            await api.createSubscription(data);
            expect(user.purchased.plan.planId).to.eql('basic_12mo');
            expect(user.purchased.plan.consecutive.gemCapExtra).to.eql(25);
          });

          it('Adds 2 to plan.consecutive.trinkets from basic_earned to basic_6mo', async () => {
            data.sub.key = 'basic_earned';
            expect(user.purchased.plan.planId).to.not.exist;

            await api.createSubscription(data);

            expect(user.purchased.plan.planId).to.eql('basic_earned');
            expect(user.purchased.plan.consecutive.trinkets).to.eql(0);

            data.sub.key = 'basic_6mo';
            data.updatedFrom.key = 'basic_earned';
            await api.createSubscription(data);
            expect(user.purchased.plan.planId).to.eql('basic_6mo');
            expect(user.purchased.plan.consecutive.trinkets).to.eql(2);
          });

          it('Adds 4 to plan.consecutive.trinkets when upgrading from basic_6mo to basic_12mo', async () => {
            data.sub.key = 'basic_6mo';
            expect(user.purchased.plan.planId).to.not.exist;

            await api.createSubscription(data);

            expect(user.purchased.plan.planId).to.eql('basic_6mo');
            expect(user.purchased.plan.consecutive.trinkets).to.eql(2);

            data.sub.key = 'basic_12mo';
            data.updatedFrom.key = 'basic_6mo';
            await api.createSubscription(data);
            expect(user.purchased.plan.planId).to.eql('basic_12mo');
            expect(user.purchased.plan.consecutive.trinkets).to.eql(6);
          });

          it('Adds 4 to plan.consecutive.trinkets when upgrading from basic_3mo to basic_12mo', async () => {
            expect(user.purchased.plan.planId).to.not.exist;

            await api.createSubscription(data);

            expect(user.purchased.plan.planId).to.eql('basic_3mo');
            expect(user.purchased.plan.consecutive.trinkets).to.eql(1);

            data.sub.key = 'basic_12mo';
            data.updatedFrom.key = 'basic_3mo';
            await api.createSubscription(data);
            expect(user.purchased.plan.planId).to.eql('basic_12mo');
            expect(user.purchased.plan.consecutive.trinkets).to.eql(5);
          });
        });

        context('Using refundAndRepay logic', () => {
          let clock;
          beforeEach(async () => {
            clock = sinon.useFakeTimers(new Date('2022-01-01'));
            data.updatedFrom = { logic: 'refundAndRepay' };
          });
          context('Upgrades within first half of subscription', () => {
            it('Adds 10 to plan.consecutive.gemCapExtra from basic_earned to basic_6mo', async () => {
              data.sub.key = 'basic_earned';
              expect(user.purchased.plan.planId).to.not.exist;
              await api.createSubscription(data);

              expect(user.purchased.plan.planId).to.eql('basic_earned');
              expect(user.purchased.plan.consecutive.gemCapExtra).to.eql(0);

              data.sub.key = 'basic_6mo';
              data.updatedFrom.key = 'basic_earned';
              clock.restore();
              clock = sinon.useFakeTimers(new Date('2022-01-10'));
              await api.createSubscription(data);
              expect(user.purchased.plan.planId).to.eql('basic_6mo');
              expect(user.purchased.plan.consecutive.gemCapExtra).to.eql(10);
            });

            it('Adds 15 to plan.consecutive.gemCapExtra when upgrading from basic_3mo to basic_12mo', async () => {
              expect(user.purchased.plan.planId).to.not.exist;

              await api.createSubscription(data);

              expect(user.purchased.plan.planId).to.eql('basic_3mo');
              expect(user.purchased.plan.consecutive.gemCapExtra).to.eql(5);

              data.sub.key = 'basic_12mo';
              data.updatedFrom.key = 'basic_3mo';
              clock.restore();
              clock = sinon.useFakeTimers(new Date('2022-02-05'));
              await api.createSubscription(data);
              expect(user.purchased.plan.planId).to.eql('basic_12mo');
              expect(user.purchased.plan.consecutive.gemCapExtra).to.eql(20);
            });

            it('Adds 2 to plan.consecutive.trinkets from basic_earned to basic_6mo', async () => {
              data.sub.key = 'basic_earned';
              expect(user.purchased.plan.planId).to.not.exist;

              await api.createSubscription(data);

              expect(user.purchased.plan.planId).to.eql('basic_earned');
              expect(user.purchased.plan.consecutive.trinkets).to.eql(0);

              data.sub.key = 'basic_6mo';
              data.updatedFrom.key = 'basic_earned';
              clock.restore();
              clock = sinon.useFakeTimers(new Date('2022-01-08'));
              await api.createSubscription(data);
              expect(user.purchased.plan.planId).to.eql('basic_6mo');
              expect(user.purchased.plan.consecutive.trinkets).to.eql(2);
            });

            it('Adds 3 to plan.consecutive.trinkets when upgrading from basic_3mo to basic_12mo', async () => {
              expect(user.purchased.plan.planId).to.not.exist;

              await api.createSubscription(data);

              expect(user.purchased.plan.planId).to.eql('basic_3mo');
              expect(user.purchased.plan.consecutive.trinkets).to.eql(1);

              data.sub.key = 'basic_12mo';
              data.updatedFrom.key = 'basic_3mo';
              clock.restore();
              clock = sinon.useFakeTimers(new Date('2022-01-31'));
              await api.createSubscription(data);
              expect(user.purchased.plan.planId).to.eql('basic_12mo');
              expect(user.purchased.plan.consecutive.trinkets).to.eql(4);
            });

            it('Adds 2 to plan.consecutive.trinkets when upgrading from basic_6mo to basic_12mo', async () => {
              data.sub.key = 'basic_6mo';
              expect(user.purchased.plan.planId).to.not.exist;

              await api.createSubscription(data);

              expect(user.purchased.plan.planId).to.eql('basic_6mo');
              expect(user.purchased.plan.consecutive.trinkets).to.eql(2);

              data.sub.key = 'basic_12mo';
              data.updatedFrom.key = 'basic_6mo';
              clock.restore();
              clock = sinon.useFakeTimers(new Date('2022-01-28'));
              await api.createSubscription(data);
              expect(user.purchased.plan.planId).to.eql('basic_12mo');
              expect(user.purchased.plan.consecutive.trinkets).to.eql(4);
            });

            it('Adds 2 to plan.consecutive.trinkets from basic_earned to basic_6mo after initial cycle', async () => {
              data.sub.key = 'basic_earned';
              expect(user.purchased.plan.planId).to.not.exist;

              await api.createSubscription(data);

              expect(user.purchased.plan.planId).to.eql('basic_earned');
              expect(user.purchased.plan.consecutive.trinkets).to.eql(0);

              data.sub.key = 'basic_6mo';
              data.updatedFrom.key = 'basic_earned';
              clock.restore();
              clock = sinon.useFakeTimers(new Date('2024-01-08'));
              await api.createSubscription(data);
              expect(user.purchased.plan.planId).to.eql('basic_6mo');
              expect(user.purchased.plan.consecutive.trinkets).to.eql(2);
            });

            it('Adds 2 to plan.consecutive.trinkets when upgrading from basic_6mo to basic_12mo after initial cycle', async () => {
              data.sub.key = 'basic_6mo';
              expect(user.purchased.plan.planId).to.not.exist;

              await api.createSubscription(data);

              expect(user.purchased.plan.planId).to.eql('basic_6mo');
              expect(user.purchased.plan.consecutive.trinkets).to.eql(2);

              data.sub.key = 'basic_12mo';
              data.updatedFrom.key = 'basic_6mo';
              clock.restore();
              clock = sinon.useFakeTimers(new Date('2022-08-28'));
              await api.createSubscription(data);
              expect(user.purchased.plan.planId).to.eql('basic_12mo');
              expect(user.purchased.plan.consecutive.trinkets).to.eql(4);
            });

            it('Adds 3 to plan.consecutive.trinkets when upgrading from basic_3mo to basic_12mo after initial cycle', async () => {
              expect(user.purchased.plan.planId).to.not.exist;

              await api.createSubscription(data);

              expect(user.purchased.plan.planId).to.eql('basic_3mo');
              expect(user.purchased.plan.consecutive.trinkets).to.eql(1);

              data.sub.key = 'basic_12mo';
              data.updatedFrom.key = 'basic_3mo';
              clock.restore();
              clock = sinon.useFakeTimers(new Date('2022-07-31'));
              await api.createSubscription(data);
              expect(user.purchased.plan.planId).to.eql('basic_12mo');
              expect(user.purchased.plan.consecutive.trinkets).to.eql(4);
            });
          });
          context('Upgrades within second half of subscription', () => {
            it('Adds 10 to plan.consecutive.gemCapExtra from basic_earned to basic_6mo', async () => {
              data.sub.key = 'basic_earned';
              expect(user.purchased.plan.planId).to.not.exist;

              await api.createSubscription(data);

              expect(user.purchased.plan.planId).to.eql('basic_earned');
              expect(user.purchased.plan.consecutive.gemCapExtra).to.eql(0);

              data.sub.key = 'basic_6mo';
              data.updatedFrom.key = 'basic_earned';
              clock.restore();
              clock = sinon.useFakeTimers(new Date('2022-01-20'));
              await api.createSubscription(data);
              expect(user.purchased.plan.planId).to.eql('basic_6mo');
              expect(user.purchased.plan.consecutive.gemCapExtra).to.eql(10);
            });

            it('Adds 20 to plan.consecutive.gemCapExtra when upgrading from basic_3mo to basic_12mo', async () => {
              expect(user.purchased.plan.planId).to.not.exist;

              await api.createSubscription(data);

              expect(user.purchased.plan.planId).to.eql('basic_3mo');
              expect(user.purchased.plan.consecutive.gemCapExtra).to.eql(5);

              data.sub.key = 'basic_12mo';
              data.updatedFrom.key = 'basic_3mo';
              clock.restore();
              clock = sinon.useFakeTimers(new Date('2022-02-24'));
              await api.createSubscription(data);
              expect(user.purchased.plan.planId).to.eql('basic_12mo');
              expect(user.purchased.plan.consecutive.gemCapExtra).to.eql(25);
            });

            it('Adds 2 to plan.consecutive.trinkets from basic_earned to basic_6mo', async () => {
              data.sub.key = 'basic_earned';
              expect(user.purchased.plan.planId).to.not.exist;

              await api.createSubscription(data);

              expect(user.purchased.plan.planId).to.eql('basic_earned');
              expect(user.purchased.plan.consecutive.trinkets).to.eql(0);

              data.sub.key = 'basic_6mo';
              data.updatedFrom.key = 'basic_earned';
              clock.restore();
              clock = sinon.useFakeTimers(new Date('2022-01-28'));
              await api.createSubscription(data);
              expect(user.purchased.plan.planId).to.eql('basic_6mo');
              expect(user.purchased.plan.consecutive.trinkets).to.eql(2);
            });

            it('Adds 4 to plan.consecutive.trinkets when upgrading from basic_6mo to basic_12mo', async () => {
              data.sub.key = 'basic_6mo';
              expect(user.purchased.plan.planId).to.not.exist;

              await api.createSubscription(data);

              expect(user.purchased.plan.planId).to.eql('basic_6mo');
              expect(user.purchased.plan.consecutive.trinkets).to.eql(2);

              data.sub.key = 'basic_12mo';
              data.updatedFrom.key = 'basic_6mo';
              clock.restore();
              clock = sinon.useFakeTimers(new Date('2022-05-28'));
              await api.createSubscription(data);
              expect(user.purchased.plan.planId).to.eql('basic_12mo');
              expect(user.purchased.plan.consecutive.trinkets).to.eql(6);
            });

            it('Adds 4 to plan.consecutive.trinkets when upgrading from basic_3mo to basic_12mo', async () => {
              expect(user.purchased.plan.planId).to.not.exist;

              await api.createSubscription(data);

              expect(user.purchased.plan.planId).to.eql('basic_3mo');
              expect(user.purchased.plan.consecutive.trinkets).to.eql(1);

              data.sub.key = 'basic_12mo';
              data.updatedFrom.key = 'basic_3mo';
              clock.restore();
              clock = sinon.useFakeTimers(new Date('2022-03-03'));
              await api.createSubscription(data);
              expect(user.purchased.plan.planId).to.eql('basic_12mo');
              expect(user.purchased.plan.consecutive.trinkets).to.eql(5);
            });

            it('Adds 2 to plan.consecutive.trinkets from basic_earned to basic_6mo after initial cycle', async () => {
              data.sub.key = 'basic_earned';
              expect(user.purchased.plan.planId).to.not.exist;

              await api.createSubscription(data);

              expect(user.purchased.plan.planId).to.eql('basic_earned');
              expect(user.purchased.plan.consecutive.trinkets).to.eql(0);

              data.sub.key = 'basic_6mo';
              data.updatedFrom.key = 'basic_earned';
              clock.restore();
              clock = sinon.useFakeTimers(new Date('2022-05-28'));
              await api.createSubscription(data);
              expect(user.purchased.plan.planId).to.eql('basic_6mo');
              expect(user.purchased.plan.consecutive.trinkets).to.eql(2);
            });

            it('Adds 4 to plan.consecutive.trinkets when upgrading from basic_6mo to basic_12mo after initial cycle', async () => {
              data.sub.key = 'basic_6mo';
              expect(user.purchased.plan.planId).to.not.exist;

              await api.createSubscription(data);

              expect(user.purchased.plan.planId).to.eql('basic_6mo');
              expect(user.purchased.plan.consecutive.trinkets).to.eql(2);

              data.sub.key = 'basic_12mo';
              data.updatedFrom.key = 'basic_6mo';
              clock.restore();
              clock = sinon.useFakeTimers(new Date('2023-05-28'));
              await api.createSubscription(data);
              expect(user.purchased.plan.planId).to.eql('basic_12mo');
              expect(user.purchased.plan.consecutive.trinkets).to.eql(6);
            });

            it('Adds 4 to plan.consecutive.trinkets when upgrading from basic_3mo to basic_12mo after initial cycle', async () => {
              expect(user.purchased.plan.planId).to.not.exist;

              await api.createSubscription(data);

              expect(user.purchased.plan.planId).to.eql('basic_3mo');
              expect(user.purchased.plan.consecutive.trinkets).to.eql(1);

              data.sub.key = 'basic_12mo';
              data.updatedFrom.key = 'basic_3mo';
              clock.restore();
              clock = sinon.useFakeTimers(new Date('2023-09-03'));
              await api.createSubscription(data);
              expect(user.purchased.plan.planId).to.eql('basic_12mo');
              expect(user.purchased.plan.consecutive.trinkets).to.eql(5);
            });
          });
          afterEach(async () => {
            if (clock !== null) clock.restore();
          });
        });
      });

      context('Downgrades subscription', () => {
        it('does not remove from plan.consecutive.gemCapExtra from basic_6mo to basic_earned', async () => {
          data.sub.key = 'basic_6mo';
          expect(user.purchased.plan.planId).to.not.exist;

          await api.createSubscription(data);

          expect(user.purchased.plan.planId).to.eql('basic_6mo');
          expect(user.purchased.plan.consecutive.gemCapExtra).to.eql(10);

          data.sub.key = 'basic_earned';
          data.updatedFrom = { key: 'basic_6mo' };
          await api.createSubscription(data);
          expect(user.purchased.plan.planId).to.eql('basic_earned');
          expect(user.purchased.plan.consecutive.gemCapExtra).to.eql(10);
        });

        it('does not remove from plan.consecutive.gemCapExtra from basic_12mo to basic_3mo', async () => {
          expect(user.purchased.plan.planId).to.not.exist;

          data.sub.key = 'basic_12mo';
          await api.createSubscription(data);

          expect(user.purchased.plan.planId).to.eql('basic_12mo');
          expect(user.purchased.plan.consecutive.gemCapExtra).to.eql(20);

          data.sub.key = 'basic_3mo';
          data.updatedFrom = { key: 'basic_12mo' };
          await api.createSubscription(data);
          expect(user.purchased.plan.consecutive.gemCapExtra).to.eql(20);
        });

        it('does not remove from plan.consecutive.trinkets from basic_6mo to basic_earned', async () => {
          data.sub.key = 'basic_6mo';
          expect(user.purchased.plan.planId).to.not.exist;

          await api.createSubscription(data);

          expect(user.purchased.plan.planId).to.eql('basic_6mo');
          expect(user.purchased.plan.consecutive.trinkets).to.eql(2);

          data.sub.key = 'basic_earned';
          data.updatedFrom = { key: 'basic_6mo' };
          await api.createSubscription(data);
          expect(user.purchased.plan.planId).to.eql('basic_earned');
          expect(user.purchased.plan.consecutive.trinkets).to.eql(2);
        });

        it('does not remove from plan.consecutive.trinkets from basic_12mo to basic_3mo', async () => {
          expect(user.purchased.plan.planId).to.not.exist;

          data.sub.key = 'basic_12mo';
          await api.createSubscription(data);

          expect(user.purchased.plan.planId).to.eql('basic_12mo');
          expect(user.purchased.plan.consecutive.trinkets).to.eql(4);

          data.sub.key = 'basic_3mo';
          data.updatedFrom = { key: 'basic_12mo' };
          await api.createSubscription(data);
          expect(user.purchased.plan.consecutive.trinkets).to.eql(4);
        });
      });
    });

    context('Mystery Items', () => {
      let clock;
      const mayMysteryItem = 'armor_mystery_201605';

      beforeEach(() => {
        const mayMysteryItemTimeframe = new Date(2016, 4, 31); // May 31st 2016
        clock = sinon.useFakeTimers({
          now: mayMysteryItemTimeframe,
          toFake: ['Date'],
        });
      });

      afterEach(() => {
        if (clock) clock.restore();
      });

      it('awards mystery items when within the timeframe for a mystery item', async () => {
        data = { paymentMethod: 'PaymentMethod', user, sub: { key: 'basic_3mo' } };

        const oldNotificationsCount = user.notifications.length;

        await api.createSubscription(data);

        expect(user.notifications.find(n => n.type === 'NEW_MYSTERY_ITEMS')).to.not.be.undefined;
        expect(user.purchased.plan.mysteryItems).to.have.a.lengthOf(2);
        expect(user.purchased.plan.mysteryItems).to.include('armor_mystery_201605');
        expect(user.purchased.plan.mysteryItems).to.include('head_mystery_201605');
        expect(user.notifications.length).to.equal(oldNotificationsCount + 1);
        expect(user.notifications[0].type).to.equal('NEW_MYSTERY_ITEMS');
      });

      it('does not award mystery item when user already owns the item', async () => {
        user.items.gear.owned[mayMysteryItem] = true;

        data = { paymentMethod: 'PaymentMethod', user, sub: { key: 'basic_3mo' } };

        await api.createSubscription(data);

        expect(user.purchased.plan.mysteryItems).to.have.a.lengthOf(1);
        expect(user.purchased.plan.mysteryItems).to.include('head_mystery_201605');
      });

      it('does not award mystery item when user already has the item in the mystery box', async () => {
        user.purchased.plan.mysteryItems = [mayMysteryItem];

        sandbox.spy(user.purchased.plan.mysteryItems, 'push');

        data = { paymentMethod: 'PaymentMethod', user, sub: { key: 'basic_3mo' } };
        await api.createSubscription(data);

        expect(user.purchased.plan.mysteryItems.push).to.be.calledOnce;
        expect(user.purchased.plan.mysteryItems.push).to.be.calledWith('head_mystery_201605');
      });
    });
  });

  describe('#cancelSubscription', () => {
    beforeEach(() => {
      data = { user };
    });

    context('Canceling a subscription for self', () => {
      it('adds a month termination date by default', async () => {
        await api.cancelSubscription(data);

        const now = new Date();
        const daysTillTermination = moment(user.purchased.plan.dateTerminated).diff(now, 'days');

        expect(daysTillTermination).to.be.within(29, 30); // 1 month +/- 1 days
      });

      it('adds extraMonths to dateTerminated value', async () => {
        user.purchased.plan.extraMonths = 2;

        await api.cancelSubscription(data);

        const now = new Date();
        const daysTillTermination = moment(user.purchased.plan.dateTerminated).diff(now, 'days');

        expect(daysTillTermination).to.be.within(89, 90); // 3 months +/- 1 days
      });

      it('handles extra month fractions', async () => {
        user.purchased.plan.extraMonths = 0.3;

        await api.cancelSubscription(data);

        const now = new Date();
        const daysTillTermination = moment(user.purchased.plan.dateTerminated).diff(now, 'days');

        expect(daysTillTermination).to.be.within(38, 39); // should be about 1 month + 1/3 month
      });

      it('terminates at next billing date if it exists', async () => {
        data.nextBill = moment().add({ days: 15 });

        await api.cancelSubscription(data);

        const now = new Date();
        const daysTillTermination = moment(user.purchased.plan.dateTerminated).diff(now, 'days');

        expect(daysTillTermination).to.be.within(13, 15);
      });

      it('terminates at next billing date even if dateUpdated is prior to now', async () => {
        data.nextBill = moment().add({ days: 15 });
        data.user.purchased.plan.dateUpdated = moment().subtract({ days: 10 });

        await api.cancelSubscription(data);

        const now = new Date();
        const daysTillTermination = moment(user.purchased.plan.dateTerminated).diff(now, 'days');

        expect(daysTillTermination).to.be.within(13, 15);
      });

      it('resets plan.extraMonths', async () => {
        user.purchased.plan.extraMonths = 5;

        await api.cancelSubscription(data);

        expect(user.purchased.plan.extraMonths).to.eql(0);
      });

      it('sends an email', async () => {
        await api.cancelSubscription(data);

        expect(sender.sendTxn).to.be.calledOnce;
        expect(sender.sendTxn).to.be.calledWith(user, 'cancel-subscription');
      });
    });
  });

  describe('#buyGems', () => {
    beforeEach(() => {
      data = {
        user,
        gemsBlock: common.content.gems['21gems'],
        paymentMethod: 'payment',
        headers: {
          'x-client': 'habitica-web',
          'user-agent': '',
        },
      };
    });

    context('Self Purchase', () => {
      it('sends a donation email', async () => {
        await api.buyGems(data);

        expect(sender.sendTxn).to.be.calledOnce;
        expect(sender.sendTxn).to.be.calledWith(data.user, 'donation');
      });
    });

    context('No Active Promotion', () => {
      beforeEach(() => {
        sinon.stub(worldState, 'getCurrentEvent').returns(null);
        sinon.stub(worldState, 'getCurrentEventList').returns([]);
      });

      afterEach(() => {
        worldState.getCurrentEvent.restore();
        worldState.getCurrentEventList.restore();
      });

      it('does not apply a discount', async () => {
        const balanceBefore = user.balance;

        await api.buyGems(data);

        const balanceAfter = user.balance;
        const balanceDiff = balanceAfter - balanceBefore;

        expect(balanceDiff * 4).to.eql(21);
      });
    });

    context('Active Promotion', () => {
      beforeEach(() => {
        sinon.stub(worldState, 'getCurrentEventList').returns([{
          ...common.content.events.fall2020,
          event: 'fall2020',
        }]);
      });

      afterEach(() => {
        worldState.getCurrentEventList.restore();
      });

      it('applies a discount', async () => {
        const balanceBefore = user.balance;

        await api.buyGems(data);

        const balanceAfter = user.balance;
        const balanceDiff = balanceAfter - balanceBefore;

        expect(balanceDiff * 4).to.eql(30);
      });
    });

    context('Gift', () => {
      let recipient;

      beforeEach(() => {
        recipient = new User();
        recipient.profile.name = 'recipient';

        data.gift = {
          gems: {
            amount: 4,
          },
          member: recipient,
        };
      });

      it('calculates balance from gem amount if gift', async () => {
        expect(recipient.balance).to.eql(0);

        await api.buyGems(data);

        expect(recipient.balance).to.eql(1);
      });

      it('sends a gifted-gems email', async () => {
        await api.buyGems(data);

        expect(sender.sendTxn).to.be.calledOnce;
        expect(sender.sendTxn).to.be.calledWith(data.gift.member, 'gifted-gems');
      });

      it('sends a message from purchaser to recipient', async () => {
        await api.buyGems(data);
        const msg = '`Hello recipient, sender has sent you 4 gems!`';

        expect(user.sendMessage).to.be
          .calledWith(recipient, { receiverMsg: msg, senderMsg: msg, save: false });
      });

      it('sends a message from purchaser to recipient with custom message', async () => {
        data.gift.message = 'giftmessage';

        await api.buyGems(data);

        const msg = `\`Hello recipient, sender has sent you 4 gems!\` ${data.gift.message}`;
        expect(user.sendMessage).to.be
          .calledWith(recipient, { receiverMsg: msg, senderMsg: msg, save: false });
      });

      it('sends a push notification if user did not gift to self', async () => {
        await api.buyGems(data);
        expect(notifications.sendNotification).to.be.calledOnce;
      });

      it('sends gem donation message in each participant\'s language', async () => {
        // TODO using english for both users because other languages are not loaded
        // for api.buyGems
        await recipient.update({
          'preferences.language': 'en',
        });
        await user.update({
          'preferences.language': 'en',
        });
        await api.buyGems(data);

        const [recipientsMessageContent, sendersMessageContent] = ['en', 'en'].map(lang => {
          const messageContent = t('giftedGemsFull', {
            username: recipient.profile.name,
            sender: user.profile.name,
            gemAmount: data.gift.gems.amount,
          }, lang);

          return `\`${messageContent}\``;
        });

        expect(user.sendMessage).to.be.calledWith(
          recipient,
          { receiverMsg: recipientsMessageContent, senderMsg: sendersMessageContent, save: false },
        );
      });
    });
  });

  describe('addSubToGroupUser', () => {
    it('adds a group subscription to a new user', async () => {
      expect(group.purchased.plan.planId).to.not.exist;
      data.groupId = group._id;

      await api.addSubToGroupUser(user, group);

      const updatedUser = await User.findById(user._id).exec();

      expect(updatedUser.purchased.plan.planId).to.eql('group_plan_auto');
      expect(updatedUser.purchased.plan.customerId).to.eql('group-plan');
      expect(updatedUser.purchased.plan.dateUpdated).to.exist;
      expect(updatedUser.purchased.plan.gemsBought).to.eql(0);
      expect(updatedUser.purchased.plan.paymentMethod).to.eql('Group Plan');
      expect(updatedUser.purchased.plan.extraMonths).to.eql(0);
      expect(updatedUser.purchased.plan.dateTerminated).to.eql(null);
      expect(updatedUser.purchased.plan.lastBillingDate).to.not.exist;
      expect(updatedUser.purchased.plan.dateCreated).to.exist;
    });

    it('awards the Royal Purple Jackalope pet', async () => {
      await api.addSubToGroupUser(user, group);

      const updatedUser = await User.findById(user._id).exec();

      expect(updatedUser.items.pets['Jackalope-RoyalPurple']).to.eql(5);
    });

    it('saves previously unused Mystery Items and Hourglasses for an expired subscription', async () => {
      const planExpirationDate = new Date();
      planExpirationDate.setDate(planExpirationDate.getDate() - 2);
      const mysteryItem = 'item';
      const mysteryItems = [mysteryItem];
      const consecutive = {
        trinkets: 3,
      };

      // set expired plan with unused items
      plan.mysteryItems = mysteryItems;
      plan.consecutive = consecutive;
      plan.dateCreated = planExpirationDate;
      plan.dateTerminated = planExpirationDate;
      plan.customerId = null;

      user.purchased.plan = plan;

      await user.save();
      await api.addSubToGroupUser(user, group);

      const updatedUser = await User.findById(user._id).exec();

      expect(updatedUser.purchased.plan.mysteryItems[0]).to.eql(mysteryItem);
      expect(updatedUser.purchased.plan.consecutive.trinkets).to.equal(consecutive.trinkets);
    });
  });
});
