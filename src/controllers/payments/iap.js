var iap = require('in-app-purchase');
var async = require('async');
var payments = require('./index');
var nconf = require('nconf');

var inAppPurchase = require('in-app-purchase');
inAppPurchase.config({
    googlePublicKeyPath: nconf.get("IAP_GOOGLE_KEYDIR") // this is the path to the directory containing iap-sanbox/iap-live files
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
    
        console.error('IAP Setup ERROR');
        console.error(error);
        
        res.json(resObj);
        
        return;
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
         
          res.json(resObj);
          console.error(err);
          return;
        }
        if (iap.isValidated(googleRes)) {
            var resObj = {
              ok: true,
              data: googleRes
            };
            
             payments.buyGems(user, {customerId:user.id, paymentMethod:'IAP GooglePlay'});
            user.save();
            
            // yay good!
            res.json(resObj);
        }
    });
});
};

exports.iosVerify = function(req, res, next) {
  console.info(req.body);
  
  var iapBody = req.body;
  var user = res.locals.user;

  iap.setup(function (error) {
    if (error) {
        var resObj = {
          ok: false,
          data: 'IAP Error'
        };
    
        console.error('IAP Setup ERROR');
        console.error(error);
        
        res.json(resObj);
        
        return;
    }
    
    // iap is ready
    iap.validate(iap.APPLE, iapBody.transaction.receipt, function (err, appleRes) {
        if (err) {
          var resObj = {
            ok: false,
            data: {
              code: INVALID_PAYLOAD,
              message: err.toString()
            }
          };
         
          res.json(resObj);
          console.error(err);
          return;
        }
        if (iap.isValidated(appleRes)) {
            var resObj = {
              ok: true,
              data: appleRes
            };
            
             payments.buyGems(user, {customerId:user.id, paymentMethod:'IAP AppleStore'});
            user.save();
            
            // yay good!
            res.json(resObj);
        }
    });
});
};