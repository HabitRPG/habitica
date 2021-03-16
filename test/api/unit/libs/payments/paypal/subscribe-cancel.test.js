/* eslint-disable camelcase */
import paypalPayments from '../../../../../../website/server/libs/payments/paypal';
import payments from '../../../../../../website/server/libs/payments/payments';
import {
  generateGroup,
} from '../../../../../helpers/api-unit.helper';
import { model as User } from '../../../../../../website/server/models/user';
import common from '../../../../../../website/common';
import { createNonLeaderGroupMember } from '../paymentHelpers';

const { i18n } = common;

describe('paypal - subscribeCancel', () => {
  const subKey = 'basic_3mo';
  let user; let group; let groupId; let customerId; let groupCustomerId; let
    nextBillingDate;
  let paymentCancelSubscriptionSpy; let paypalBillingAgreementCancelStub; let
    paypalBillingAgreementGetStub;

  beforeEach(async () => {
    customerId = 'customer-id';
    groupCustomerId = 'groupCustomerId-test';

    user = new User();
    user.profile.name = 'sender';
    user.purchased.plan.customerId = customerId;
    user.purchased.plan.planId = subKey;
    user.purchased.plan.lastBillingDate = new Date();

    group = generateGroup({
      name: 'test group',
      type: 'guild',
      privacy: 'public',
      leader: user._id,
    });
    group.purchased.plan.customerId = groupCustomerId;
    group.purchased.plan.planId = subKey;
    group.purchased.plan.lastBillingDate = new Date();
    await group.save();

    nextBillingDate = new Date();

    paypalBillingAgreementCancelStub = sinon.stub(paypalPayments, 'paypalBillingAgreementCancel').resolves({});
    paypalBillingAgreementGetStub = sinon.stub(paypalPayments, 'paypalBillingAgreementGet')
      .resolves({
        agreement_details: {
          next_billing_date: nextBillingDate,
          cycles_completed: 1,
        },
      });
    paymentCancelSubscriptionSpy = sinon.stub(payments, 'cancelSubscription').resolves({});
  });

  afterEach(() => {
    paypalPayments.paypalBillingAgreementGet.restore();
    paypalPayments.paypalBillingAgreementCancel.restore();
    payments.cancelSubscription.restore();
  });

  it('should throw an error if we are missing a subscription', async () => {
    user.purchased.plan.customerId = undefined;

    await expect(paypalPayments.subscribeCancel({ user }))
      .to.eventually.be.rejected.and.to.eql({
        httpCode: 401,
        name: 'NotAuthorized',
        message: i18n.t('missingSubscription'),
      });
  });

  it('should throw an error if group is not found', async () => {
    await expect(paypalPayments.subscribeCancel({ user, groupId: 'fake-id' }))
      .to.eventually.be.rejected.and.to.eql({
        httpCode: 404,
        name: 'NotFound',
        message: i18n.t('groupNotFound'),
      });
  });

  it('should throw an error if user is not group leader', async () => {
    const nonLeader = await createNonLeaderGroupMember(group);

    await expect(paypalPayments.subscribeCancel({ user: nonLeader, groupId: group._id }))
      .to.eventually.be.rejected.and.to.eql({
        httpCode: 401,
        name: 'NotAuthorized',
        message: i18n.t('onlyGroupLeaderCanManageSubscription'),
      });
  });

  it('should cancel a user subscription', async () => {
    await paypalPayments.subscribeCancel({ user });

    expect(paypalBillingAgreementGetStub).to.be.calledOnce;
    expect(paypalBillingAgreementGetStub).to.be.calledWith(customerId);
    expect(paypalBillingAgreementCancelStub).to.be.calledOnce;
    expect(paypalBillingAgreementCancelStub).to.be.calledWith(customerId, { note: i18n.t('cancelingSubscription') });

    expect(paymentCancelSubscriptionSpy).to.be.calledOnce;
    expect(paymentCancelSubscriptionSpy).to.be.calledWith({
      user,
      groupId,
      paymentMethod: 'Paypal',
      nextBill: nextBillingDate,
      cancellationReason: undefined,
    });
  });

  it('should cancel a group subscription', async () => {
    await paypalPayments.subscribeCancel({ user, groupId: group._id });

    expect(paypalBillingAgreementGetStub).to.be.calledOnce;
    expect(paypalBillingAgreementGetStub).to.be.calledWith(groupCustomerId);
    expect(paypalBillingAgreementCancelStub).to.be.calledOnce;
    expect(paypalBillingAgreementCancelStub).to.be.calledWith(groupCustomerId, { note: i18n.t('cancelingSubscription') });

    expect(paymentCancelSubscriptionSpy).to.be.calledOnce;
    expect(paymentCancelSubscriptionSpy).to.be.calledWith({
      user,
      groupId: group._id,
      paymentMethod: 'Paypal',
      nextBill: nextBillingDate,
      cancellationReason: undefined,
    });
  });
});
