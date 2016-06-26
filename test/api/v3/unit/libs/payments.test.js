import * as sender from '../../../../../website/server/libs/api-v3/email';
import * as api from '../../../../../website/server/libs/api-v3/payments';
import { model as User } from '../../../../../website/server/models/user';
import moment from 'moment';

describe('payments/index', () => {
  describe('#createSubscription', () => {
    let user;

    beforeEach(async () => {
      user = new User();
    });

    context('Purchasing a subscription as a gift', () => {
      it('adds extra months to an existing subscription');

      it('sets a dateTerminated date for a user without an existing subscription');

      it('sets plan.dateUpdated if it did not previously exist');

      it('does not change plan.customerId if it already exists');

      it('sets plan.customerId to "Gift" if it does not already exist');

      it('increases the buyer\'s transaction count');

      it('sends a private message about the gift');

      it('sends an email about the gift');

      it('sends a push notification about the gift');

      it('tracks subscription purchase as gift (if prod)');
    });

    context('Purchasing a subscription for self', () => {
      it('creates a subscription', async () => {
        let data = {
          user,
          sub: {
            key: 'basic_3mo',
          },
          customerId: 'customer-id',
          paymentMethod: 'Payment Method',
        };

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

      it('sets extraMonths if plan has dateTerminated date');

      it('sets lastBillingDate if payment method is "Amazon Payments"');

      it('increases the user\'s transcation count');

      it('sends a transaction email (if prod)');

      it('tracks subscription purchase (if prod)');
    });

    context('Block subscription perks', () => {
      it('adds block months to plan.consecutive.offset');

      it('does not add to plans.consecutive.offset if 1 month subscription');

      it('adds 5 to plan.consecutive.gemCapExtra for every 3 months');

      it('does not raise plan.consecutive.gemCapExtra higher than 25');

      it('adds a plan.consecutive.trinkets for every 3 months');
    });

    context('Mystery Items', () => {
      it('awards mystery items when within the timeframe for a mystery item', async () => {
        let mayMysteryItemTimeframe = 1464725113000; // May 31st 2016
        let fakeClock = sinon.useFakeTimers(mayMysteryItemTimeframe);
        let data = { user, sub: { key: 'basic_3mo' } };

        await api.createSubscription(data);

        expect(user.purchased.plan.mysteryItems).to.have.a.lengthOf(2);
        expect(user.purchased.plan.mysteryItems).to.include('armor_mystery_201605');
        expect(user.purchased.plan.mysteryItems).to.include('head_mystery_201605');

        fakeClock.restore();
      });

      it('does not awards mystery items when not within the timeframe for a mystery item', async () => {
        const noMysteryItemTimeframe = 1462183920000; // May 2nd 2016
        let fakeClock = sinon.useFakeTimers(noMysteryItemTimeframe);
        let data = { user, sub: { key: 'basic_3mo' } };

        await api.createSubscription(data);

        expect(user.purchased.plan.mysteryItems).to.have.a.lengthOf(0);

        fakeClock.restore();
      });

      it('does not award mystery item when user already owns the item', async () => {
        let mayMysteryItemTimeframe = 1464725113000; // May 31st 2016
        let fakeClock = sinon.useFakeTimers(mayMysteryItemTimeframe);
        let mayMysteryItem = 'armor_mystery_201605';
        user.items.gear.owned[mayMysteryItem] = true;

        let data = { user, sub: { key: 'basic_3mo' } };

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

        let data = { user, sub: { key: 'basic_3mo' } };

        await api.createSubscription(data);

        expect(user.purchased.plan.mysteryItems.push).to.be.calledOnce;
        expect(user.purchased.plan.mysteryItems.push).to.be.calledWith('head_mystery_201605');

        fakeClock.restore();
      });
    });
  });

  describe('#cancelSubscription', () => {
    let data, user;

    beforeEach(() => {
      sandbox.spy(sender, 'sendTxn');
      user = new User();
      data = { user };
    });

    afterEach(() => {
      sandbox.restore();
    });

    it('adds a month termination date by default', () => {
      api.cancelSubscription(data);

      let now = new Date();
      let daysTillTermination = moment(user.purchased.plan.dateTerminated).diff(now, 'days');

      expect(daysTillTermination).to.be.within(29, 30); // 1 month +/- 1 days
    });

    it('adds extraMonths to dateTerminated value', () => {
      user.purchased.plan.extraMonths = 2;

      api.cancelSubscription(data);

      let now = new Date();
      let daysTillTermination = moment(user.purchased.plan.dateTerminated).diff(now, 'days');

      expect(daysTillTermination).to.be.within(89, 90); // 3 months +/- 1 days
    });

    it('handles extra month fractions', () => {
      user.purchased.plan.extraMonths = 0.3;

      api.cancelSubscription(data);

      let now = new Date();
      let daysTillTermination = moment(user.purchased.plan.dateTerminated).diff(now, 'days');

      expect(daysTillTermination).to.be.within(38, 39); // should be about 1 month + 1/3 month
    });

    it('terminates at next billing date if it exists', () => {
      data.nextBill = moment().add({ days: 15 });

      api.cancelSubscription(data);

      let now = new Date();
      let daysTillTermination = moment(user.purchased.plan.dateTerminated).diff(now, 'days');

      expect(daysTillTermination).to.be.within(13, 15);
    });

    it('resets plan.extraMonths', () => {
      user.purchased.plan.extraMonths = 5;

      api.cancelSubscription(data);

      expect(user.purchased.plan.extraMonths).to.eql(0);
    });

    it('sends an email', async () => {
      await api.cancelSubscription(data);

      expect(sender.sendTxn).to.be.calledOnce;
      expect(sender.sendTxn).to.be.calledWith(user, 'cancel-subscription');
    });
  });

  describe('#buyGems', () => {
    context('Self Purchase', () => {
      it('amount property defaults to 5');

      it('sends a donation email (if prod)');
    });

    context('Gift', () => {
      it('calculates balance from gem amount if gift');

      it('sends a gifted-gems email (if prod)');

      it('sends a message from purchaser to recipient');

      it('sends a push notification if user did not gift to self');
    });
  });
});
