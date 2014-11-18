var nconf = require('nconf');
var async = require('async');
var payments = require('./index');
var bitauth = require('bitauth');
var bitpay = require('bitpay');


//---------------------------------
// BitPay Module

api.bitpayCheckout = function(req, res, next) {
  async.waterfall([
    function (cb) {
      var privkey = bitauth.decrypt(nconf.get('BITPAY_ENCRYPT_PASSWORD'),nconf.get('BITPAY_KEY'));
      var client = bitpay.createClient(privkey, {
        config : {
          apiHost : nconf.get('BITPAY_API_HOST'),
          apiPort : nconf.get('BITPAY_API_PORT'),
          forceSSL :nconf.get('BITPAY_FORCE_SSL')
        }
      });

      client.on('error', function(err){
        console.log(err);
      });

      client.on('ready', function(){
        var data = {
          price: 5,
          currency: 'USD',
          posData : JSON.stringify({uuid: res.locals.user._id}),
          redirectURL : nconf.get('BASE_URL') + '/bitpay/checkout/success?uuid=' + res.locals.user._id
        };

        client.post('invoices',data,function(err, invoice){
            if (!err){
              res.send(200,invoice.url);
            }
        })
      });
    }
  ]);

};

api.bitpayCheckoutSuccess = function(req,res,next) {
  // TODO implement the case of sucess
};
