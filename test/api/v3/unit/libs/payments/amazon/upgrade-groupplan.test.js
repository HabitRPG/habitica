import uuid from 'uuid';

import {
  generateGroup,
} from '../../../../../../helpers/api-unit.helper.js';
import { model as User } from '../../../../../../../website/server/models/user';
import { model as Group } from '../../../../../../../website/server/models/group';
import amzLib from '../../../../../../../website/server/libs/amazonPayments';
import payments from '../../../../../../../website/server/libs/payments';

describe('#upgradeGroupPlan', () => {
  let spy, data, user, group, uuidString;

  beforeEach(async function () {
    user = new User();
    user.profile.name = 'sender';

    data = {
      user,
      sub: {
        key: 'basic_3mo', // @TODO: Validate that this is group
      },
      customerId: 'customer-id',
      paymentMethod: 'Payment Method',
      headers: {
        'x-client': 'habitica-web',
        'user-agent': '',
      },
    };

    group = generateGroup({
      name: 'test group',
      type: 'guild',
      privacy: 'public',
      leader: user._id,
    });
    await group.save();

    spy = sinon.stub(amzLib, 'authorizeOnBillingAgreement');
    spy.returnsPromise().resolves([]);

    uuidString = 'uuid-v4';
    sinon.stub(uuid, 'v4').returns(uuidString);

    data.groupId = group._id;
    data.sub.quantity = 3;
  });

  afterEach(function () {
    sinon.restore(amzLib.authorizeOnBillingAgreement);
    uuid.v4.restore();
  });

  it('charges for a new member', async () => {
    data.paymentMethod = amzLib.constants.PAYMENT_METHOD;
    await payments.createSubscription(data);

    let updatedGroup = await Group.findById(group._id).exec();

    updatedGroup.memberCount += 1;
    await updatedGroup.save();

    await amzLib.chargeForAdditionalGroupMember(updatedGroup);

    expect(spy.calledOnce).to.be.true;
    expect(spy).to.be.calledWith({
      AmazonBillingAgreementId: updatedGroup.purchased.plan.customerId,
      AuthorizationReferenceId: uuidString.substring(0, 32),
      AuthorizationAmount: {
        CurrencyCode: amzLib.constants.CURRENCY_CODE,
        Amount: 3,
      },
      SellerAuthorizationNote: amzLib.constants.SELLER_NOTE_GROUP_NEW_MEMBER,
      TransactionTimeout: 0,
      CaptureNow: true,
      SellerNote: amzLib.constants.SELLER_NOTE_GROUP_NEW_MEMBER,
      SellerOrderAttributes: {
        SellerOrderId: uuidString,
        StoreName: amzLib.constants.STORE_NAME,
      },
    });
  });
});
