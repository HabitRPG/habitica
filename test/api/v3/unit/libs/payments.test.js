import * as sender from '../../../../../website/server/libs/email';
import * as api from '../../../../../website/server/libs/payments';
import analytics from '../../../../../website/server/libs/analyticsService';
import notifications from '../../../../../website/server/libs/pushNotifications';
import { model as User } from '../../../../../website/server/models/user';
import moment from 'moment';

describe('payments/index', () => {
  let user, data, plan;

  beforeEach(() => {
    user = new User();
    user.profile.name = 'sender';

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

        expect(user.sendMessage).to.be.calledOnce;
        expect(user.sendMessage).to.be.calledWith(recipient, '\`Hello recipient, sender has sent you 3 months of subscription!\`');
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

        expect(user.sendMessage).to.be.calledWith(recipient, '\`Hello recipient, sender has sent you 4 gems!\`');
      });

      it('sends a push notification if user did not gift to self', async () => {
        await api.buyGems(data);
        expect(notifications.sendNotification).to.be.calledOnce;
      });
    });
  });
});
