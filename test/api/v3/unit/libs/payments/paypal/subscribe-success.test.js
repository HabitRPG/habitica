/* eslint-disable camelcase */
import payments from '../../../../../../../website/server/libs/payments';
import paypalPayments from '../../../../../../../website/server/libs/paypalPayments';
import {
  generateGroup,
} from '../../../../../../helpers/api-unit.helper.js';
import { model as User } from '../../../../../../../website/server/models/user';
import common from '../../../../../../../website/common';

describe('subscribeSuccess', () => {
  const subKey = 'basic_3mo';
  let user, group, block, groupId, token, headers, customerId;
  let paypalBillingAgreementExecuteStub, paymentsCreateSubscritionStub;

  beforeEach(async () => {
    user = new User();

    group = generateGroup({
      name: 'test group',
      type: 'guild',
      privacy: 'public',
      leader: user._id,
    });

    token = 'test-token';
    headers = {};
    block = common.content.subscriptionBlocks[subKey];
    customerId = 'test-customerId';

    paypalBillingAgreementExecuteStub = sinon.stub(paypalPayments, 'paypalBillingAgreementExecute')
      .returnsPromise({}).resolves({
        id: customerId,
      });
    paymentsCreateSubscritionStub = sinon.stub(payments, 'createSubscription').returnsPromise().resolves({});
  });

  afterEach(() => {
    paypalPayments.paypalBillingAgreementExecute.restore();
    payments.createSubscription.restore();
  });

  it('creates a user subscription', async () => {
    await paypalPayments.subscribeSuccess({user, block, groupId, token, headers});

    expect(paypalBillingAgreementExecuteStub).to.be.calledOnce;
    expect(paypalBillingAgreementExecuteStub).to.be.calledWith(token, {});

    expect(paymentsCreateSubscritionStub).to.be.calledOnce;
    expect(paymentsCreateSubscritionStub).to.be.calledWith({
      user,
      groupId,
      customerId,
      paymentMethod: 'Paypal',
      sub: block,
      headers,
    });
  });

  it('create a group subscription', async () => {
    groupId = group._id;

    await paypalPayments.subscribeSuccess({user, block, groupId, token, headers});

    expect(paypalBillingAgreementExecuteStub).to.be.calledOnce;
    expect(paypalBillingAgreementExecuteStub).to.be.calledWith(token, {});

    expect(paymentsCreateSubscritionStub).to.be.calledOnce;
    expect(paymentsCreateSubscritionStub).to.be.calledWith({
      user,
      groupId,
      customerId,
      paymentMethod: 'Paypal',
      sub: block,
      headers,
    });
  });
});
