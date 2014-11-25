var nconf = require('nconf');
var async = require('async');
var _ = require('lodash');
var logger = require('../../logging');
var moment = require('moment');
var payments = require('./index');

var bitauth = require('bitauth');
var bitpay = require('bitpay');

var Order =  require('./../../models/order').model;

//---------------------------------
// BitPay Module

// the callback signature is (err,client)
function createBitPayClient(cb)
{
  var privkey = bitauth.decrypt(nconf.get('BITPAY:ENCRYPT_KEY'),nconf.get('BITPAY:PRIV_KEY'));
  var client = bitpay.createClient(privkey, {
    config : {
      apiHost : nconf.get('BITPAY:API_HOST'),
      apiPort : nconf.get('BITPAY:API_PORT'),
      forceSSL :nconf.get('BITPAY:FORCE_SSL')
    }
  });

  client.on('error', cb);

  client.on('ready',function(){
    cb(null,client);
  });
}

exports.checkout = function(req, res, next) {
  var isPlan = (req.query.plan !== undefined);

  var order = new Order({
          buyer:req.session.userId,
          dateCreated:new Date(),
          paymentMethod:'BitPay'});

  async.waterfall([
    function (cb) {
      createBitPayClient(cb);
    },
    function (client,cb) {
      var data = {
        price: 5,
        currency: 'USD',
        posData : JSON.stringify({orderId:order.id, uuid: order.buyer, plan:isPlan}),
        //redirectURL : nconf.get('BASE_URL') + '/bitpay/checkout/success?order=' + order.id
        redirectURL : 'http://localhost:3000' + '/bitpay/checkout/success?order=' + order.id
      };

      client.post('invoices',data,cb);
    },
    function (invoice, cb) {
      order.paymentMethodData = invoice.id;
      order.save(function (err, order){
        cb(err,order,invoice)
      });
    }
  ],function (err, order, invoice) {
      if (err) return next(err);
      
      res.send(200,invoice.url);
    }
  );

};

exports.checkoutSuccess = function(req,res,next) {
  // IPN is not used because we have to ensure that the server have a secure ssl connection
  var orderId = req.query.order;

  async.waterfall([
    function (cb){
      Order.findById(orderId,cb);
    },
    function (order,cb)
    {
      createBitPayClient(function (err,client) {
        cb(err, client, order);
      });
    },
    function (client, order,cb){
      var bitpayInvoiceId = order.paymentMethodData;
      client.get('invoices/'+bitpayInvoiceId,function(err, invoice){
        cb(err,invoice,order);
      });
    },
    function (invoice, order,cb){
      if (invoice.status !== 'complete' && invoice.status !== 'confirmed') {
        cb("The bitpay payment have an invalid status : (" + 
          invoice.status + "," + invoice.exStatus + ")");
      } else {
        var habitData = JSON.parse(invoice.posData);
        mongoose.model('User').findById(order.buyer, function(err,user){
          cb(err,user,order,habitData.plan);
        });
      }
    },
    function (user, order, isPlan, cb){
       // TODO do a concurrency check
      if (order.processed)
      {
        // Log but don't crash
        logger.error("The order " + order.id + " has been already processed.");
        return res.redirect('/');
      }
      else
      {
        if (_.isEmpty(user)) return cb("user not found when completing bitpay transaction");
        if (!isPlan)
        {
          payments.buyGems(user, {customerId:order.id, paymentMethod:'BitPay'});
        } else {
          // with bitpay we don't have reccuring payment so we have a month to month subscription
          var startDate = user.dateTerminated;
          payments.createSubscription(user, {customerId: order.id, paymentMethod: 'BitPay'});
          
          if ((!startDate) || startDate < moment())
          {
            startDate = moment();
          }

          user.purchased.plan.dateTerminated =
            moment( startDate.format('MM') + '/' + moment(startDate).format('DD') + '/' + startDate.format('YYYY') )
            .add({months:1})
            .toDate();
        }
        user.save(function(err,user){
          cb(err,user,order);
        });
      }
    },
    function (savedUser,order,cb){
      order.processed = true;
      order.save(cb);
    }
  ],function (err,order)
  {
    if (err) return next(err);
    res.redirect('/');
  });

};
