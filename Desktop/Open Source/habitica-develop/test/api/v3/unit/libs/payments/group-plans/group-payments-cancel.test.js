import moment from 'moment';

import * as sender from '../../../../../../../website/server/libs/email';
import * as api from '../../../../../../../website/server/libs/payments';
import { model as User } from '../../../../../../../website/server/models/user';
import { model as Group } from '../../../../../../../website/server/models/group';
import {
  generateGroup,
} from '../../../../../../helpers/api-unit.helper.js';
import i18n from '../../../../../../../website/common/script/i18n';

describe('Canceling a subscription for group', () => {
  let plan, group, user, data;

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
    expect(sender.sendTxn.firstCall.args[0]._id).to.equal(user._id);
    expect(sender.sendTxn.firstCall.args[1]).to.equal('group-cancel-subscription');
    expect(sender.sendTxn.firstCall.args[2]).to.eql([
      {name: 'GROUP_NAME', content: group.name},
    ]);
  });

  it('prevents non group leader from managing subscription', async () => {
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
    now.setHours(0, 0, 0, 0);
    let updatedLeader = await User.findById(user._id).exec();
    let daysTillTermination = moment(updatedLeader.purchased.plan.dateTerminated).diff(now, 'days');
    expect(daysTillTermination).to.be.within(2, 3); // only a few days
  });

  it('sends an email to members of group', async () => {
    let recipient = new User();
    recipient.profile.name = 'recipient';
    recipient.guilds.push(group._id);
    await recipient.save();

    data.groupId = group._id;

    await api.createSubscription(data);
    await api.cancelSubscription(data);

    expect(sender.sendTxn).to.be.have.callCount(4);
    expect(sender.sendTxn.thirdCall.args[0]._id).to.equal(recipient._id);
    expect(sender.sendTxn.thirdCall.args[1]).to.equal('group-member-cancel');
    expect(sender.sendTxn.thirdCall.args[2]).to.eql([
      {name: 'LEADER', content: user.profile.name},
      {name: 'GROUP_NAME', content: group.name},
    ]);
  });

  it('does not cancel member subscriptions when member does not have a group plan sub (i.e. UNLIMITED_CUSTOMER_ID)', async () => {
    plan.key = 'basic_earned';
    plan.customerId = api.constants.UNLIMITED_CUSTOMER_ID;

    let recipient = new User();
    recipient.profile.name = 'recipient';
    recipient.purchased.plan = plan;
    recipient.guilds.push(group._id);
    await recipient.save();

    data.groupId = group._id;

    await api.cancelSubscription(data);

    let updatedLeader = await User.findById(user._id).exec();
    expect(updatedLeader.purchased.plan.dateTerminated).to.not.exist;
  });

  it('does not cancel a user subscription if they are still in another active group plan', async () => {
    let recipient = new User();
    recipient.profile.name = 'recipient';
    plan.key = 'basic_earned';
    recipient.purchased.plan = plan;
    recipient.guilds.push(group._id);
    await recipient.save();

    user.guilds.push(group._id);
    await user.save();
    data.groupId = group._id;

    await api.createSubscription(data);

    let updatedUser = await User.findById(recipient._id).exec();
    let firstDateCreated = updatedUser.purchased.plan.dateCreated;
    let extraMonthsBeforeSecond = updatedUser.purchased.plan.extraMonths;

    let group2 = generateGroup({
      name: 'test group2',
      type: 'guild',
      privacy: 'public',
      leader: user._id,
    });
    data.groupId = group2._id;
    await group2.save();
    recipient.guilds.push(group2._id);
    await recipient.save();

    await api.createSubscription(data);

    await api.cancelSubscription(data);

    updatedUser = await User.findById(recipient._id).exec();

    expect(updatedUser.purchased.plan.planId).to.eql('group_plan_auto');
    expect(updatedUser.purchased.plan.customerId).to.eql('group-plan');
    expect(updatedUser.purchased.plan.dateUpdated).to.exist;
    expect(updatedUser.purchased.plan.gemsBought).to.eql(0);
    expect(updatedUser.purchased.plan.paymentMethod).to.eql('Group Plan');
    expect(updatedUser.purchased.plan.extraMonths).to.eql(extraMonthsBeforeSecond);
    expect(updatedUser.purchased.plan.dateTerminated).to.eql(null);
    expect(updatedUser.purchased.plan.lastBillingDate).to.not.exist;
    expect(updatedUser.purchased.plan.dateCreated).to.eql(firstDateCreated);
  });

  it('does cancel a leader subscription with two cancelled group plans', async () => {
    user.guilds.push(group._id);
    await user.save();
    data.groupId = group._id;

    await api.createSubscription(data);

    let updatedUser = await User.findById(user._id).exec();
    let firstDateCreated = updatedUser.purchased.plan.dateCreated;
    let extraMonthsBeforeSecond = updatedUser.purchased.plan.extraMonths;

    let group2 = generateGroup({
      name: 'test group2',
      type: 'guild',
      privacy: 'public',
      leader: user._id,
    });
    user.guilds.push(group2._id);
    await user.save();
    data.groupId = group2._id;
    await group2.save();

    await api.createSubscription(data);
    await api.cancelSubscription(data);

    data.groupId = group._id;
    await api.cancelSubscription(data);

    updatedUser = await User.findById(user._id).exec();

    expect(updatedUser.purchased.plan.planId).to.eql('group_plan_auto');
    expect(updatedUser.purchased.plan.customerId).to.eql('group-plan');
    expect(updatedUser.purchased.plan.dateUpdated).to.exist;
    expect(updatedUser.purchased.plan.gemsBought).to.eql(0);
    expect(updatedUser.purchased.plan.paymentMethod).to.eql('Group Plan');
    expect(updatedUser.purchased.plan.extraMonths).to.eql(extraMonthsBeforeSecond);
    expect(updatedUser.purchased.plan.dateTerminated).to.exist;
    expect(updatedUser.purchased.plan.lastBillingDate).to.not.exist;
    expect(updatedUser.purchased.plan.dateCreated).to.eql(firstDateCreated);
  });
});
