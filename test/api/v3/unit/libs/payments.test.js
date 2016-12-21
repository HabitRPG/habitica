import * as sender from '../../../../../website/server/libs/email';
import * as api from '../../../../../website/server/libs/payments';
import analytics from '../../../../../website/server/libs/analyticsService';
import notifications from '../../../../../website/server/libs/pushNotifications';
import { model as User } from '../../../../../website/server/models/user';
import { model as Group } from '../../../../../website/server/models/group';
import stripeModule from 'stripe';
import moment from 'moment';
import { translate as t } from '../../../../helpers/api-v3-integration.helper';
import {
  generateGroup,
} from '../../../../helpers/api-unit.helper.js';
import i18n from '../../../../../website/common/script/i18n';
import amzLib from '../../../../../website/server/libs/amazonPayments';

describe('payments/index', () => {
  let user, group, data, plan;

  let stripe = stripeModule('test');

  beforeEach(async () => {
    user = new User();
    user.profile.name = 'sender';

    group = generateGroup({
      name: 'test group',
      type: 'guild',
      privacy: 'public',
      leader: user._id,
    });
    await group.save();

    sandbox.stub(sender, 'sendTxn');
    sandbox.stub(user, 'sendMessage');
    sandbox.stub(analytics, 'trackPurchase');
    sandbox.stub(analytics, 'track');
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

      it('adds extra months to an existing subscription', async () => {
        recipient.purchased.plan = plan;

        expect(recipient.purchased.plan.extraMonths).to.eql(0);

        await api.createSubscription(data);

        expect(recipient.purchased.plan.extraMonths).to.eql(3);
      });

      it('does not set negative extraMonths if plan has past dateTerminated date', async () => {
        let dateTerminated = moment().subtract(2, 'months').toDate();
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
        let dateTerminated = moment().add(1, 'months').toDate();
        recipient.purchased.plan = plan;
        recipient.purchased.plan.dateTerminated = dateTerminated;

        await api.createSubscription(data);

        expect(recipient.purchased.plan.dateTerminated).to.eql(moment(dateTerminated).add(3, 'months').toDate());
      });

      it('replaces date terminated for an account with a past terminated date', async () => {
        let dateTerminated = moment().subtract(1, 'months').toDate();
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

      it('sets plan.dateCreated if it did not previously exist', async () => {
        expect(recipient.purchased.plan.dateCreated).to.not.exist;

        await api.createSubscription(data);

        expect(recipient.purchased.plan.dateCreated).to.exist;
      });

      it('does not change plan.customerId if it already exists', async () => {
        recipient.purchased.plan = plan;
        data.customerId = 'purchaserCustomerId';

        expect(recipient.purchased.plan.customerId).to.eql('customer-id');
        await api.createSubscription(data);

        expect(recipient.purchased.plan.customerId).to.eql('customer-id');
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

      it('sends a private message about the gift', async () => {
        await api.createSubscription(data);
        let msg = '\`Hello recipient, sender has sent you 3 months of subscription!\`';

        expect(user.sendMessage).to.be.calledOnce;
        expect(user.sendMessage).to.be.calledWith(recipient, { receiverMsg: msg, senderMsg: msg });
      });

      it('sends an email about the gift', async () => {
        await api.createSubscription(data);

        expect(sender.sendTxn).to.be.calledWith(recipient, 'gifted-subscription', [
          {name: 'GIFTER', content: 'sender'},
          {name: 'X_MONTHS_SUBSCRIPTION', content: 3},
        ]);
      });

      it('sends a push notification about the gift', async () => {
        await api.createSubscription(data);
        expect(notifications.sendNotification).to.be.calledOnce;
      });

      it('tracks subscription purchase as gift', async () => {
        await api.createSubscription(data);

        expect(analytics.trackPurchase).to.be.calledOnce;
        expect(analytics.trackPurchase).to.be.calledWith({
          uuid: user._id,
          groupId: undefined,
          itemPurchased: 'Subscription',
          sku: 'payment method-subscription',
          purchaseType: 'subscribe',
          paymentMethod: data.paymentMethod,
          quantity: 1,
          gift: true,
          purchaseValue: 15,
          headers: {
            'x-client': 'habitica-web',
            'user-agent': '',
          },
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
        expect(user.purchased.plan.paymentMethod).to.eql('Payment Method');
        expect(user.purchased.plan.extraMonths).to.eql(0);
        expect(user.purchased.plan.dateTerminated).to.eql(null);
        expect(user.purchased.plan.lastBillingDate).to.not.exist;
        expect(user.purchased.plan.dateCreated).to.exist;
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

        expect(analytics.trackPurchase).to.be.calledOnce;
        expect(analytics.trackPurchase).to.be.calledWith({
          uuid: user._id,
          groupId: undefined,
          itemPurchased: 'Subscription',
          sku: 'payment method-subscription',
          purchaseType: 'subscribe',
          paymentMethod: data.paymentMethod,
          quantity: 1,
          gift: false,
          purchaseValue: 15,
          headers: {
            'x-client': 'habitica-web',
            'user-agent': '',
          },
        });
      });
    });

    context('Purchasing a subscription for group', () => {
      it('creates a subscription', async () => {
        expect(group.purchased.plan.planId).to.not.exist;
        data.groupId = group._id;

        await api.createSubscription(data);

        let updatedGroup = await Group.findById(group._id).exec();

        expect(updatedGroup.purchased.plan.planId).to.eql('basic_3mo');
        expect(updatedGroup.purchased.plan.customerId).to.eql('customer-id');
        expect(updatedGroup.purchased.plan.dateUpdated).to.exist;
        expect(updatedGroup.purchased.plan.gemsBought).to.eql(0);
        expect(updatedGroup.purchased.plan.paymentMethod).to.eql('Payment Method');
        expect(updatedGroup.purchased.plan.extraMonths).to.eql(0);
        expect(updatedGroup.purchased.plan.dateTerminated).to.eql(null);
        expect(updatedGroup.purchased.plan.lastBillingDate).to.not.exist;
        expect(updatedGroup.purchased.plan.dateCreated).to.exist;
      });

      it('sets extraMonths if plan has dateTerminated date', async () => {
        group.purchased.plan = plan;
        group.purchased.plan.dateTerminated = moment(new Date()).add(2, 'months');
        await group.save();
        expect(group.purchased.plan.extraMonths).to.eql(0);
        data.groupId = group._id;

        await api.createSubscription(data);

        let updatedGroup = await Group.findById(group._id).exec();
        expect(updatedGroup.purchased.plan.extraMonths).to.within(1.9, 2);
      });

      it('does not set negative extraMonths if plan has past dateTerminated date', async () => {
        group.purchased.plan = plan;
        group.purchased.plan.dateTerminated = moment(new Date()).subtract(2, 'months');
        await group.save();
        expect(group.purchased.plan.extraMonths).to.eql(0);
        data.groupId = group._id;

        await api.createSubscription(data);

        let updatedGroup = await Group.findById(group._id).exec();
        expect(updatedGroup.purchased.plan.extraMonths).to.eql(0);
      });
    });

    context('Block subscription perks', () => {
      it('adds block months to plan.consecutive.offset', async () => {
        await api.createSubscription(data);

        expect(user.purchased.plan.consecutive.offset).to.eql(3);
      });

      it('does not add to plans.consecutive.offset if 1 month subscription', async () => {
        await api.createSubscription(data);

        expect(user.purchased.plan.extraMonths).to.eql(0);
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
    });

    context('Mystery Items', () => {
      it('awards mystery items when within the timeframe for a mystery item', async () => {
        let mayMysteryItemTimeframe = 1464725113000; // May 31st 2016
        let fakeClock = sinon.useFakeTimers(mayMysteryItemTimeframe);
        data = { paymentMethod: 'PaymentMethod', user, sub: { key: 'basic_3mo' } };

        await api.createSubscription(data);

        expect(user.purchased.plan.mysteryItems).to.have.a.lengthOf(2);
        expect(user.purchased.plan.mysteryItems).to.include('armor_mystery_201605');
        expect(user.purchased.plan.mysteryItems).to.include('head_mystery_201605');

        fakeClock.restore();
      });

      it('does not awards mystery items when not within the timeframe for a mystery item', async () => {
        const noMysteryItemTimeframe = 1462183920000; // May 2nd 2016
        let fakeClock = sinon.useFakeTimers(noMysteryItemTimeframe);
        data = { paymentMethod: 'PaymentMethod', user, sub: { key: 'basic_3mo' } };

        await api.createSubscription(data);

        expect(user.purchased.plan.mysteryItems).to.have.a.lengthOf(0);

        fakeClock.restore();
      });

      it('does not award mystery item when user already owns the item', async () => {
        let mayMysteryItemTimeframe = 1464725113000; // May 31st 2016
        let fakeClock = sinon.useFakeTimers(mayMysteryItemTimeframe);
        let mayMysteryItem = 'armor_mystery_201605';
        user.items.gear.owned[mayMysteryItem] = true;

        data = { paymentMethod: 'PaymentMethod', user, sub: { key: 'basic_3mo' } };

        await api.createSubscription(data);

        expect(user.purchased.plan.mysteryItems).to.have.a.lengthOf(1);
        expect(user.purchased.plan.mysteryItems).to.include('head_mystery_201605');

        fakeClock.restore();
      });

      it('does not award mystery item when user already has the item in the mystery box', async () => {
        let mayMysteryItemTimeframe = 1464725113000; // May 31st 2016
        let fakeClock = sinon.useFakeTimers(mayMysteryItemTimeframe);
        let mayMysteryItem = 'armor_mystery_201605';
        user.purchased.plan.mysteryItems = [mayMysteryItem];

        sandbox.spy(user.purchased.plan.mysteryItems, 'push');

        data = { paymentMethod: 'PaymentMethod', user, sub: { key: 'basic_3mo' } };

        await api.createSubscription(data);

        expect(user.purchased.plan.mysteryItems.push).to.be.calledOnce;
        expect(user.purchased.plan.mysteryItems.push).to.be.calledWith('head_mystery_201605');

        fakeClock.restore();
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

        let now = new Date();
        let daysTillTermination = moment(user.purchased.plan.dateTerminated).diff(now, 'days');

        expect(daysTillTermination).to.be.within(29, 30); // 1 month +/- 1 days
      });

      it('adds extraMonths to dateTerminated value', async () => {
        user.purchased.plan.extraMonths = 2;

        await api.cancelSubscription(data);

        let now = new Date();
        let daysTillTermination = moment(user.purchased.plan.dateTerminated).diff(now, 'days');

        expect(daysTillTermination).to.be.within(89, 90); // 3 months +/- 1 days
      });

      it('handles extra month fractions', async () => {
        user.purchased.plan.extraMonths = 0.3;

        await api.cancelSubscription(data);

        let now = new Date();
        let daysTillTermination = moment(user.purchased.plan.dateTerminated).diff(now, 'days');

        expect(daysTillTermination).to.be.within(38, 39); // should be about 1 month + 1/3 month
      });

      it('terminates at next billing date if it exists', async () => {
        data.nextBill = moment().add({ days: 15 });

        await api.cancelSubscription(data);

        let now = new Date();
        let daysTillTermination = moment(user.purchased.plan.dateTerminated).diff(now, 'days');

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

    context('Canceling a subscription for group', () => {
      it('adds a month termination date by default', async () => {
        data.groupId = group._id;
        await api.cancelSubscription(data);

        let now = new Date();
        let updatedGroup = await Group.findById(group._id).exec();
        let daysTillTermination = moment(updatedGroup.purchased.plan.dateTerminated).diff(now, 'days');

        expect(daysTillTermination).to.be.within(29, 30); // 1 month +/- 1 days
      });

      it('adds extraMonths to dateTerminated value', async () => {
        group.purchased.plan.extraMonths = 2;
        await group.save();
        data.groupId = group._id;

        await api.cancelSubscription(data);

        let now = new Date();
        let updatedGroup = await Group.findById(group._id).exec();
        let daysTillTermination = moment(updatedGroup.purchased.plan.dateTerminated).diff(now, 'days');

        expect(daysTillTermination).to.be.within(89, 90); // 3 months +/- 1 days
      });

      it('handles extra month fractions', async () => {
        group.purchased.plan.extraMonths = 0.3;
        await group.save();
        data.groupId = group._id;

        await api.cancelSubscription(data);

        let now = new Date();
        let updatedGroup = await Group.findById(group._id).exec();
        let daysTillTermination = moment(updatedGroup.purchased.plan.dateTerminated).diff(now, 'days');

        expect(daysTillTermination).to.be.within(38, 39); // should be about 1 month + 1/3 month
      });

      it('terminates at next billing date if it exists', async () => {
        data.nextBill = moment().add({ days: 15 });
        data.groupId = group._id;

        await api.cancelSubscription(data);

        let now = new Date();
        let updatedGroup = await Group.findById(group._id).exec();
        let daysTillTermination = moment(updatedGroup.purchased.plan.dateTerminated).diff(now, 'days');

        expect(daysTillTermination).to.be.within(13, 15);
      });

      it('resets plan.extraMonths', async () => {
        group.purchased.plan.extraMonths = 5;
        await group.save();
        data.groupId = group._id;

        await api.cancelSubscription(data);

        let updatedGroup = await Group.findById(group._id).exec();
        expect(updatedGroup.purchased.plan.extraMonths).to.eql(0);
      });

      it('sends an email', async () => {
        data.groupId = group._id;
        await api.cancelSubscription(data);

        expect(sender.sendTxn).to.be.calledOnce;
        expect(sender.sendTxn).to.be.calledWith(user, 'group-cancel-subscription');
      });

      it('prevents non group leader from manging subscription', async () => {
        let groupMember = new User();
        data.user = groupMember;
        data.groupId = group._id;

        await expect(api.cancelSubscription(data))
          .eventually.be.rejected.and.to.eql({
            httpCode: 401,
            message: i18n.t('onlyGroupLeaderCanManageSubscription'),
            name: 'NotAuthorized',
          });
      });

      it('allows old group leader to cancel if they created the subscription', async () => {
        data.groupId = group._id;
        data.sub = {
          key: 'group_monthly',
        };
        data.paymentMethod = 'Payment Method';
        await api.createSubscription(data);

        let updatedGroup = await Group.findById(group._id).exec();
        let newLeader = new User();
        updatedGroup.leader = newLeader._id;
        await updatedGroup.save();

        await api.cancelSubscription(data);

        updatedGroup = await Group.findById(group._id).exec();

        expect(updatedGroup.purchased.plan.dateTerminated).to.exist;
      });
    });
  });

  describe('#buyGems', () => {
    beforeEach(() => {
      data = {
        user,
        paymentMethod: 'payment',
        headers: {
          'x-client': 'habitica-web',
          'user-agent': '',
        },
      };
    });

    context('Self Purchase', () => {
      it('amount property defaults to 5', async () => {
        expect(user.balance).to.eql(0);

        await api.buyGems(data);

        expect(user.balance).to.eql(5);
      });

      it('can set amount that is purchased', async () => {
        data.amount = 13;

        await api.buyGems(data);

        expect(user.balance).to.eql(13);
      });

      it('sends a donation email', async () => {
        await api.buyGems(data);

        expect(sender.sendTxn).to.be.calledOnce;
        expect(sender.sendTxn).to.be.calledWith(data.user, 'donation');
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
        let msg = '\`Hello recipient, sender has sent you 4 gems!\`';

        expect(user.sendMessage).to.be.calledWith(recipient, { receiverMsg: msg, senderMsg: msg });
      });

      it('sends a push notification if user did not gift to self', async () => {
        await api.buyGems(data);
        expect(notifications.sendNotification).to.be.calledOnce;
      });

      it('sends gem donation message in each participant\'s language', async () => {
        await recipient.update({
          'preferences.language': 'es',
        });
        await user.update({
          'preferences.language': 'cs',
        });
        await api.buyGems(data);

        let [recipientsMessageContent, sendersMessageContent] = ['es', 'cs'].map((lang) => {
          let messageContent = t('giftedGemsFull', {
            username: recipient.profile.name,
            sender: user.profile.name,
            gemAmount: data.gift.gems.amount,
          }, lang);

          return `\`${messageContent}\``;
        });

        expect(user.sendMessage).to.be.calledWith(recipient, { receiverMsg: recipientsMessageContent, senderMsg: sendersMessageContent });
      });
    });
  });

  describe('#upgradeGroupPlan', () => {
    let spy;

    beforeEach(function () {
      spy = sinon.stub(stripe.subscriptions, 'update');
      spy.returnsPromise().resolves([]);
      data.groupId = group._id;
      data.sub.quantity = 3;
    });

    afterEach(function () {
      sinon.restore(stripe.subscriptions.update);
    });

    it('updates a group plan quantity', async () => {
      data.paymentMethod = 'Stripe';
      await api.createSubscription(data);

      let updatedGroup = await Group.findById(group._id).exec();
      expect(updatedGroup.purchased.plan.quantity).to.eql(3);

      updatedGroup.memberCount += 1;
      await updatedGroup.save();

      await api.updateStripeGroupPlan(updatedGroup, stripe);

      expect(spy.calledOnce).to.be.true;
      expect(updatedGroup.purchased.plan.quantity).to.eql(4);
    });

    it('does not update a group plan quantity that has a payment method other than stripe', async () => {
      await api.createSubscription(data);

      let updatedGroup = await Group.findById(group._id).exec();
      expect(updatedGroup.purchased.plan.quantity).to.eql(3);

      updatedGroup.memberCount += 1;
      await updatedGroup.save();

      await api.updateStripeGroupPlan(updatedGroup, stripe);

      expect(spy.calledOnce).to.be.false;
      expect(updatedGroup.purchased.plan.quantity).to.eql(3);
    });
  });

  describe('payWithStripe', () => {
    let spy;
    let stripeCreateCustomerSpy;
    let createSubSpy;

    beforeEach(function () {
      spy = sinon.stub(stripe.subscriptions, 'update');
      spy.returnsPromise().resolves;

      stripeCreateCustomerSpy = sinon.stub(stripe.customers, 'create');
      let stripCustomerResponse = {
        subscriptions: {
          data: [{id: 'test-id'}],
        },
      };
      stripeCreateCustomerSpy.returnsPromise().resolves(stripCustomerResponse);

      createSubSpy = sinon.stub(api, 'createSubscription');
      createSubSpy.returnsPromise().resolves({});

      data.groupId = group._id;
      data.sub.quantity = 3;
    });

    afterEach(function () {
      sinon.restore(stripe.subscriptions.update);
      stripe.customers.create.restore();
      api.createSubscription.restore();
    });

    it('subscribes with stripe', async () => {
      let token = 'test-token';
      let gift;
      let sub = data.sub;
      let groupId = group._id;
      let email = 'test@test.com';
      let headers = {};
      let coupon;

      await api.payWithStripe([
        token,
        user,
        gift,
        sub,
        groupId,
        email,
        headers,
        coupon,
      ], stripe);

      expect(stripeCreateCustomerSpy.calledOnce).to.be.true;
      expect(createSubSpy.calledOnce).to.be.true;
    });
  });

  describe('subscribeWithAmazon', () => {
    let amazonSetBillingAgreementDetailsSpy;
    let amazonConfirmBillingAgreementSpy;
    let amazongAuthorizeOnBillingAgreementSpy;
    let createSubSpy;

    beforeEach(function () {
      amazonSetBillingAgreementDetailsSpy = sinon.stub(amzLib, 'setBillingAgreementDetails');
      amazonSetBillingAgreementDetailsSpy.returnsPromise().resolves({});

      amazonConfirmBillingAgreementSpy = sinon.stub(amzLib, 'confirmBillingAgreement');
      amazonConfirmBillingAgreementSpy.returnsPromise().resolves({});

      amazongAuthorizeOnBillingAgreementSpy = sinon.stub(amzLib, 'authorizeOnBillingAgreement');
      amazongAuthorizeOnBillingAgreementSpy.returnsPromise().resolves({});

      createSubSpy = sinon.stub(api, 'createSubscription');
      createSubSpy.returnsPromise().resolves({});
    });

    afterEach(function () {
      amzLib.setBillingAgreementDetails.restore();
      amzLib.confirmBillingAgreement.restore();
      amzLib.authorizeOnBillingAgreement.restore();
      api.createSubscription.restore();
    });

    it('subscribes with stripe', async () => {
      let billingAgreementId = 'billingAgreementId';
      let sub = data.sub;
      let coupon;
      let groupId = group._id;
      let headers = {};

      await api.subscribeWithAmazon([
        billingAgreementId,
        sub,
        coupon,
        sub,
        user,
        groupId,
        headers,
      ]);

      expect(amazonSetBillingAgreementDetailsSpy.calledOnce).to.be.true;
      expect(amazonConfirmBillingAgreementSpy.calledOnce).to.be.true;
      expect(amazongAuthorizeOnBillingAgreementSpy.calledOnce).to.be.true;
      expect(createSubSpy.calledOnce).to.be.true;
    });
  });
});
