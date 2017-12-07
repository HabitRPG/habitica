import moment from 'moment';

import {
  generateGroup,
} from '../../../../../../helpers/api-unit.helper.js';
import { model as User } from '../../../../../../../website/server/models/user';
import amzLib from '../../../../../../../website/server/libs/amazonPayments';
import payments from '../../../../../../../website/server/libs/payments';
import common from '../../../../../../../website/common';
import { createNonLeaderGroupMember } from '../paymentHelpers';

const i18n = common.i18n;

describe('Amazon Payments - Cancel Subscription', () => {
  const subKey = 'basic_3mo';

  let user, group, headers, billingAgreementId, subscriptionBlock, subscriptionLength;
  let getBillingAgreementDetailsSpy;
  let paymentCancelSubscriptionSpy;

  function expectAmazonStubs () {
    expect(getBillingAgreementDetailsSpy).to.be.calledOnce;
    expect(getBillingAgreementDetailsSpy).to.be.calledWith({
      AmazonBillingAgreementId: billingAgreementId,
    });
  }

  function expectAmazonCancelSubscriptionSpy (groupId, lastBillingDate) {
    expect(paymentCancelSubscriptionSpy).to.be.calledWith({
      user,
      groupId,
      nextBill: moment(lastBillingDate).add({ days: subscriptionLength }),
      paymentMethod: amzLib.constants.PAYMENT_METHOD,
      headers,
      cancellationReason: undefined,
    });
  }

  function expectAmazonCancelUserSubscriptionSpy () {
    expect(paymentCancelSubscriptionSpy).to.be.calledOnce;
    expectAmazonCancelSubscriptionSpy(undefined, user.purchased.plan.lastBillingDate);
  }

  function expectAmazonCancelGroupSubscriptionSpy (groupId) {
    expect(paymentCancelSubscriptionSpy).to.be.calledOnce;
    expectAmazonCancelSubscriptionSpy(groupId, group.purchased.plan.lastBillingDate);
  }

  function expectBillingAggreementDetailSpy () {
    getBillingAgreementDetailsSpy = sinon.stub(amzLib, 'getBillingAgreementDetails')
      .returnsPromise()
      .resolves({
        BillingAgreementDetails: {
          BillingAgreementStatus: {State: 'Open'},
        },
      });
  }

  beforeEach(async () => {
    user = new User();
    user.profile.name = 'sender';
    user.purchased.plan.customerId = 'customer-id';
    user.purchased.plan.planId = subKey;
    user.purchased.plan.lastBillingDate = new Date();

    group = generateGroup({
      name: 'test group',
      type: 'guild',
      privacy: 'public',
      leader: user._id,
    });
    group.purchased.plan.customerId = 'customer-id';
    group.purchased.plan.planId = subKey;
    group.purchased.plan.lastBillingDate = new Date();
    await group.save();

    subscriptionBlock = common.content.subscriptionBlocks[subKey];
    subscriptionLength = subscriptionBlock.months * 30;

    headers = {};

    getBillingAgreementDetailsSpy = sinon.stub(amzLib, 'getBillingAgreementDetails');
    getBillingAgreementDetailsSpy.returnsPromise().resolves({
      BillingAgreementDetails: {
        BillingAgreementStatus: {State: 'Closed'},
      },
    });

    paymentCancelSubscriptionSpy = sinon.stub(payments, 'cancelSubscription');
    paymentCancelSubscriptionSpy.returnsPromise().resolves({});
  });

  afterEach(function () {
    amzLib.getBillingAgreementDetails.restore();
    payments.cancelSubscription.restore();
  });

  it('should throw an error if we are missing a subscription', async () => {
    user.purchased.plan.customerId = undefined;

    await expect(amzLib.cancelSubscription({user}))
      .to.eventually.be.rejected.and.to.eql({
        httpCode: 401,
        name: 'NotAuthorized',
        message: i18n.t('missingSubscription'),
      });
  });

  it('should cancel a user subscription', async () => {
    billingAgreementId = user.purchased.plan.customerId;

    await amzLib.cancelSubscription({user, headers});

    expectAmazonCancelUserSubscriptionSpy();
    expectAmazonStubs();
  });

  it('should close a user subscription if amazon not closed', async () => {
    amzLib.getBillingAgreementDetails.restore();
    expectBillingAggreementDetailSpy();
    let closeBillingAgreementSpy = sinon.stub(amzLib, 'closeBillingAgreement').returnsPromise().resolves({});
    billingAgreementId = user.purchased.plan.customerId;

    await amzLib.cancelSubscription({user, headers});

    expectAmazonStubs();
    expect(closeBillingAgreementSpy).to.be.calledOnce;
    expect(closeBillingAgreementSpy).to.be.calledWith({
      AmazonBillingAgreementId: billingAgreementId,
    });
    expectAmazonCancelUserSubscriptionSpy();
    amzLib.closeBillingAgreement.restore();
  });

  it('should throw an error if group is not found', async () => {
    await expect(amzLib.cancelSubscription({user, groupId: 'fake-id'}))
      .to.eventually.be.rejected.and.to.eql({
        httpCode: 404,
        name: 'NotFound',
        message: i18n.t('groupNotFound'),
      });
  });

  it('should throw an error if user is not group leader', async () => {
    let nonLeader = await createNonLeaderGroupMember(group);

    await expect(amzLib.cancelSubscription({user: nonLeader, groupId: group._id}))
      .to.eventually.be.rejected.and.to.eql({
        httpCode: 401,
        name: 'NotAuthorized',
        message: i18n.t('onlyGroupLeaderCanManageSubscription'),
      });
  });

  it('should cancel a group subscription', async () => {
    billingAgreementId = group.purchased.plan.customerId;

    await amzLib.cancelSubscription({user, groupId: group._id, headers});

    expectAmazonCancelGroupSubscriptionSpy(group._id);
    expectAmazonStubs();
  });

  it('should close a group subscription if amazon not closed', async () => {
    amzLib.getBillingAgreementDetails.restore();
    expectBillingAggreementDetailSpy();
    let closeBillingAgreementSpy = sinon.stub(amzLib, 'closeBillingAgreement').returnsPromise().resolves({});
    billingAgreementId = group.purchased.plan.customerId;

    await amzLib.cancelSubscription({user, groupId: group._id, headers});

    expectAmazonStubs();
    expect(closeBillingAgreementSpy).to.be.calledOnce;
    expect(closeBillingAgreementSpy).to.be.calledWith({
      AmazonBillingAgreementId: billingAgreementId,
    });
    expectAmazonCancelGroupSubscriptionSpy(group._id);
    amzLib.closeBillingAgreement.restore();
  });
});
