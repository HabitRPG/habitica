import {
  generateGroup,
} from '../../../../../helpers/api-unit.helper';
import { model as User } from '../../../../../../website/server/models/user';
import { model as Group } from '../../../../../../website/server/models/group';
import amzLib from '../../../../../../website/server/libs/payments/amazon';
import payments from '../../../../../../website/server/libs/payments/payments';
import common from '../../../../../../website/common';

describe('#upgradeGroupPlan', () => {
  let spy; let data; let user; let group; let
    uuidString;

  beforeEach(async () => {
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
      privacy: 'private',
      leader: user._id,
    });
    await group.save();

    user.guilds.push(group._id);
    await user.save();

    spy = sinon.stub(amzLib, 'authorizeOnBillingAgreement');
    spy.resolves([]);

    uuidString = 'uuid-v4';
    sinon.stub(common, 'uuid').returns(uuidString);

    data.groupId = group._id;
    data.sub.quantity = 3;
  });

  afterEach(() => {
    amzLib.authorizeOnBillingAgreement.restore();
    common.uuid.restore();
  });

  it('charges for a new member', async () => {
    data.paymentMethod = amzLib.constants.PAYMENT_METHOD;
    await payments.createSubscription(data);

    const updatedGroup = await Group.findById(group._id).exec();

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
