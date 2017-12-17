/* eslint-disable camelcase */
import payments from '../../../../../../../website/server/libs/payments';
import paypalPayments from '../../../../../../../website/server/libs/paypalPayments';
import {
  generateGroup,
} from '../../../../../../helpers/api-unit.helper.js';
import { model as User } from '../../../../../../../website/server/models/user';

describe('ipn', () => {
  const subKey = 'basic_3mo';
  let user, group, txn_type, userPaymentId, groupPaymentId;
  let ipnVerifyAsyncStub, paymentCancelSubscriptionSpy;

  beforeEach(async () => {
    txn_type = 'recurring_payment_profile_cancel';
    userPaymentId = 'userPaymentId-test';
    groupPaymentId = 'groupPaymentId-test';

    user = new User();
    user.profile.name = 'sender';
    user.purchased.plan.customerId = userPaymentId;
    user.purchased.plan.planId = subKey;
    user.purchased.plan.lastBillingDate = new Date();
    await user.save();

    group = generateGroup({
      name: 'test group',
      type: 'guild',
      privacy: 'public',
      leader: user._id,
    });
    group.purchased.plan.customerId = groupPaymentId;
    group.purchased.plan.planId = subKey;
    group.purchased.plan.lastBillingDate = new Date();
    await group.save();

    ipnVerifyAsyncStub = sinon.stub(paypalPayments, 'ipnVerifyAsync').returnsPromise().resolves({});
    paymentCancelSubscriptionSpy = sinon.stub(payments, 'cancelSubscription').returnsPromise().resolves({});
  });

  afterEach(function () {
    paypalPayments.ipnVerifyAsync.restore();
    payments.cancelSubscription.restore();
  });

  it('should cancel a user subscription', async () => {
    await paypalPayments.ipn({txn_type, recurring_payment_id: userPaymentId});

    expect(ipnVerifyAsyncStub).to.be.calledOnce;
    expect(ipnVerifyAsyncStub).to.be.calledWith({txn_type, recurring_payment_id: userPaymentId});

    expect(paymentCancelSubscriptionSpy).to.be.calledOnce;
    expect(paymentCancelSubscriptionSpy.args[0][0].user._id).to.eql(user._id);
    expect(paymentCancelSubscriptionSpy.args[0][0].paymentMethod).to.eql('Paypal');
  });

  it('should cancel a group subscription', async () => {
    await paypalPayments.ipn({txn_type, recurring_payment_id: groupPaymentId});

    expect(ipnVerifyAsyncStub).to.be.calledOnce;
    expect(ipnVerifyAsyncStub).to.be.calledWith({txn_type, recurring_payment_id: groupPaymentId});

    expect(paymentCancelSubscriptionSpy).to.be.calledOnce;
    expect(paymentCancelSubscriptionSpy).to.be.calledWith({ groupId: group._id, paymentMethod: 'Paypal' });
  });
});
