var iap = require('in-app-purchase');
var async = require('async');
var payments = require('./index');
var nconf = require('nconf');

var inAppPurchase = require('in-app-purchase');
inAppPurchase.config({
  // this is the path to the directory containing iap-sanbox/iap-live files
  googlePublicKeyPath: nconf.get('IAP_GOOGLE_KEYDIR')
});

// Validation ERROR Codes
var INVALID_PAYLOAD   = 6778001;
var CONNECTION_FAILED = 6778002;
var PURCHASE_EXPIRED  = 6778003;

exports.androidVerify = function(req, res, next) {
  var iapBody = req.body;
  var user = res.locals.user;

  iap.setup(function (error) {
    if (error) {
      var resObj = {
        ok: false,
        data: 'IAP Error'
      };

      return res.json(resObj);

    }

    /*
      google receipt must be provided as an object
      {
        "data": "{stringified data object}",
        "signature": "signature from google"
        }
    */
    var testObj = {
      data: iapBody.transaction.receipt,
      signature: iapBody.transaction.signature
    };

    // iap is ready
    iap.validate(iap.GOOGLE, testObj, function (err, googleRes) {
      if (err) {
        var resObj = {
          ok: false,
          data: {
            code: INVALID_PAYLOAD,
            message: err.toString()
          }
        };

        return res.json(resObj);
      }

      if (iap.isValidated(googleRes)) {
        var resObj = {
          ok: true,
          data: googleRes
        };

        payments.buyGems({user:user, paymentMethod:'IAP GooglePlay'});

        return res.json(resObj);
      }
    });
  });
};

exports.iosVerify = function(req, res, next) {
  var iapBody = req.body;
  var user = res.locals.user;

  iap.setup(function (error) {
    if (error) {
      var resObj = {
        ok: false,
        data: 'IAP Error'
      };

      return res.json(resObj);

    }

    //iap is ready
    iap.validate(iap.APPLE, iapBody.transaction.receipt, function (err, appleRes) {
      if (err) {
        var resObj = {
          ok: false,
          data: {
            code: INVALID_PAYLOAD,
            message: err.toString()
          }
        };

        return res.json(resObj);
      }

      if (iap.isValidated(appleRes)) {
        var purchaseDataList = iap.getPurchaseData(appleRes);
        if (purchaseDataList.length > 0) {
          if (purchaseDataList[0].productId === 'com.habitrpg.ios.Habitica.20gems') {
            //Correct receipt
            payments.buyGems({user:user, paymentMethod:'IAP AppleStore'});
            var resObj = {
              ok: true,
              data: appleRes
            };
            // yay good!
            return res.json(resObj);
          }
        }
        //wrong receipt content
        var resObj = {
          ok: false,
          data: {
            code: INVALID_PAYLOAD,
            message: 'Incorrect receipt content'
          }
        };
        return res.json(resObj);
      }
      //invalid receipt
      var resObj = {
        ok: false,
        data: {
          code: INVALID_PAYLOAD,
          message: 'Invalid receipt'
        }
      };

      return res.json(resObj);
    });
  });
};
