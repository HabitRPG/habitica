import { model as User } from '../../../../../website/server/models/user';
import iapLibrary from 'in-app-purchase';
import iap from '../../../../../website/server/libs/api-v3/inAppPurchases';

describe('In App Purchases', () => {
  let user;
  let setupSpy;
  let validateSpy;

  beforeEach(() => {
    user = new User();
    setupSpy = sinon.spy();
    validateSpy = sinon.spy();

    sandbox.stub(iapLibrary, 'setup').yields();
    sandbox.stub(iapLibrary, 'validate').yields();
    sandbox.stub(iapLibrary, 'isValidated').returns();
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('Android', () => {
    it('applies new valid receipt', async () => {
      iapLibrary.setup.yields(undefined, setupSpy);

      await iap.iapAndroidVerify(user, {
        receipt: {token: 1},
      });

      expect(setupSpy).to.have.been.called;
      expect(validateSpy).to.have.been.called;
    });

    it('example with stub yielding an error', async () => {
      iapLibrary.setup.yields(new Error('an error'));

      await iap.iapAndroidVerify(user, {
        receipt: {token: 1},
      });
    });
  });
});
