import * as sender from '../../../../../website/server/libs/api-v3/email';
import * as api from '../../../../../website/server/libs/api-v3/payments';
import { model as User } from '../../../../../website/server/models/user';
import moment from 'moment';

describe('payments/index', () => {
  let fakeSend;
  let data;
  let user;

  describe('#createSubscription', () => {
    const MYSTERY_AWARD_COUNT = 2;
    const MYSTERY_AWARD_UNIX_TIME = 1464725113000;
    let fakeClock;

    beforeEach(async () => {
      user = new User();
      fakeClock = sinon.useFakeTimers(MYSTERY_AWARD_UNIX_TIME);
    });

    afterEach(() => {
      fakeClock.restore();
    });

    it('succeeds', async () => {
      data = { user, sub: { key: 'basic_3mo' } };
      expect(user.purchased.plan.planId).to.not.exist;
      await api.createSubscription(data);
      expect(user.purchased.plan.planId).to.exist;
    });

    it('awards mystery items', async () => {
      data = { user, sub: { key: 'basic_3mo' } };
      await api.createSubscription(data);
      expect(user.purchased.plan.mysteryItems.length).to.eql(MYSTERY_AWARD_COUNT);
    });
  });

  describe('#cancelSubscription', () => {
    beforeEach(() => {
      fakeSend = sinon.spy(sender, 'sendTxn');
      data = { user: new User() };
    });

    afterEach(() => {
      fakeSend.restore();
    });

    it('plan.extraMonths is defined', () => {
      api.cancelSubscription(data);
      let terminated = data.user.purchased.plan.dateTerminated;
      data.user.purchased.plan.extraMonths = 2;
      api.cancelSubscription(data);
      let difference = Math.abs(moment(terminated).diff(data.user.purchased.plan.dateTerminated, 'days'));
      expect(difference - 60).to.be.lessThan(3); // the difference is approximately two months, +/- 2 days
    });

    it('plan.extraMonth is a fraction', () => {
      api.cancelSubscription(data);
      let terminated = data.user.purchased.plan.dateTerminated;
      data.user.purchased.plan.extraMonths = 0.3;
      api.cancelSubscription(data);
      let difference = Math.abs(moment(terminated).diff(data.user.purchased.plan.dateTerminated, 'days'));
      expect(difference - 10).to.be.lessThan(3); // the difference should be 10 days.
    });

    it('nextBill is defined', () => {
      api.cancelSubscription(data);
      let terminated = data.user.purchased.plan.dateTerminated;
      data.nextBill = moment().add({ days: 25 });
      api.cancelSubscription(data);
      let difference = Math.abs(moment(terminated).diff(data.user.purchased.plan.dateTerminated, 'days'));
      expect(difference - 5).to.be.lessThan(2); // the difference should be 5 days, +/- 1 day
    });

    it('saves the canceled subscription for the user', () => {
      expect(data.user.purchased.plan.dateTerminated).to.not.exist;
      api.cancelSubscription(data);
      expect(data.user.purchased.plan.dateTerminated).to.exist;
    });

    it('sends a text', async () => {
      await api.cancelSubscription(data);
      sinon.assert.called(fakeSend);
    });
  });
});
