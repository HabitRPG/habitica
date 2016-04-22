import * as sender from '../../../../../website/src/libs/api-v3/email';
import * as api from '../../../../../website/src/libs/api-v3/payments';
import {
  generateUser
} from '../../../../helpers/api-integration/v3';
import { model as User } from '../../../../../website/src/models/user';
import moment from 'moment';

describe.only('payments/index', () => {
  let fakeSend;
  let data;

  beforeEach(() => {
    fakeSend = sinon.spy(sender, 'sendTxn');
    data = { user: new User() };
  });

  afterEach(() => {
    fakeSend.restore();
  });

  describe('#createSubscription', async () => {
  });

  describe('#cancelSubscription', () => {
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

    it('sends a text', () => {
      api.cancelSubscription(data);
      sinon.assert.calledOnce(fakeSend);
    });
  });

  describe('#buyGems', async () => {
  });
});
