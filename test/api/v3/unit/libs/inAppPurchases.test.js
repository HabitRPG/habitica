import { model as User } from '../../../../../website/server/models/user';
import requireAgain from 'require-again';
import iapLibrary from 'in-app-purchase';

describe.only('In App Purchases', () => {
  let user;
  let pathToIAP = '../../../../../website/server/libs/api-v3/inAppPurchases';
  let iap;
  let setupSpy;
  let validateSpy;
  let isValidatedSpy;

  beforeEach(() => {
    user = new User();
    setupSpy = sinon.spy();
    validateSpy = sinon.spy();
    isValidatedSpy = sinon.spy();

    sandbox.stub(iapLibrary, 'setup').returns((err) => setupSpy(err));
    sandbox.stub(iapLibrary, 'validate').returns((err) => validateSpy(err));
    sandbox.stub(iapLibrary, 'isValidated').returns(isValidatedSpy);

    iap = requireAgain(pathToIAP);
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('Android', () => {
    it('applies new valid receipt', async () => {
      await iap.iapAndroidVerify(user, {
        receipt: {token: 1},
      });

      expect(setupSpy).to.have.been.called;
      expect(validateSpy).to.have.been.called;
      expect(isValidatedSpy).to.have.been.called;
    });
  });
});
