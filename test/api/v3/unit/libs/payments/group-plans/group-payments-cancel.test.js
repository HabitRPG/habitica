import moment from 'moment';
import stripeModule from 'stripe';

import * as sender from '../../../../../../../website/server/libs/email';
import * as api from '../../../../../../../website/server/libs/payments';
import analytics from '../../../../../../../website/server/libs/analyticsService';
import notifications from '../../../../../../../website/server/libs/pushNotifications'
import amzLib from '../../../../../../../website/server/libs/amazonPayments';
import stripePayments from '../../../../../../../website/server/libs/stripePayments';
import paypalPayments from '../../../../../../../website/server/libs/paypalPayments';
import { model as User } from '../../../../../../../website/server/models/user';
import { model as Group } from '../../../../../../../website/server/models/group';
import { translate as t } from '../../../../../../helpers/api-v3-integration.helper';
import {
  generateGroup,
} from '../../../../../../helpers/api-unit.helper.js';
import i18n from '../../../../../../../website/common/script/i18n';

describe('Canceling a subscription for group', () => {
  let plan, group, user, data;
  let stripe = stripeModule('test');

  beforeEach(async () => {
    user = new User();
    user.profile.name = 'sender';
    await user.save();

    group = generateGroup({
      name: 'test group',
      type: 'guild',
      privacy: 'public',
      leader: user._id,
    });
    await group.save();

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

    sandbox.stub(sender, 'sendTxn');
  });

  afterEach(() => {
    sender.sendTxn.restore();
  });

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

  it('cancels member subscriptions', async () => {
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
    user.guilds.push(group._id);
    await user.save();
    expect(group.purchased.plan.planId).to.not.exist;
    data.groupId = group._id;
    await api.createSubscription(data);

    await api.cancelSubscription(data);

    let now = new Date();
    let updatedLeader = await User.findById(user._id).exec();
    let daysTillTermination = moment(updatedLeader.purchased.plan.dateTerminated).diff(now, 'days');
    expect(daysTillTermination).to.be.within(29, 30); // 1 month +/- 1 days
  });

  it('does not cancel a user subscription if they are still in another active group plan');
});
