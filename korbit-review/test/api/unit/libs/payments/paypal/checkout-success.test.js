/* eslint-disable camelcase */
import paypalPayments from '../../../../../../website/server/libs/payments/paypal';
import payments from '../../../../../../website/server/libs/payments/payments';
import { model as User } from '../../../../../../website/server/models/user';
import common from '../../../../../../website/common';

describe('paypal - checkout success', () => {
  const subKey = 'basic_3mo';
  let user; let gift; let customerId; let
    paymentId;
  const gemsBlockKey = '21gems'; const gemsBlock = common.content.gems[gemsBlockKey];
  let paypalPaymentExecuteStub; let paymentBuyGemsStub; let
    paymentsCreateSubscritionStub;

  beforeEach(() => {
    user = new User();
    customerId = 'customerId-test';
    paymentId = 'paymentId-test';

    paypalPaymentExecuteStub = sinon.stub(paypalPayments, 'paypalPaymentExecute').resolves({});
    paymentBuyGemsStub = sinon.stub(payments, 'buyGems').resolves({});
    paymentsCreateSubscritionStub = sinon.stub(payments, 'createSubscription').resolves({});
  });

  afterEach(() => {
    paypalPayments.paypalPaymentExecute.restore();
    payments.buyGems.restore();
    payments.createSubscription.restore();
  });

  it('purchases gems', async () => {
    await paypalPayments.checkoutSuccess({
      user, gift, paymentId, customerId, gemsBlock: gemsBlockKey,
    });

    expect(paypalPaymentExecuteStub).to.be.calledOnce;
    expect(paypalPaymentExecuteStub).to.be.calledWith(paymentId, { payer_id: customerId });
    expect(paymentBuyGemsStub).to.be.calledOnce;
    expect(paymentBuyGemsStub).to.be.calledWith({
      user,
      customerId,
      paymentMethod: 'Paypal',
      gemsBlock,
    });
  });

  it('gifts gems', async () => {
    const receivingUser = new User();
    await receivingUser.save();
    gift = {
      type: 'gems',
      gems: {
        amount: 16,
        uuid: receivingUser._id,
      },
    };

    await paypalPayments.checkoutSuccess({
      user, gift, paymentId, customerId,
    });

    expect(paypalPaymentExecuteStub).to.be.calledOnce;
    expect(paypalPaymentExecuteStub).to.be.calledWith(paymentId, { payer_id: customerId });
    expect(paymentBuyGemsStub).to.be.calledOnce;
    expect(paymentBuyGemsStub).to.be.calledWith({
      user,
      customerId,
      paymentMethod: 'PayPal (Gift)',
      gift,
    });
  });

  it('gifts subscription', async () => {
    const receivingUser = new User();
    await receivingUser.save();
    gift = {
      type: 'subscription',
      subscription: {
        key: subKey,
        uuid: receivingUser._id,
      },
    };

    await paypalPayments.checkoutSuccess({
      user, gift, paymentId, customerId,
    });

    expect(paypalPaymentExecuteStub).to.be.calledOnce;
    expect(paypalPaymentExecuteStub).to.be.calledWith(paymentId, { payer_id: customerId });
    expect(paymentsCreateSubscritionStub).to.be.calledOnce;
    expect(paymentsCreateSubscritionStub).to.be.calledWith({
      user,
      customerId,
      paymentMethod: 'PayPal (Gift)',
      gift,
    });
  });
});
