import moment from 'moment';
import stripeModule from 'stripe';
import nconf from 'nconf';

import * as sender from '../../../../../../website/server/libs/email';
import api from '../../../../../../website/server/libs/payments/payments';
import amzLib from '../../../../../../website/server/libs/payments/amazon';
import paypalPayments from '../../../../../../website/server/libs/payments/paypal';
import stripePayments from '../../../../../../website/server/libs/payments/stripe';
import { model as User } from '../../../../../../website/server/models/user';
import { model as Group } from '../../../../../../website/server/models/group';
import {
  generateGroup,
} from '../../../../../helpers/api-unit.helper';
import i18n from '../../../../../../website/common/script/i18n';

describe('Purchasing a group plan for group', () => {
  const EMAIL_TEMPLATE_SUBSCRIPTION_TYPE_GOOGLE = 'Google_subscription';
  const EMAIL_TEMPLATE_SUBSCRIPTION_TYPE_IOS = 'iOS_subscription';
  const EMAIL_TEMPLATE_SUBSCRIPTION_TYPE_NORMAL = 'normal_subscription';
  const EMAIL_TEMPLATE_SUBSCRIPTION_TYPE_NONE = 'no_subscription';

  let plan; let group; let user; let
    data;
  const stripe = stripeModule('test');
  const groupLeaderName = 'sender';
  const groupName = 'test group';

  beforeEach(async () => {
    user = new User();
    user.profile.name = groupLeaderName;
    await user.save();

    group = generateGroup({
      name: groupName,
      type: 'guild',
      privacy: 'private',
      leader: user._id,
    });
    await group.save();

    user.guilds.push(group._id);
    await user.save();

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

    const subscriptionId = 'subId';
    sinon.stub(stripe.customers, 'del').resolves({});

    const currentPeriodEndTimeStamp = moment().add(3, 'months').unix();
    sinon.stub(stripe.customers, 'retrieve')
      .resolves({
        subscriptions: {
          data: [{
            id: subscriptionId,
            current_period_end: currentPeriodEndTimeStamp,
          }], // eslint-disable-line camelcase
        },
      });

    stripePayments.setStripeApi(stripe);
    sandbox.stub(sender, 'sendTxn');
  });

  afterEach(() => {
    stripe.customers.del.restore();
    stripe.customers.retrieve.restore();
    sender.sendTxn.restore();
  });

  it('creates a group plan', async () => {
    expect(group.purchased.plan.planId).to.not.exist;
    data.groupId = group._id;

    await api.createSubscription(data);

    const updatedGroup = await Group.findById(group._id).exec();

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

  it('does not create a group plan for a public guild', async () => {
    const publicGroup = generateGroup({
      name: groupName,
      type: 'guild',
      privacy: 'public',
      leader: user._id,
    });
    await publicGroup.save();

    expect(publicGroup.purchased.plan.planId).to.not.exist;
    data.groupId = publicGroup._id;

    await expect(api.createSubscription(data))
      .to.eventually.be.rejected.and.to.eql({
        httpCode: 401,
        name: 'NotAuthorized',
        message: i18n.t('onlyPrivateGuildsCanUpgrade'),
      });

    const updatedGroup = await Group.findById(publicGroup._id).exec();

    expect(updatedGroup.purchased.plan.planId).to.not.exist;
  });

  it('sends an email', async () => {
    expect(group.purchased.plan.planId).to.not.exist;
    data.groupId = group._id;

    await api.createSubscription(data);

    expect(sender.sendTxn).to.be.calledWith(user, 'group-subscription-begins');
  });

  it('sets extraMonths if plan has dateTerminated date', async () => {
    group.purchased.plan = plan;
    group.purchased.plan.dateTerminated = moment(new Date()).add(2, 'months');
    await group.save();
    expect(group.purchased.plan.extraMonths).to.eql(0);
    data.groupId = group._id;

    await api.createSubscription(data);

    const updatedGroup = await Group.findById(group._id).exec();
    expect(updatedGroup.purchased.plan.extraMonths).to.within(1.9, 2);
  });

  it('does not set negative extraMonths if plan has past dateTerminated date', async () => {
    group.purchased.plan = plan;
    group.purchased.plan.dateTerminated = moment(new Date()).subtract(2, 'months');
    await group.save();
    expect(group.purchased.plan.extraMonths).to.eql(0);
    data.groupId = group._id;

    await api.createSubscription(data);

    const updatedGroup = await Group.findById(group._id).exec();
    expect(updatedGroup.purchased.plan.extraMonths).to.eql(0);
  });

  it('grants all members of a group a subscription', async () => {
    expect(group.purchased.plan.planId).to.not.exist;
    data.groupId = group._id;

    await api.createSubscription(data);
    const updatedLeader = await User.findById(user._id).exec();

    expect(updatedLeader.purchased.plan.planId).to.eql('group_plan_auto');
    expect(updatedLeader.purchased.plan.customerId).to.eql('group-plan');
    expect(updatedLeader.purchased.plan.dateUpdated).to.exist;
    expect(updatedLeader.purchased.plan.gemsBought).to.eql(0);
    expect(updatedLeader.purchased.plan.paymentMethod).to.eql('Group Plan');
    expect(updatedLeader.purchased.plan.extraMonths).to.eql(0);
    expect(updatedLeader.purchased.plan.dateTerminated).to.eql(null);
    expect(updatedLeader.purchased.plan.lastBillingDate).to.not.exist;
    expect(updatedLeader.purchased.plan.dateCreated).to.exist;

    expect(updatedLeader.items.mounts['Jackalope-RoyalPurple']).to.be.true;
  });

  it('sends an email to member of group who was not a subscriber', async () => {
    const recipient = new User();
    recipient.profile.name = 'recipient';
    recipient.guilds.push(group._id);
    await recipient.save();

    data.groupId = group._id;

    await api.createSubscription(data);

    expect(sender.sendTxn).to.be.calledThrice;
    const recipientCall = sender.sendTxn.getCalls().find(call => {
      const isRecipient = call.args[0]._id === recipient._id;
      const isJoin = call.args[1] === 'group-member-join';
      return isRecipient && isJoin;
    });
    expect(recipientCall.args[0]._id).to.equal(recipient._id);
    expect(recipientCall.args[1]).to.equal('group-member-join');
    expect(recipientCall.args[2]).to.eql([
      { name: 'LEADER', content: user.profile.name },
      { name: 'GROUP_NAME', content: group.name },
      { name: 'PREVIOUS_SUBSCRIPTION_TYPE', content: EMAIL_TEMPLATE_SUBSCRIPTION_TYPE_NONE },
    ]);

    // confirm that the other email sent is appropriate:
    const leaderCall = sender.sendTxn.getCalls().find(call => {
      const isLeader = call.args[0]._id === group.leader;
      const isSubscriptionBegin = call.args[1] === 'group-subscription-begins';
      return isLeader && isSubscriptionBegin;
    });
    expect(leaderCall.args[0]._id).to.equal(group.leader);
    expect(leaderCall.args[1]).to.equal('group-subscription-begins');
  });

  it('sends one email to subscribed member of group, stating subscription is cancelled (Stripe)', async () => {
    const recipient = new User();
    recipient.profile.name = 'recipient';
    plan.key = 'basic_earned';
    plan.paymentMethod = stripePayments.constants.PAYMENT_METHOD;
    recipient.purchased.plan = plan;
    recipient.guilds.push(group._id);
    await recipient.save();

    data.groupId = group._id;

    await api.createSubscription(data);

    expect(sender.sendTxn).to.be.calledThrice;
    const recipientCall = sender.sendTxn.getCalls().find(call => {
      const isRecipient = call.args[0]._id === recipient._id;
      const isJoin = call.args[1] === 'group-member-join';
      return isRecipient && isJoin;
    });
    expect(recipientCall.args[0]._id).to.equal(recipient._id);
    expect(recipientCall.args[1]).to.equal('group-member-join');
    expect(recipientCall.args[2]).to.eql([
      { name: 'LEADER', content: user.profile.name },
      { name: 'GROUP_NAME', content: group.name },
      { name: 'PREVIOUS_SUBSCRIPTION_TYPE', content: EMAIL_TEMPLATE_SUBSCRIPTION_TYPE_NORMAL },
    ]);

    // confirm that the other email sent is not a cancel-subscription email:
    const leaderCall = sender.sendTxn.getCalls().find(call => {
      const isLeader = call.args[0]._id === group.leader;
      const isSubscriptionBegin = call.args[1] === 'group-subscription-begins';
      return isLeader && isSubscriptionBegin;
    });
    expect(leaderCall.args[0]._id).to.equal(group.leader);
    expect(leaderCall.args[1]).to.equal('group-subscription-begins');
  });

  it('sends one email to subscribed member of group, stating subscription is cancelled (Amazon)', async () => {
    sinon.stub(amzLib, 'getBillingAgreementDetails')
      .resolves({
        BillingAgreementDetails: {
          BillingAgreementStatus: { State: 'Closed' },
        },
      });

    const recipient = new User();
    recipient.profile.name = 'recipient';
    plan.planId = 'basic_earned';
    plan.paymentMethod = amzLib.constants.PAYMENT_METHOD;
    recipient.purchased.plan = plan;
    recipient.guilds.push(group._id);
    await recipient.save();

    data.groupId = group._id;

    await api.createSubscription(data);

    expect(sender.sendTxn).to.be.calledThrice;
    const recipientCall = sender.sendTxn.getCalls().find(call => {
      const isRecipient = call.args[0]._id === recipient._id;
      const isJoin = call.args[1] === 'group-member-join';
      return isRecipient && isJoin;
    });
    expect(recipientCall.args[0]._id).to.equal(recipient._id);
    expect(recipientCall.args[1]).to.equal('group-member-join');
    expect(recipientCall.args[2]).to.eql([
      { name: 'LEADER', content: user.profile.name },
      { name: 'GROUP_NAME', content: group.name },
      { name: 'PREVIOUS_SUBSCRIPTION_TYPE', content: EMAIL_TEMPLATE_SUBSCRIPTION_TYPE_NORMAL },
    ]);

    // confirm that the other email sent is not a cancel-subscription email:
    const leaderCall = sender.sendTxn.getCalls().find(call => {
      const isLeader = call.args[0]._id === group.leader;
      const isSubscriptionBegin = call.args[1] === 'group-subscription-begins';
      return isLeader && isSubscriptionBegin;
    });
    expect(leaderCall.args[0]._id).to.equal(group.leader);
    expect(leaderCall.args[1]).to.equal('group-subscription-begins');

    amzLib.getBillingAgreementDetails.restore();
  });

  it('sends one email to subscribed member of group, stating subscription is cancelled (PayPal)', async () => {
    sinon.stub(paypalPayments, 'paypalBillingAgreementCancel').resolves({});
    sinon.stub(paypalPayments, 'paypalBillingAgreementGet')
      .resolves({
        agreement_details: { // eslint-disable-line camelcase
          next_billing_date: moment().add(3, 'months').toDate(), // eslint-disable-line camelcase
          cycles_completed: 1, // eslint-disable-line camelcase
        },
      });

    const recipient = new User();
    recipient.profile.name = 'recipient';
    plan.planId = 'basic_earned';
    plan.paymentMethod = paypalPayments.constants.PAYMENT_METHOD;
    recipient.purchased.plan = plan;
    recipient.guilds.push(group._id);
    await recipient.save();

    data.groupId = group._id;

    await api.createSubscription(data);

    expect(sender.sendTxn).to.be.calledThrice;
    const recipientCall = sender.sendTxn.getCalls().find(call => {
      const isRecipient = call.args[0]._id === recipient._id;
      const isJoin = call.args[1] === 'group-member-join';
      return isRecipient && isJoin;
    });
    expect(recipientCall.args[0]._id).to.equal(recipient._id);
    expect(recipientCall.args[1]).to.equal('group-member-join');
    expect(recipientCall.args[2]).to.eql([
      { name: 'LEADER', content: user.profile.name },
      { name: 'GROUP_NAME', content: group.name },
      { name: 'PREVIOUS_SUBSCRIPTION_TYPE', content: EMAIL_TEMPLATE_SUBSCRIPTION_TYPE_NORMAL },
    ]);

    // confirm that the other email sent is not a cancel-subscription email:
    const leaderCall = sender.sendTxn.getCalls().find(call => {
      const isLeader = call.args[0]._id === group.leader;
      const isSubscriptionBegin = call.args[1] === 'group-subscription-begins';
      return isLeader && isSubscriptionBegin;
    });
    expect(leaderCall.args[0]._id).to.equal(group.leader);
    expect(leaderCall.args[1]).to.equal('group-subscription-begins');

    paypalPayments.paypalBillingAgreementGet.restore();
    paypalPayments.paypalBillingAgreementCancel.restore();
  });

  it('sends appropriate emails when subscribed member of group must manually cancel recurring Android subscription', async () => {
    const TECH_ASSISTANCE_EMAIL = nconf.get('EMAILS_TECH_ASSISTANCE_EMAIL');
    plan.customerId = 'random';
    plan.paymentMethod = api.constants.GOOGLE_PAYMENT_METHOD;

    const recipient = new User();
    recipient.profile.name = 'recipient';
    recipient.purchased.plan = plan;
    recipient.guilds.push(group._id);
    await recipient.save();

    data.groupId = group._id;

    await api.createSubscription(data);

    expect(sender.sendTxn).to.have.callCount(4);
    const adminUserSubscriptionDetails = sender.sendTxn.args.find(sendTxnArgs => {
      const emailType = sendTxnArgs[1];
      return emailType === 'admin-user-subscription-details';
    });
    expect(adminUserSubscriptionDetails).to.exist;
    expect(adminUserSubscriptionDetails[0].email).to.equal(TECH_ASSISTANCE_EMAIL);

    const groupMemberJoinOne = sender.sendTxn.args.find(sendTxnArgs => {
      const emailType = sendTxnArgs[1];
      const emailRecipient = sendTxnArgs[0];
      return emailType === 'group-member-join' && emailRecipient._id === recipient._id;
    });
    expect(groupMemberJoinOne).to.exist;
    expect(groupMemberJoinOne[0]._id).to.equal(recipient._id);
    expect(groupMemberJoinOne[2]).to.eql([
      { name: 'LEADER', content: groupLeaderName },
      { name: 'GROUP_NAME', content: groupName },
      { name: 'PREVIOUS_SUBSCRIPTION_TYPE', content: EMAIL_TEMPLATE_SUBSCRIPTION_TYPE_GOOGLE },
    ]);

    const groupMemberJoinTwo = sender.sendTxn.args.find(sendTxnArgs => {
      const emailType = sendTxnArgs[1];
      const emailRecipient = sendTxnArgs[0];
      return emailType === 'group-member-join' && emailRecipient._id === group.leader;
    });
    expect(groupMemberJoinTwo).to.exist;
    expect(groupMemberJoinTwo[0]._id).to.equal(group.leader);

    const groupSubscriptionBegins = sender.sendTxn.args.find(sendTxnArgs => {
      const emailType = sendTxnArgs[1];
      return emailType === 'group-subscription-begins';
    });
    expect(groupSubscriptionBegins).to.exist;
    expect(groupSubscriptionBegins[0]._id).to.equal(group.leader);
  });

  it('sends appropriate emails when subscribed member of group must manually cancel recurring iOS subscription', async () => {
    const TECH_ASSISTANCE_EMAIL = nconf.get('EMAILS_TECH_ASSISTANCE_EMAIL');
    plan.customerId = 'random';
    plan.paymentMethod = api.constants.IOS_PAYMENT_METHOD;

    const recipient = new User();
    recipient.profile.name = 'recipient';
    recipient.purchased.plan = plan;
    recipient.guilds.push(group._id);
    await recipient.save();

    data.groupId = group._id;

    await api.createSubscription(data);

    expect(sender.sendTxn).to.have.callCount(4);

    const adminUserSubscriptionDetails = sender.sendTxn.args.find(sendTxnArgs => {
      const emailType = sendTxnArgs[1];
      return emailType === 'admin-user-subscription-details';
    });
    expect(adminUserSubscriptionDetails).to.exist;
    expect(adminUserSubscriptionDetails[0].email).to.equal(TECH_ASSISTANCE_EMAIL);

    const groupMemberJoinOne = sender.sendTxn.args.find(sendTxnArgs => {
      const emailType = sendTxnArgs[1];
      const emailRecipient = sendTxnArgs[0];
      return emailType === 'group-member-join' && emailRecipient._id === recipient._id;
    });
    expect(groupMemberJoinOne).to.exist;
    expect(groupMemberJoinOne[0]._id).to.equal(recipient._id);
    expect(groupMemberJoinOne[2]).to.eql([
      { name: 'LEADER', content: groupLeaderName },
      { name: 'GROUP_NAME', content: groupName },
      { name: 'PREVIOUS_SUBSCRIPTION_TYPE', content: EMAIL_TEMPLATE_SUBSCRIPTION_TYPE_IOS },
    ]);

    const groupMemberJoinTwo = sender.sendTxn.args.find(sendTxnArgs => {
      const emailType = sendTxnArgs[1];
      const emailRecipient = sendTxnArgs[0];
      return emailType === 'group-member-join' && emailRecipient._id === group.leader;
    });
    expect(groupMemberJoinTwo).to.exist;
    expect(groupMemberJoinTwo[0]._id).to.equal(group.leader);

    const groupSubscriptionBegins = sender.sendTxn.args.find(sendTxnArgs => {
      const emailType = sendTxnArgs[1];
      return emailType === 'group-subscription-begins';
    });
    expect(groupSubscriptionBegins).to.exist;
    expect(groupSubscriptionBegins[0]._id).to.equal(group.leader);
  });

  it('adds months to members with existing gift subscription', async () => {
    const recipient = new User();
    recipient.profile.name = 'recipient';
    recipient.purchased.plan = plan;
    recipient.guilds.push(group._id);
    plan.planId = 'basic_earned';
    plan.paymentMethod = 'paymentMethod';
    data.gift = {
      member: recipient,
      subscription: {
        key: 'basic_earned',
        months: 1,
      },
    };
    await api.createSubscription(data);
    await recipient.save();

    data.gift = undefined;

    data.groupId = group._id;

    await api.createSubscription(data);

    const updatedUser = await User.findById(recipient._id).exec();

    expect(updatedUser.purchased.plan.planId).to.eql('group_plan_auto');
    expect(updatedUser.purchased.plan.customerId).to.eql('group-plan');
    expect(updatedUser.purchased.plan.dateUpdated).to.exist;
    expect(updatedUser.purchased.plan.gemsBought).to.eql(0);
    expect(updatedUser.purchased.plan.paymentMethod).to.eql('Group Plan');
    expect(updatedUser.purchased.plan.extraMonths).to.within(1, 3);
    expect(updatedUser.purchased.plan.dateTerminated).to.eql(null);
    expect(updatedUser.purchased.plan.lastBillingDate).to.not.exist;
    expect(updatedUser.purchased.plan.dateCreated).to.exist;
  });

  it('adds months to members with existing multi-month gift subscription', async () => {
    const recipient = new User();
    recipient.profile.name = 'recipient';
    recipient.purchased.plan = plan;
    recipient.guilds.push(group._id);
    data.gift = {
      member: recipient,
      subscription: {
        key: 'basic_3mo',
        months: 3,
      },
    };
    await api.createSubscription(data);
    await recipient.save();

    data.gift = undefined;

    data.groupId = group._id;

    await api.createSubscription(data);

    const updatedUser = await User.findById(recipient._id).exec();

    expect(updatedUser.purchased.plan.planId).to.eql('group_plan_auto');
    expect(updatedUser.purchased.plan.customerId).to.eql('group-plan');
    expect(updatedUser.purchased.plan.dateUpdated).to.exist;
    expect(updatedUser.purchased.plan.gemsBought).to.eql(0);
    expect(updatedUser.purchased.plan.paymentMethod).to.eql('Group Plan');
    expect(updatedUser.purchased.plan.extraMonths).to.within(3, 5);
    expect(updatedUser.purchased.plan.dateTerminated).to.eql(null);
    expect(updatedUser.purchased.plan.lastBillingDate).to.not.exist;
    expect(updatedUser.purchased.plan.dateCreated).to.exist;
  });

  it('adds months to members with existing recurring subscription (Stripe)', async () => {
    const recipient = new User();
    recipient.profile.name = 'recipient';
    plan.key = 'basic_earned';
    plan.paymentMethod = stripePayments.constants.PAYMENT_METHOD;
    recipient.purchased.plan = plan;
    recipient.guilds.push(group._id);
    await recipient.save();

    data.groupId = group._id;

    await api.createSubscription(data);

    const updatedUser = await User.findById(recipient._id).exec();
    expect(updatedUser.purchased.plan.extraMonths).to.within(2, 3);
  });

  it('adds months to members with existing recurring subscription (Amazon)', async () => {
    sinon.stub(amzLib, 'getBillingAgreementDetails')
      .resolves({
        BillingAgreementDetails: {
          BillingAgreementStatus: { State: 'Closed' },
        },
      });

    const recipient = new User();
    recipient.profile.name = 'recipient';
    plan.planId = 'basic_earned';
    plan.paymentMethod = amzLib.constants.PAYMENT_METHOD;
    plan.lastBillingDate = moment().add(3, 'months');
    recipient.purchased.plan = plan;
    recipient.guilds.push(group._id);

    await recipient.save();

    data.groupId = group._id;

    await api.createSubscription(data);

    const updatedUser = await User.findById(recipient._id).exec();

    expect(updatedUser.purchased.plan.extraMonths).to.within(3, 5);
  });

  it('adds months to members with existing recurring subscription (Paypal)', async () => {
    sinon.stub(paypalPayments, 'paypalBillingAgreementCancel').resolves({});
    sinon.stub(paypalPayments, 'paypalBillingAgreementGet')
      .resolves({
        agreement_details: { // eslint-disable-line camelcase
          next_billing_date: moment().add(3, 'months').toDate(), // eslint-disable-line camelcase
          cycles_completed: 1, // eslint-disable-line camelcase
        },
      });

    const recipient = new User();
    recipient.profile.name = 'recipient';
    plan.planId = 'basic_earned';
    plan.paymentMethod = paypalPayments.constants.PAYMENT_METHOD;
    recipient.purchased.plan = plan;
    recipient.guilds.push(group._id);

    await recipient.save();

    data.groupId = group._id;

    await api.createSubscription(data);

    const updatedUser = await User.findById(recipient._id).exec();

    expect(updatedUser.purchased.plan.extraMonths).to.within(2, 3);
    paypalPayments.paypalBillingAgreementGet.restore();
    paypalPayments.paypalBillingAgreementCancel.restore();
  });

  it('adds months to members with existing recurring subscription (Android)');
  it('adds months to members with existing recurring subscription (iOS)');

  it('adds months to members who already cancelled but not yet terminated recurring subscription', async () => {
    const recipient = new User();
    recipient.profile.name = 'recipient';
    plan.key = 'basic_earned';
    plan.paymentMethod = stripePayments.constants.PAYMENT_METHOD;
    recipient.purchased.plan = plan;
    recipient.guilds.push(group._id);
    await recipient.save();

    data.groupId = group._id;

    await recipient.cancelSubscription();

    await api.createSubscription(data);

    const updatedUser = await User.findById(recipient._id).exec();

    expect(updatedUser.purchased.plan.extraMonths).to.within(2, 3);
  });

  it('adds months to members who already cancelled but not yet terminated group plan subscription', async () => {
    const recipient = new User();
    recipient.profile.name = 'recipient';
    plan.key = 'basic_earned';
    plan.paymentMethod = api.constants.GROUP_PLAN_PAYMENT_METHOD;
    plan.extraMonths = 2.94;
    recipient.purchased.plan = plan;
    recipient.guilds.push(group._id);
    await recipient.save();

    data.groupId = group._id;

    await recipient.cancelSubscription();

    await api.createSubscription(data);

    const updatedUser = await User.findById(recipient._id).exec();
    expect(updatedUser.purchased.plan.extraMonths).to.within(3, 4);
  });

  it('resets date terminated if user has old subscription', async () => {
    const recipient = new User();
    recipient.profile.name = 'recipient';
    plan.key = 'basic_earned';
    plan.paymentMethod = stripePayments.constants.PAYMENT_METHOD;
    plan.dateTerminated = moment().subtract(1, 'days').toDate();
    recipient.purchased.plan = plan;
    recipient.guilds.push(group._id);
    await recipient.save();

    data.groupId = group._id;

    await api.createSubscription(data);

    const updatedUser = await User.findById(recipient._id).exec();

    expect(updatedUser.purchased.plan.dateTerminated).to.not.exist;
  });

  it('adds months to members with existing recurring subscription and includes existing extraMonths', async () => {
    const recipient = new User();
    recipient.profile.name = 'recipient';
    plan.key = 'basic_earned';
    plan.paymentMethod = stripePayments.constants.PAYMENT_METHOD;
    plan.extraMonths = 5;
    recipient.purchased.plan = plan;
    recipient.guilds.push(group._id);
    await recipient.save();

    data.groupId = group._id;

    await api.createSubscription(data);

    const updatedUser = await User.findById(recipient._id).exec();

    expect(updatedUser.purchased.plan.extraMonths).to.within(7, 9);
  });

  it('adds months to members with existing recurring subscription and ignores existing negative extraMonths', async () => {
    const recipient = new User();
    recipient.profile.name = 'recipient';
    plan.key = 'basic_earned';
    plan.paymentMethod = stripePayments.constants.PAYMENT_METHOD;
    plan.extraMonths = -5;
    recipient.purchased.plan = plan;
    recipient.guilds.push(group._id);
    await recipient.save();

    data.groupId = group._id;

    await api.createSubscription(data);

    const updatedUser = await User.findById(recipient._id).exec();

    expect(updatedUser.purchased.plan.extraMonths).to.within(2, 3);
  });

  it('does not override gemsBought, mysteryItems, dateCreated, and consective fields', async () => {
    const planCreatedDate = moment().toDate();
    const mysteryItem = { title: 'item' };
    const mysteryItems = [mysteryItem];
    const consecutive = {
      trinkets: 3,
      gemCapExtra: 20,
      offset: 1,
      count: 13,
    };

    const recipient = new User();
    recipient.profile.name = 'recipient';

    plan.key = 'basic_earned';
    plan.gemsBought = 3;
    plan.dateCreated = planCreatedDate;
    plan.mysteryItems = mysteryItems;
    plan.consecutive = consecutive;

    recipient.purchased.plan = plan;
    recipient.guilds.push(group._id);
    await recipient.save();

    data.groupId = group._id;

    await api.createSubscription(data);

    const updatedUser = await User.findById(recipient._id).exec();

    expect(updatedUser.purchased.plan.gemsBought).to.equal(3);
    expect(updatedUser.purchased.plan.mysteryItems[0]).to.eql(mysteryItem);
    expect(updatedUser.purchased.plan.consecutive.count).to.equal(consecutive.count);
    expect(updatedUser.purchased.plan.consecutive.offset).to.equal(consecutive.offset);
    expect(updatedUser.purchased.plan.consecutive.gemCapExtra).to.equal(consecutive.gemCapExtra);
    expect(updatedUser.purchased.plan.consecutive.trinkets).to.equal(consecutive.trinkets);
    expect(updatedUser.purchased.plan.dateCreated).to.eql(planCreatedDate);
  });

  it('does not modify a user with a group subscription when they join another group', async () => {
    const recipient = new User();
    recipient.profile.name = 'recipient';
    plan.key = 'basic_earned';
    recipient.purchased.plan = plan;
    recipient.guilds.push(group._id);
    await recipient.save();

    data.groupId = group._id;

    await api.createSubscription(data);

    let updatedUser = await User.findById(recipient._id).exec();
    const firstDateCreated = updatedUser.purchased.plan.dateCreated;
    const extraMonthsBeforeSecond = updatedUser.purchased.plan.extraMonths;

    const group2 = generateGroup({
      name: 'test group2',
      type: 'guild',
      privacy: 'private',
      leader: user._id,
    });
    data.groupId = group2._id;
    await group2.save();
    recipient.guilds.push(group2._id);
    await recipient.save();
    user.guilds.push(group2._id);
    await user.save();

    await api.createSubscription(data);

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

  it('does not remove a user who is in two groups plans and leaves one', async () => {
    const recipient = new User();
    recipient.profile.name = 'recipient';
    plan.key = 'basic_earned';
    recipient.purchased.plan = plan;
    recipient.guilds.push(group._id);
    await recipient.save();

    data.groupId = group._id;

    await api.createSubscription(data);

    let updatedUser = await User.findById(recipient._id).exec();
    const firstDateCreated = updatedUser.purchased.plan.dateCreated;
    const extraMonthsBeforeSecond = updatedUser.purchased.plan.extraMonths;

    const group2 = generateGroup({
      name: 'test group2',
      type: 'guild',
      privacy: 'private',
      leader: user._id,
    });
    data.groupId = group2._id;
    await group2.save();
    recipient.guilds.push(group2._id);
    await recipient.save();
    user.guilds.push(group2._id);
    await user.save();

    await api.createSubscription(data);

    const updatedGroup = await Group.findById(group._id).exec();
    updatedGroup.memberCount = 2;
    await updatedGroup.save();

    await updatedGroup.leave(recipient);

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

  it('does not modify a user with an unlimited subscription', async () => {
    plan.key = 'basic_earned';
    plan.customerId = api.constants.UNLIMITED_CUSTOMER_ID;

    const recipient = new User();
    recipient.profile.name = 'recipient';
    recipient.purchased.plan = plan;
    recipient.guilds.push(group._id);
    await recipient.save();

    data.groupId = group._id;

    await api.createSubscription(data);

    const updatedUser = await User.findById(recipient._id).exec();

    expect(updatedUser.purchased.plan.planId).to.eql('basic_3mo');
    expect(updatedUser.purchased.plan.customerId).to.eql(api.constants.UNLIMITED_CUSTOMER_ID);
    expect(updatedUser.purchased.plan.dateUpdated).to.exist;
    expect(updatedUser.purchased.plan.gemsBought).to.eql(0);
    expect(updatedUser.purchased.plan.paymentMethod).to.eql('paymentMethod');
    expect(updatedUser.purchased.plan.extraMonths).to.eql(0);
    expect(updatedUser.purchased.plan.dateTerminated).to.eql(null);
    expect(updatedUser.purchased.plan.lastBillingDate).to.exist;
    expect(updatedUser.purchased.plan.dateCreated).to.exist;
  });

  it('does not modify a user with an Android subscription', async () => {
    plan.customerId = 'random';
    plan.paymentMethod = api.constants.GOOGLE_PAYMENT_METHOD;

    const recipient = new User();
    recipient.profile.name = 'recipient';
    recipient.purchased.plan = plan;
    recipient.guilds.push(group._id);
    await recipient.save();

    data.groupId = group._id;

    await api.createSubscription(data);

    const updatedUser = await User.findById(recipient._id).exec();

    expect(updatedUser.purchased.plan.planId).to.eql('basic_3mo');
    expect(updatedUser.purchased.plan.customerId).to.eql('random');
    expect(updatedUser.purchased.plan.dateUpdated).to.exist;
    expect(updatedUser.purchased.plan.gemsBought).to.eql(0);
    expect(updatedUser.purchased.plan.paymentMethod).to.eql(api.constants.GOOGLE_PAYMENT_METHOD);
    expect(updatedUser.purchased.plan.extraMonths).to.eql(0);
    expect(updatedUser.purchased.plan.dateTerminated).to.eql(null);
    expect(updatedUser.purchased.plan.lastBillingDate).to.exist;
    expect(updatedUser.purchased.plan.dateCreated).to.exist;
  });

  it('does not modify a user with an iOS subscription', async () => {
    plan.customerId = 'random';
    plan.paymentMethod = api.constants.IOS_PAYMENT_METHOD;

    const recipient = new User();
    recipient.profile.name = 'recipient';
    recipient.purchased.plan = plan;
    recipient.guilds.push(group._id);
    await recipient.save();

    data.groupId = group._id;

    await api.createSubscription(data);

    const updatedUser = await User.findById(recipient._id).exec();

    expect(updatedUser.purchased.plan.planId).to.eql('basic_3mo');
    expect(updatedUser.purchased.plan.customerId).to.eql('random');
    expect(updatedUser.purchased.plan.dateUpdated).to.exist;
    expect(updatedUser.purchased.plan.gemsBought).to.eql(0);
    expect(updatedUser.purchased.plan.paymentMethod).to.eql(api.constants.IOS_PAYMENT_METHOD);
    expect(updatedUser.purchased.plan.extraMonths).to.eql(0);
    expect(updatedUser.purchased.plan.dateTerminated).to.eql(null);
    expect(updatedUser.purchased.plan.lastBillingDate).to.exist;
    expect(updatedUser.purchased.plan.dateCreated).to.exist;
  });

  it('updates a user with a cancelled but active group subscription', async () => {
    plan.key = 'basic_earned';
    plan.customerId = api.constants.GROUP_PLAN_CUSTOMER_ID;
    plan.dateTerminated = moment().add(1, 'months');

    const recipient = new User();
    recipient.profile.name = 'recipient';
    recipient.purchased.plan = plan;
    recipient.guilds.push(group._id);
    await recipient.save();

    data.groupId = group._id;

    await api.createSubscription(data);

    const updatedUser = await User.findById(recipient._id).exec();

    expect(updatedUser.purchased.plan.planId).to.eql('group_plan_auto');
    expect(updatedUser.purchased.plan.customerId).to.eql(api.constants.GROUP_PLAN_CUSTOMER_ID);
    expect(updatedUser.purchased.plan.dateUpdated).to.exist;
    expect(updatedUser.purchased.plan.gemsBought).to.eql(0);
    expect(updatedUser.purchased.plan.paymentMethod).to.eql('Group Plan');
    expect(updatedUser.purchased.plan.extraMonths).to.within(0, 2);
    expect(updatedUser.purchased.plan.dateTerminated).to.eql(null);
    expect(updatedUser.purchased.plan.lastBillingDate).to.not.exist;
    expect(updatedUser.purchased.plan.dateCreated).to.exist;
  });
});
