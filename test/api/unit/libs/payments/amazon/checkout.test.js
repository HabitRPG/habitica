import { model as User } from '../../../../../../website/server/models/user';
import amzLib from '../../../../../../website/server/libs/payments/amazon';
import payments from '../../../../../../website/server/libs/payments/payments';
import common from '../../../../../../website/common';
import apiError from '../../../../../../website/server/libs/apiError';
import * as gems from '../../../../../../website/server/libs/payments/gems';

const { i18n } = common;

describe('Amazon Payments - Checkout', () => {
  const subKey = 'basic_3mo';
  let user; let orderReferenceId; let
    headers; const gemsBlockKey = '21gems'; const gemsBlock = common.content.gems[gemsBlockKey];
  let setOrderReferenceDetailsSpy;
  let confirmOrderReferenceSpy;
  let authorizeSpy;
  let closeOrderReferenceSpy;

  let paymentBuyGemsStub;
  let paymentCreateSubscriptionStub;
  let amount = gemsBlock.price / 100;

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

  beforeEach(() => {
    user = new User();
    headers = {};
    orderReferenceId = 'orderReferenceId';

    setOrderReferenceDetailsSpy = sinon.stub(amzLib, 'setOrderReferenceDetails');
    setOrderReferenceDetailsSpy.resolves({});

    confirmOrderReferenceSpy = sinon.stub(amzLib, 'confirmOrderReference');
    confirmOrderReferenceSpy.resolves({});

    authorizeSpy = sinon.stub(amzLib, 'authorize');
    authorizeSpy.resolves({});

    closeOrderReferenceSpy = sinon.stub(amzLib, 'closeOrderReference');
    closeOrderReferenceSpy.resolves({});

    paymentBuyGemsStub = sinon.stub(payments, 'buyGems');
    paymentBuyGemsStub.resolves({});

    paymentCreateSubscriptionStub = sinon.stub(payments, 'createSubscription');
    paymentCreateSubscriptionStub.resolves({});

    sinon.stub(common, 'uuid').returns('uuid-generated');
    sandbox.stub(gems, 'validateGiftMessage');
  });

  afterEach(() => {
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

    const expectedArgs = {
      user,
      paymentMethod,
      headers,
      sku: undefined,
    };
    if (gift) {
      expectedArgs.gift = gift;
      expectedArgs.gemsBlock = undefined;
      expect(gems.validateGiftMessage).to.be.calledOnce;
      expect(gems.validateGiftMessage).to.be.calledWith(gift, user);
    } else {
      expect(gems.validateGiftMessage).to.not.be.called;
      expectedArgs.gemsBlock = gemsBlock;
    }
    expect(paymentBuyGemsStub).to.be.calledWith(expectedArgs);
  }

  it('should purchase gems', async () => {
    sinon.stub(user, 'canGetGems').resolves(true);
    await amzLib.checkout({
      user, orderReferenceId, headers, gemsBlock: gemsBlockKey,
    });

    expectBuyGemsStub(amzLib.constants.PAYMENT_METHOD);
    expectAmazonStubs();
    expect(user.canGetGems).to.be.calledOnce;
    user.canGetGems.restore();
  });

  it('should error if gem amount is too low', async () => {
    const receivingUser = new User();
    receivingUser.save();
    const gift = {
      type: 'gems',
      gems: {
        amount: 0,
        uuid: receivingUser._id,
      },
    };

    await expect(amzLib.checkout({
      gift, user, orderReferenceId, headers,
    }))
      .to.eventually.be.rejected.and.to.eql({
        httpCode: 400,
        message: 'Amount must be at least 1.',
        name: 'BadRequest',
      });
  });

  it('should error if user cannot get gems gems', async () => {
    sinon.stub(user, 'canGetGems').resolves(false);
    await expect(amzLib.checkout({
      user, orderReferenceId, headers, gemsBlock: gemsBlockKey,
    }))
      .to.eventually.be.rejected.and.to.eql({
        httpCode: 401,
        message: i18n.t('groupPolicyCannotGetGems'),
        name: 'NotAuthorized',
      });
    user.canGetGems.restore();
  });

  it('should error if gems block is not valid', async () => {
    await expect(amzLib.checkout({
      user, orderReferenceId, headers, gemsBlock: 'invalid',
    }))
      .to.eventually.be.rejected.and.to.eql({
        httpCode: 400,
        message: apiError('invalidGemsBlock'),
        name: 'BadRequest',
      });
  });

  it('should gift gems', async () => {
    const receivingUser = new User();
    await receivingUser.save();
    const gift = {
      type: 'gems',
      uuid: receivingUser._id,
      gems: {
        amount: 16,
      },
    };
    amount = 16 / 4;
    await amzLib.checkout({
      gift, user, orderReferenceId, headers,
    });

    expectBuyGemsStub(amzLib.constants.PAYMENT_METHOD_GIFT, gift);
    expectAmazonStubs();
  });

  it('should gift a subscription', async () => {
    const receivingUser = new User();
    receivingUser.save();
    const gift = {
      type: 'subscription',
      subscription: {
        key: subKey,
        uuid: receivingUser._id,
      },
    };
    amount = common.content.subscriptionBlocks[subKey].price;

    await amzLib.checkout({
      user, orderReferenceId, headers, gift,
    });

    gift.member = receivingUser;
    expect(paymentCreateSubscriptionStub).to.be.calledOnce;
    expect(paymentCreateSubscriptionStub).to.be.calledWith({
      user,
      paymentMethod: amzLib.constants.PAYMENT_METHOD_GIFT,
      headers,
      gift,
      gemsBlock: undefined,
      sku: undefined,
    });
    expectAmazonStubs();
  });
});
