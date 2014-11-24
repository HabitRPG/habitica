var iap = require('in-app-purchase');
var async = require('async');
var payments = require('./index');

exports.androidVerify = function(req, res, next) {
  console.info(req.body);
  
  var token = req.body.id;
  var user = res.locals.user;

iap.setup(function (error) {
    if (error) {
        console.error('something went wrong...');
        console.error(error);
        
        return;
    }
    /*
        google receipt must be provided as an object
        {
            "data": "{stringified data object}",
            "signature": "signature from google"
        }
    */
    // iap is ready
    /*iap.validate(iap.GOOGLE, googleReceipt, function (err, googleRes) {
        if (err) {
            return console.error(err);
        }
        if (iap.isValidated(googleRes)) {
            // yay good!
        }
    });*/
});

/*
  async.waterfall([
    function(response, cb) {
      payments.buyGems(user, {customerId: response.id, paymentMethod: 'IAP'});
      
      user.save(cb);
    }
  ], function(err, saved){
    if (err) return res.send(500, err.toString()); // don't json this, let toString() handle errors
    res.send(200);
    user = token = null;
  });*/
};

exports.iosVerify = function(req, res, next) {
  console.info(req.body);
  
  var token = req.body.id;
  var user = res.locals.user;
};