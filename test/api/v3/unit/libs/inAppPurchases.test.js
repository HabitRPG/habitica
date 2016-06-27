import { model as User } from '../../../../../website/server/models/user';
import iapLibrary from 'in-app-purchase';
import iap from '../../../../../website/server/libs/api-v3/inAppPurchases';

describe.only('In App Purchases', () => {
  let user;

  beforeEach(() => {
    user = new User();

    sandbox.stub(iapLibrary, 'setup').yields();
    sandbox.stub(iapLibrary, 'validate').yields();
    sandbox.stub(iapLibrary, 'isValidated').yields();
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('Android', () => {
    it('applies new valid receipt', async () => {
      let res = await iap.iapAndroidVerify(user, {
        receipt: {token: 1},
      });

      console.log(res);
    });

    it('example with stub yielding an error', async () => {
      iapLibrary.setup.yields(new Error('an error'));

      let res = await iap.iapAndroidVerify(user, {
        receipt: {token: 1},
      });

      console.log(res);
    });
  });
});
