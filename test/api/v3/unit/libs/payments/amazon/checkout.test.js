import { model as User } from '../../../../../../../website/server/models/user';
import amzLib from '../../../../../../../website/server/libs/amazonPayments';
import payments from '../../../../../../../website/server/libs/payments';
import common from '../../../../../../../website/common';

const i18n = common.i18n;

describe('Amazon Payments - Checkout', () => {
  const subKey = 'basic_3mo';
  let user, orderReferenceId, headers;
  let setOrderReferenceDetailsSpy;
  let confirmOrderReferenceSpy;
  let authorizeSpy;
  let closeOrderReferenceSpy;

  let paymentBuyGemsStub;
  let paymentCreateSubscritionStub;
  let amount = 5;

  function expectOrderReferenceSpy () {
    expect(setOrderReferenceDetailsSpy).to.be.calledOnce;
    expect(setOrderReferenceDetailsSpy).to.be.calledWith({
      AmazonOrderReferenceId: orderReferenceId,
      OrderReferenceAttributes: {
        OrderTotal: {
          CurrencyCode: amzLib.constants.CURRENCY_CODE,
          Amount: amount,
        },
        SellerNote: amzLib.constants.SELLER_NOTE,
        SellerOrderAttributes: {
          SellerOrderId: common.uuid(),
          StoreName: amzLib.constants.STORE_NAME,
        },
      },
    });
  }

  function expectAuthorizeSpy () {
    expect(authorizeSpy).to.be.calledOnce;
    expect(authorizeSpy).to.be.calledWith({
      AmazonOrderReferenceId: orderReferenceId,
      AuthorizationReferenceId: common.uuid().substring(0, 32),
      AuthorizationAmount: {
        CurrencyCode: amzLib.constants.CURRENCY_CODE,
        Amount: amount,
      },
      SellerAuthorizationNote: amzLib.constants.SELLER_NOTE,
      TransactionTimeout: 0,
      CaptureNow: true,
    });
  }

  function expectAmazonStubs () {
    expectOrderReferenceSpy();

    expect(confirmOrderReferenceSpy).to.be.calledOnce;
    expect(confirmOrderReferenceSpy).to.be.calledWith({ AmazonOrderReferenceId: orderReferenceId });

    expectAuthorizeSpy();

    expect(closeOrderReferenceSpy).to.be.calledOnce;
    expect(closeOrderReferenceSpy).to.be.calledWith({ AmazonOrderReferenceId: orderReferenceId });
  }

  beforeEach(function () {
    user = new User();
    headers = {};
    orderReferenceId = 'orderReferenceId';

    setOrderReferenceDetailsSpy = sinon.stub(amzLib, 'setOrderReferenceDetails');
    setOrderReferenceDetailsSpy.returnsPromise().resolves({});

    confirmOrderReferenceSpy = sinon.stub(amzLib, 'confirmOrderReference');
    confirmOrderReferenceSpy.returnsPromise().resolves({});

    authorizeSpy = sinon.stub(amzLib, 'authorize');
    authorizeSpy.returnsPromise().resolves({});

    closeOrderReferenceSpy = sinon.stub(amzLib, 'closeOrderReference');
    closeOrderReferenceSpy.returnsPromise().resolves({});

    paymentBuyGemsStub = sinon.stub(payments, 'buyGems');
    paymentBuyGemsStub.returnsPromise().resolves({});

    paymentCreateSubscritionStub = sinon.stub(payments, 'createSubscription');
    paymentCreateSubscritionStub.returnsPromise().resolves({});

    sinon.stub(common, 'uuid').returns('uuid-generated');
  });

  afterEach(function () {
    amzLib.setOrderReferenceDetails.restore();
    amzLib.confirmOrderReference.restore();
    amzLib.authorize.restore();
    amzLib.closeOrderReference.restore();
    payments.buyGems.restore();
    payments.createSubscription.restore();
    common.uuid.restore();
  });

  function expectBuyGemsStub (paymentMethod, gift) {
    expect(paymentBuyGemsStub).to.be.calledOnce;

    let expectedArgs = {
      user,
      paymentMethod,
      headers,
    };
    if (gift) expectedArgs.gift = gift;
    expect(paymentBuyGemsStub).to.be.calledWith(expectedArgs);
  }

  it('should purchase gems', async () => {
    sinon.stub(user, 'canGetGems').returnsPromise().resolves(true);
    await amzLib.checkout({user, orderReferenceId, headers});

    expectBuyGemsStub(amzLib.constants.PAYMENT_METHOD);
    expectAmazonStubs();
    expect(user.canGetGems).to.be.calledOnce;
    user.canGetGems.restore();
  });

  it('should error if gem amount is too low', async () => {
    let receivingUser = new User();
    receivingUser.save();
    let gift = {
      type: 'gems',
      gems: {
        amount: 0,
        uuid: receivingUser._id,
      },
    };

    await expect(amzLib.checkout({gift, user, orderReferenceId, headers}))
    .to.eventually.be.rejected.and.to.eql({
      httpCode: 400,
      message: 'Amount must be at least 1.',
      name: 'BadRequest',
    });
  });

  it('should error if user cannot get gems gems', async () => {
    sinon.stub(user, 'canGetGems').returnsPromise().resolves(false);
    await expect(amzLib.checkout({user, orderReferenceId, headers})).to.eventually.be.rejected.and.to.eql({
      httpCode: 401,
      message: i18n.t('groupPolicyCannotGetGems'),
      name: 'NotAuthorized',
    });
    user.canGetGems.restore();
  });

  it('should gift gems', async () => {
    let receivingUser = new User();
    await receivingUser.save();
    let gift = {
      type: 'gems',
      uuid: receivingUser._id,
      gems: {
        amount: 16,
      },
    };
    amount = 16 / 4;
    await amzLib.checkout({gift, user, orderReferenceId, headers});

    expectBuyGemsStub(amzLib.constants.PAYMENT_METHOD_GIFT, gift);
    expectAmazonStubs();
  });

  it('should gift a subscription', async () => {
    let receivingUser = new User();
    receivingUser.save();
    let gift = {
      type: 'subscription',
      subscription: {
        key: subKey,
        uuid: receivingUser._id,
      },
    };
    amount = common.content.subscriptionBlocks[subKey].price;

    await amzLib.checkout({user, orderReferenceId, headers, gift});

    gift.member = receivingUser;
    expect(paymentCreateSubscritionStub).to.be.calledOnce;
    expect(paymentCreateSubscritionStub).to.be.calledWith({
      user,
      paymentMethod: amzLib.constants.PAYMENT_METHOD_GIFT,
      headers,
      gift,
    });
    expectAmazonStubs();
  });
});
