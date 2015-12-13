var app, iapMock, inApp, rewire, sinon;

app = require('../../website/src/server');

rewire = require('rewire');

sinon = require('sinon');

inApp = rewire('../../website/src/controllers/payments/iap');

iapMock = {};

inApp.__set__('iap', iapMock);

describe('In-App Purchases', function() {
  describe('Android', function() {
    var next, paymentSpy, req, res;
    req = {
      body: {
        transaction: {
          reciept: 'foo',
          signature: 'sig'
        }
      }
    };
    res = {
      locals: {
        user: {
          _id: 'user'
        }
      },
      json: sinon.spy()
    };
    next = function() {
      return true;
    };
    paymentSpy = sinon.spy();
    before(function() {
      return inApp.__set__('payments.buyGems', paymentSpy);
    });
    afterEach(function() {
      paymentSpy.reset();
      return res.json.reset();
    });
    context('successful app purchase', function() {
      before(function() {
        iapMock.setup = function(cb) {
          return cb(null);
        };
        iapMock.validate = function(iapGoogle, iapBodyReciept, cb) {
          return cb(null, true);
        };
        iapMock.isValidated = function(googleRes) {
          return googleRes;
        };
        return iapMock.GOOGLE = 'google';
      });
      it('calls res.json with succesful result object', function() {
        var expectedResObj;
        expectedResObj = {
          ok: true,
          data: true
        };
        inApp.androidVerify(req, res, next);
        expect(res.json).to.be.calledOnce;
        return expect(res.json).to.be.calledWith(expectedResObj);
      });
      return it('calls payments.buyGems function', function() {
        inApp.androidVerify(req, res, next);
        expect(paymentSpy).to.be.calledOnce;
        return expect(paymentSpy).to.be.calledWith({
          user: res.locals.user,
          paymentMethod: 'IAP GooglePlay',
          amount: 5.25
        });
      });
    });
    context('error in setup', function() {
      before(function() {
        return iapMock.setup = function(cb) {
          return cb("error in setup");
        };
      });
      it('calls res.json with setup error object', function() {
        var expectedResObj;
        expectedResObj = {
          ok: false,
          data: 'IAP Error'
        };
        inApp.androidVerify(req, res, next);
        expect(res.json).to.be.calledOnce;
        return expect(res.json).to.be.calledWith(expectedResObj);
      });
      return it('does not calls payments.buyGems function', function() {
        inApp.androidVerify(req, res, next);
        return expect(paymentSpy).to.not.be.called;
      });
    });
    context('error in validation', function() {
      before(function() {
        iapMock.setup = function(cb) {
          return cb(null);
        };
        return iapMock.validate = function(iapGoogle, iapBodyReciept, cb) {
          return cb('error in validation', true);
        };
      });
      it('calls res.json with validation error object', function() {
        var expectedResObj;
        expectedResObj = {
          ok: false,
          data: {
            code: 6778001,
            message: 'error in validation'
          }
        };
        inApp.androidVerify(req, res, next);
        expect(res.json).to.be.calledOnce;
        return expect(res.json).to.be.calledWith(expectedResObj);
      });
      return it('does not calls payments.buyGems function', function() {
        inApp.androidVerify(req, res, next);
        return expect(paymentSpy).to.not.be.called;
      });
    });
    return context('iap is not valid', function() {
      before(function() {
        iapMock.setup = function(cb) {
          return cb(null);
        };
        iapMock.validate = function(iapGoogle, iapBodyReciept, cb) {
          return cb(null, false);
        };
        return iapMock.isValidated = function(googleRes) {
          return googleRes;
        };
      });
      it('does not call res.json', function() {
        inApp.androidVerify(req, res, next);
        return expect(res.json).to.not.be.called;
      });
      return it('does not calls payments.buyGems function', function() {
        inApp.androidVerify(req, res, next);
        return expect(paymentSpy).to.not.be.called;
      });
    });
  });
  return describe('iOS', function() {
    var next, paymentSpy, req, res;
    req = {
      body: {
        transaction: {
          reciept: 'foo'
        }
      }
    };
    res = {
      locals: {
        user: {
          _id: 'user'
        }
      },
      json: sinon.spy()
    };
    next = function() {
      return true;
    };
    paymentSpy = sinon.spy();
    before(function() {
      return inApp.__set__('payments.buyGems', paymentSpy);
    });
    afterEach(function() {
      paymentSpy.reset();
      return res.json.reset();
    });
    context('successful app purchase', function() {
      before(function() {
        iapMock.setup = function(cb) {
          return cb(null);
        };
        iapMock.validate = function(iapApple, iapBodyReciept, cb) {
          return cb(null, true);
        };
        iapMock.isValidated = function(appleRes) {
          return appleRes;
        };
        iapMock.getPurchaseData = function(appleRes) {
          return [
            {
              productId: 'com.habitrpg.ios.Habitica.20gems'
            }
          ];
        };
        return iapMock.APPLE = 'apple';
      });
      it('calls res.json with succesful result object', function() {
        var expectedResObj;
        expectedResObj = {
          ok: true,
          data: true
        };
        inApp.iosVerify(req, res, next);
        expect(res.json).to.be.calledOnce;
        return expect(res.json).to.be.calledWith(expectedResObj);
      });
      return it('calls payments.buyGems function', function() {
        inApp.iosVerify(req, res, next);
        expect(paymentSpy).to.be.calledOnce;
        return expect(paymentSpy).to.be.calledWith({
          user: res.locals.user,
          paymentMethod: 'IAP AppleStore',
          amount: 5.25
        });
      });
    });
    context('error in setup', function() {
      before(function() {
        return iapMock.setup = function(cb) {
          return cb("error in setup");
        };
      });
      it('calls res.json with setup error object', function() {
        var expectedResObj;
        expectedResObj = {
          ok: false,
          data: 'IAP Error'
        };
        inApp.iosVerify(req, res, next);
        expect(res.json).to.be.calledOnce;
        return expect(res.json).to.be.calledWith(expectedResObj);
      });
      return it('does not calls payments.buyGems function', function() {
        inApp.iosVerify(req, res, next);
        return expect(paymentSpy).to.not.be.called;
      });
    });
    context('error in validation', function() {
      before(function() {
        iapMock.setup = function(cb) {
          return cb(null);
        };
        return iapMock.validate = function(iapApple, iapBodyReciept, cb) {
          return cb('error in validation', true);
        };
      });
      it('calls res.json with validation error object', function() {
        var expectedResObj;
        expectedResObj = {
          ok: false,
          data: {
            code: 6778001,
            message: 'error in validation'
          }
        };
        inApp.iosVerify(req, res, next);
        expect(res.json).to.be.calledOnce;
        return expect(res.json).to.be.calledWith(expectedResObj);
      });
      return it('does not calls payments.buyGems function', function() {
        inApp.iosVerify(req, res, next);
        return expect(paymentSpy).to.not.be.called;
      });
    });
    context('iap is not valid', function() {
      before(function() {
        iapMock.setup = function(cb) {
          return cb(null);
        };
        iapMock.validate = function(iapApple, iapBodyReciept, cb) {
          return cb(null, false);
        };
        return iapMock.isValidated = function(appleRes) {
          return appleRes;
        };
      });
      it('does not call res.json', function() {
        var expectedResObj;
        inApp.iosVerify(req, res, next);
        expectedResObj = {
          ok: false,
          data: {
            code: 6778001,
            message: 'Invalid receipt'
          }
        };
        expect(res.json).to.be.calledOnce;
        return expect(res.json).to.be.calledWith(expectedResObj);
      });
      return it('does not calls payments.buyGems function', function() {
        inApp.iosVerify(req, res, next);
        return expect(paymentSpy).to.not.be.called;
      });
    });
    context('iap is valid but has no purchaseDataList', function() {
      before(function() {
        iapMock.setup = function(cb) {
          return cb(null);
        };
        iapMock.validate = function(iapApple, iapBodyReciept, cb) {
          return cb(null, true);
        };
        iapMock.isValidated = function(appleRes) {
          return appleRes;
        };
        iapMock.getPurchaseData = function(appleRes) {
          return [];
        };
        return iapMock.APPLE = 'apple';
      });
      it('calls res.json with succesful result object', function() {
        var expectedResObj;
        expectedResObj = {
          ok: false,
          data: {
            code: 6778001,
            message: 'Incorrect receipt content'
          }
        };
        inApp.iosVerify(req, res, next);
        expect(res.json).to.be.calledOnce;
        return expect(res.json).to.be.calledWith(expectedResObj);
      });
      return it('does not calls payments.buyGems function', function() {
        inApp.iosVerify(req, res, next);
        return expect(paymentSpy).to.not.be.called;
      });
    });
    return context('iap is valid, has purchaseDataList, but productId does not match', function() {
      before(function() {
        iapMock.setup = function(cb) {
          return cb(null);
        };
        iapMock.validate = function(iapApple, iapBodyReciept, cb) {
          return cb(null, true);
        };
        iapMock.isValidated = function(appleRes) {
          return appleRes;
        };
        iapMock.getPurchaseData = function(appleRes) {
          return [
            {
              productId: 'com.another.company'
            }
          ];
        };
        return iapMock.APPLE = 'apple';
      });
      it('calls res.json with incorrect reciept obj', function() {
        var expectedResObj;
        expectedResObj = {
          ok: false,
          data: {
            code: 6778001,
            message: 'Incorrect receipt content'
          }
        };
        inApp.iosVerify(req, res, next);
        expect(res.json).to.be.calledOnce;
        return expect(res.json).to.be.calledWith(expectedResObj);
      });
      return it('does not calls payments.buyGems function', function() {
        inApp.iosVerify(req, res, next);
        return expect(paymentSpy).to.not.be.called;
      });
    });
  });
});
