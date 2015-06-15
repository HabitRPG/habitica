'use strict'

app = require('../../website/src/server')
rewire = require('rewire')
sinon = require('sinon')
inApp = rewire('../../website/src/controllers/payments/iap')
iapMock = { }
inApp.__set__('iap', iapMock)

describe 'In-App Purchases', ->
  describe 'Android', ->
    req = {
      body: {
        transaction: {
          reciept: 'foo'
          signature: 'sig'
        }
      }
    }
    res = {
      locals: { user: { _id: 'user' } }
      json: sinon.spy()
    }
    next = -> true
    paymentSpy = sinon.spy()

    before ->
      inApp.__set__('payments.buyGems', paymentSpy)

    afterEach ->
      paymentSpy.reset()
      res.json.reset()

    context 'successful app purchase', ->
      before ->
        iapMock.setup = (cb)-> return cb(null)
        iapMock.validate = (iapGoogle, iapBodyReciept, cb)-> return cb(null, true)
        iapMock.isValidated = (googleRes)-> return googleRes
        iapMock.GOOGLE = 'google'

      it 'calls res.json with succesful result object', ->
        expectedResObj = {
          ok: true
          data: true
        }

        inApp.androidVerify(req, res, next)

        expect(res.json).to.be.calledOnce
        expect(res.json).to.be.calledWith(expectedResObj)

      it 'calls payments.buyGems function', ->
        inApp.androidVerify(req, res, next)

        expect(paymentSpy).to.be.calledOnce
        expect(paymentSpy).to.be.calledWith({user: res.locals.user, paymentMethod:'IAP GooglePlay'})

    context 'error in setup', ->
      before ->
        iapMock.setup = (cb)-> return cb("error in setup")

      it 'calls res.json with setup error object', ->
        expectedResObj = {
          ok: false
          data: 'IAP Error'
        }

        inApp.androidVerify(req, res, next)

        expect(res.json).to.be.calledOnce
        expect(res.json).to.be.calledWith(expectedResObj)

      it 'does not calls payments.buyGems function', ->
        inApp.androidVerify(req, res, next)

        expect(paymentSpy).to.not.be.called

    context 'error in validation', ->
      before ->
        iapMock.setup = (cb)-> return cb(null)
        iapMock.validate = (iapGoogle, iapBodyReciept, cb)-> return cb('error in validation', true)

      it 'calls res.json with validation error object', ->
        expectedResObj = {
          ok: false
          data: {
            code: 6778001
            message: 'error in validation'
          }
        }

        inApp.androidVerify(req, res, next)

        expect(res.json).to.be.calledOnce
        expect(res.json).to.be.calledWith(expectedResObj)

      it 'does not calls payments.buyGems function', ->
        inApp.androidVerify(req, res, next)

        expect(paymentSpy).to.not.be.called

    context 'iap is not valid', ->
      before ->
        iapMock.setup = (cb)-> return cb(null)
        iapMock.validate = (iapGoogle, iapBodyReciept, cb)-> return cb(null, false)
        iapMock.isValidated = (googleRes)-> return googleRes

      it 'does not call res.json', ->
        inApp.androidVerify(req, res, next)

        expect(res.json).to.not.be.called

      it 'does not calls payments.buyGems function', ->
        inApp.androidVerify(req, res, next)

        expect(paymentSpy).to.not.be.called

  describe 'iOS', ->
    req = { body: { transaction: { reciept: 'foo' } } }
    res = {
      locals: { user: { _id: 'user' } }
      json: sinon.spy()
    }
    next = -> true
    paymentSpy = sinon.spy()

    before ->
      inApp.__set__('payments.buyGems', paymentSpy)

    afterEach ->
      paymentSpy.reset()
      res.json.reset()

    context 'successful app purchase', ->
      before ->
        iapMock.setup = (cb)-> return cb(null)
        iapMock.validate = (iapApple, iapBodyReciept, cb)-> return cb(null, true)
        iapMock.isValidated = (appleRes)-> return appleRes
        iapMock.getPurchaseData = (appleRes)->
          return [{ productId: 'com.habitrpg.ios.Habitica.20gems' }]
        iapMock.APPLE = 'apple'

      it 'calls res.json with succesful result object', ->
        expectedResObj = {
          ok: true
          data: true
        }

        inApp.iosVerify(req, res, next)

        expect(res.json).to.be.calledOnce
        expect(res.json).to.be.calledWith(expectedResObj)

      it 'calls payments.buyGems function', ->
        inApp.iosVerify(req, res, next)

        expect(paymentSpy).to.be.calledOnce
        expect(paymentSpy).to.be.calledWith({user: res.locals.user, paymentMethod:'IAP AppleStore'})

    context 'error in setup', ->
      before ->
        iapMock.setup = (cb)-> return cb("error in setup")

      it 'calls res.json with setup error object', ->
        expectedResObj = {
          ok: false
          data: 'IAP Error'
        }

        inApp.iosVerify(req, res, next)

        expect(res.json).to.be.calledOnce
        expect(res.json).to.be.calledWith(expectedResObj)

      it 'does not calls payments.buyGems function', ->
        inApp.iosVerify(req, res, next)

        expect(paymentSpy).to.not.be.called

    context 'error in validation', ->
      before ->
        iapMock.setup = (cb)-> return cb(null)
        iapMock.validate = (iapApple, iapBodyReciept, cb)-> return cb('error in validation', true)

      it 'calls res.json with validation error object', ->
        expectedResObj = {
          ok: false
          data: {
            code: 6778001
            message: 'error in validation'
          }
        }

        inApp.iosVerify(req, res, next)

        expect(res.json).to.be.calledOnce
        expect(res.json).to.be.calledWith(expectedResObj)

      it 'does not calls payments.buyGems function', ->
        inApp.iosVerify(req, res, next)

        expect(paymentSpy).to.not.be.called

    context 'iap is not valid', ->
      before ->
        iapMock.setup = (cb)-> return cb(null)
        iapMock.validate = (iapApple, iapBodyReciept, cb)-> return cb(null, false)
        iapMock.isValidated = (appleRes)-> return appleRes

      it 'does not call res.json', ->
        inApp.iosVerify(req, res, next)
        expectedResObj = {
          ok: false
          data: {
            code: 6778001
            message: 'Invalid receipt'
          }
        }
        expect(res.json).to.be.calledOnce
        expect(res.json).to.be.calledWith(expectedResObj)

      it 'does not calls payments.buyGems function', ->
        inApp.iosVerify(req, res, next)

        expect(paymentSpy).to.not.be.called

    context 'iap is valid but has no purchaseDataList', ->
      before ->
        iapMock.setup = (cb)-> return cb(null)
        iapMock.validate = (iapApple, iapBodyReciept, cb)-> return cb(null, true)
        iapMock.isValidated = (appleRes)-> return appleRes
        iapMock.getPurchaseData = (appleRes)->
          return []
        iapMock.APPLE = 'apple'

      it 'calls res.json with succesful result object', ->
        expectedResObj = {
          ok: false
          data: {
            code: 6778001
            message: 'Incorrect receipt content'
          }
        }

        inApp.iosVerify(req, res, next)

        expect(res.json).to.be.calledOnce
        expect(res.json).to.be.calledWith(expectedResObj)

      it 'does not calls payments.buyGems function', ->
        inApp.iosVerify(req, res, next)

        expect(paymentSpy).to.not.be.called

    context 'iap is valid, has purchaseDataList, but productId does not match', ->
      before ->
        iapMock.setup = (cb)-> return cb(null)
        iapMock.validate = (iapApple, iapBodyReciept, cb)-> return cb(null, true)
        iapMock.isValidated = (appleRes)-> return appleRes
        iapMock.getPurchaseData = (appleRes)->
          return [{ productId: 'com.another.company' }]
        iapMock.APPLE = 'apple'

      it 'calls res.json with incorrect reciept obj', ->
        expectedResObj = {
          ok: false
          data: {
            code: 6778001
            message: 'Incorrect receipt content'
          }
        }

        inApp.iosVerify(req, res, next)

        expect(res.json).to.be.calledOnce
        expect(res.json).to.be.calledWith(expectedResObj)

      it 'does not calls payments.buyGems function', ->
        inApp.iosVerify(req, res, next)

        expect(paymentSpy).to.not.be.called
