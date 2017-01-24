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

describe('Purchasing a subscription for group', () => {
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

    let subscriptionId = 'subId';
    sinon.stub(stripe.customers, 'del').returnsPromise().resolves({});

    let currentPeriodEndTimeStamp = moment().add(3, 'months').unix();
    sinon.stub(stripe.customers, 'retrieve')
      .returnsPromise().resolves({
        subscriptions: {
          data: [{id: subscriptionId, current_period_end: currentPeriodEndTimeStamp}], // eslint-disable-line camelcase
        },
      });

    stripePayments.setStripeApi(stripe);
  })

  afterEach(() => {
    stripe.customers.del.restore();
    stripe.customers.retrieve.restore();
  });

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

  it('grants all members of a group a subscription', async () => {
    user.guilds.push(group._id);
    await user.save();
    expect(group.purchased.plan.planId).to.not.exist;
    data.groupId = group._id;

    await api.createSubscription(data);

    let updatedLeader = await User.findById(user._id).exec();

    expect(updatedLeader.purchased.plan.planId).to.eql('group_plan_auto');
    expect(updatedLeader.purchased.plan.customerId).to.eql('group-plan');
    expect(updatedLeader.purchased.plan.dateUpdated).to.exist;
    expect(updatedLeader.purchased.plan.gemsBought).to.eql(0);
    expect(updatedLeader.purchased.plan.paymentMethod).to.eql('Group Plan');
    expect(updatedLeader.purchased.plan.extraMonths).to.eql(0);
    expect(updatedLeader.purchased.plan.dateTerminated).to.eql(null);
    expect(updatedLeader.purchased.plan.lastBillingDate).to.not.exist;
    expect(updatedLeader.purchased.plan.dateCreated).to.exist;
  });

  it('adds months to members with existing gift subscription', async () => {
    let recipient = new User();
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

    user.guilds.push(group._id);
    await user.save();
    data.groupId = group._id;

    await api.createSubscription(data);

    let updatedUser = await User.findById(recipient._id).exec();

    expect(updatedUser.purchased.plan.planId).to.eql('group_plan_auto');
    expect(updatedUser.purchased.plan.customerId).to.eql('group-plan');
    expect(updatedUser.purchased.plan.dateUpdated).to.exist;
    expect(updatedUser.purchased.plan.gemsBought).to.eql(0);
    expect(updatedUser.purchased.plan.paymentMethod).to.eql('Group Plan');
    expect(updatedUser.purchased.plan.extraMonths).to.within(2, 3);
    expect(updatedUser.purchased.plan.dateTerminated).to.eql(null);
    expect(updatedUser.purchased.plan.lastBillingDate).to.not.exist;
    expect(updatedUser.purchased.plan.dateCreated).to.exist;
  });

  it('adds months to members with existing multi-month gift subscription', async () => {
    let recipient = new User();
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

    user.guilds.push(group._id);
    await user.save();
    data.groupId = group._id;

    await api.createSubscription(data);

    let updatedUser = await User.findById(recipient._id).exec();

    expect(updatedUser.purchased.plan.planId).to.eql('group_plan_auto');
    expect(updatedUser.purchased.plan.customerId).to.eql('group-plan');
    expect(updatedUser.purchased.plan.dateUpdated).to.exist;
    expect(updatedUser.purchased.plan.gemsBought).to.eql(0);
    expect(updatedUser.purchased.plan.paymentMethod).to.eql('Group Plan');
    expect(updatedUser.purchased.plan.extraMonths).to.within(4, 5);
    expect(updatedUser.purchased.plan.dateTerminated).to.eql(null);
    expect(updatedUser.purchased.plan.lastBillingDate).to.not.exist;
    expect(updatedUser.purchased.plan.dateCreated).to.exist;
  });

  it('adds months to members with existing recurring subscription (Stripe)', async () => {
    let recipient = new User();
    recipient.profile.name = 'recipient';
    plan.key = 'basic_earned';
    plan.paymentMethod = stripePayments.constants.PAYMENT_METHOD;
    recipient.purchased.plan = plan;
    recipient.guilds.push(group._id);
    await recipient.save();

    user.guilds.push(group._id);
    await user.save();
    data.groupId = group._id;

    await api.createSubscription(data);

    let updatedUser = await User.findById(recipient._id).exec();

    expect(updatedUser.purchased.plan.extraMonths).to.within(2, 3);
  });

  it('adds months to members with existing recurring subscription (Amazon)', async () => {
    let getBillingAgreementDetailsSpy = sinon.stub(amzLib, 'getBillingAgreementDetails')
      .returnsPromise()
      .resolves({
        BillingAgreementDetails: {
          BillingAgreementStatus: {State: 'Closed'},
        },
      });

    let recipient = new User();
    recipient.profile.name = 'recipient';
    plan.planId = 'basic_earned';
    plan.paymentMethod = amzLib.constants.PAYMENT_METHOD_AMAZON;
    plan.lastBillingDate = moment().add(3, 'months');
    recipient.purchased.plan = plan;
    recipient.guilds.push(group._id);

    await recipient.save();

    user.guilds.push(group._id);
    await user.save();
    data.groupId = group._id;

    await api.createSubscription(data);

    let updatedUser = await User.findById(recipient._id).exec();

    expect(updatedUser.purchased.plan.extraMonths).to.within(3, 4);
  });

  it('adds months to members with existing recurring subscription (Paypal)', async () => {
    let paypalBillingAgreementCancelStub = sinon.stub(paypalPayments, 'paypalBillingAgreementCancel').returnsPromise().resolves({});
    let paypalBillingAgreementGetStub = sinon.stub(paypalPayments, 'paypalBillingAgreementGet')
      .returnsPromise().resolves({
        agreement_details: {
          next_billing_date: moment().add(3, 'months').toDate(),
          cycles_completed: 1,
        },
      });

    let recipient = new User();
    recipient.profile.name = 'recipient';
    plan.planId = 'basic_earned';
    plan.paymentMethod = paypalPayments.constants.PAYMENT_METHOD;
    recipient.purchased.plan = plan;
    recipient.guilds.push(group._id);

    await recipient.save();

    user.guilds.push(group._id);
    await user.save();
    data.groupId = group._id;

    await api.createSubscription(data);

    let updatedUser = await User.findById(recipient._id).exec();

    expect(updatedUser.purchased.plan.extraMonths).to.within(2, 3);
  });

  it('adds months to members with existing recurring subscription (Android)');
  it('adds months to members with existing recurring subscription (iOs)');

  it('adds months to members who already cancelled but not yet terminated recurring subscription', async () => {
    let recipient = new User();
    recipient.profile.name = 'recipient';
    plan.key = 'basic_earned';
    plan.paymentMethod = stripePayments.constants.PAYMENT_METHOD;
    recipient.purchased.plan = plan;
    recipient.guilds.push(group._id);
    await recipient.save();

    user.guilds.push(group._id);
    await user.save();
    data.groupId = group._id;

    await recipient.cancelSubscription();

    await api.createSubscription(data);

    let updatedUser = await User.findById(recipient._id).exec();

    expect(updatedUser.purchased.plan.extraMonths).to.within(2, 3);
  });

  it('resets date terminated if user has old subscription', async () => {
    let recipient = new User();
    recipient.profile.name = 'recipient';
    plan.key = 'basic_earned';
    plan.paymentMethod = stripePayments.constants.PAYMENT_METHOD;
    plan.dateTerminated = moment().subtract(1, 'days').toDate();
    recipient.purchased.plan = plan;
    recipient.guilds.push(group._id);
    await recipient.save();

    user.guilds.push(group._id);
    await user.save();
    data.groupId = group._id;

    await api.createSubscription(data);

    let updatedUser = await User.findById(recipient._id).exec();

    expect(updatedUser.purchased.plan.dateTerminated).to.not.exist;
  });

  it('adds months to members with existing recurring subscription and includes existing extraMonths', async () => {
    let recipient = new User();
    recipient.profile.name = 'recipient';
    plan.key = 'basic_earned';
    plan.paymentMethod = stripePayments.constants.PAYMENT_METHOD;
    plan.extraMonths = 5;
    recipient.purchased.plan = plan;
    recipient.guilds.push(group._id);
    await recipient.save();

    user.guilds.push(group._id);
    await user.save();
    data.groupId = group._id;

    await api.createSubscription(data);

    let updatedUser = await User.findById(recipient._id).exec();

    expect(updatedUser.purchased.plan.extraMonths).to.within(7, 8);
  });

  it('adds months to members with existing recurring subscription and ignores existing negative extraMonths', async () => {
    let recipient = new User();
    recipient.profile.name = 'recipient';
    plan.key = 'basic_earned';
    plan.paymentMethod = stripePayments.constants.PAYMENT_METHOD;
    plan.extraMonths = -5;
    recipient.purchased.plan = plan;
    recipient.guilds.push(group._id);
    await recipient.save();

    user.guilds.push(group._id);
    await user.save();
    data.groupId = group._id;

    await api.createSubscription(data);

    let updatedUser = await User.findById(recipient._id).exec();

    expect(updatedUser.purchased.plan.extraMonths).to.within(2, 3);
  });

  it('does not override gemsBought, mysteryItems, dateCreated, and consective fields', async () => {
    let planCreatedDate = moment().toDate();
    let mysteryItems = [{title: 'item'}];
    let consecutive = {
      trinkets: 3,
      gemCapExtra: 20,
      offset: 1,
      count: 13,
    };

    let recipient = new User();
    recipient.profile.name = 'recipient';

    plan.key = 'basic_earned';
    plan.gemsBought = 3;
    plan.dateCreated = planCreatedDate;
    plan.mysteryItems = mysteryItems;
    plan.consecutive = consecutive;

    recipient.purchased.plan = plan;
    recipient.guilds.push(group._id);
    await recipient.save();

    user.guilds.push(group._id);
    await user.save();
    data.groupId = group._id;

    await api.createSubscription(data);

    let updatedUser = await User.findById(recipient._id).exec();

    expect(updatedUser.purchased.plan.gemsBought).to.equal(3);
    expect(updatedUser.purchased.plan.mysteryItems.length).to.eql(1);
    expect(updatedUser.purchased.plan.consecutive.count).to.equal(consecutive.count);
    expect(updatedUser.purchased.plan.consecutive.offset).to.equal(consecutive.offset);
    expect(updatedUser.purchased.plan.consecutive.gemCapExtra).to.equal(consecutive.gemCapExtra);
    expect(updatedUser.purchased.plan.consecutive.trinkets).to.equal(consecutive.trinkets);
    expect(updatedUser.purchased.plan.dateCreated).to.eql(planCreatedDate);
  });

  it('does not modify a user with a group subscription when they join another group', async () => {
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

    let recipient = new User();
    recipient.profile.name = 'recipient';
    recipient.purchased.plan = plan;
    recipient.guilds.push(group._id);
    await recipient.save();

    user.guilds.push(group._id);
    await user.save();
    data.groupId = group._id;

    await api.createSubscription(data);

    let updatedUser = await User.findById(recipient._id).exec();

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
});
