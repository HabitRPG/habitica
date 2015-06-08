'use strict';

angular.module('habitrpg').factory('Payments',
['$rootScope', 'User', '$http', 'Content',
function($rootScope, User, $http, Content) {
  var Payments = {};
  var isAmazonReady = false;

  window.onAmazonLoginReady = function(){
    isAmazonReady = true;
    amazon.Login.setClientId(window.env.AMAZON_PAYMENTS.CLIENT_ID);
  };

  Payments.showStripe = function(data) {
    var sub =
      data.subscription ? data.subscription
        : data.gift && data.gift.type=='subscription' ? data.gift.subscription.key
        : false;
    sub = sub && Content.subscriptionBlocks[sub];
    var amount = // 500 = $5
      sub ? sub.price*100
        : data.gift && data.gift.type=='gems' ? data.gift.gems.amount/4*100
        : 500;
    StripeCheckout.open({
      key: window.env.STRIPE_PUB_KEY,
      address: false,
      amount: amount,
      name: 'HabitRPG',
      description: sub ? window.env.t('subscribe') : window.env.t('checkout'),
      image: "/apple-touch-icon-144-precomposed.png",
      panelLabel: sub ? window.env.t('subscribe') : window.env.t('checkout'),
      token: function(res) {
        var url = '/stripe/checkout?a=a'; // just so I can concat &x=x below
        if (data.gift) url += '&gift=' + Payments.encodeGift(data.uuid, data.gift);
        if (data.subscription) url += '&sub='+sub.key;
        if (data.coupon) url += '&coupon='+data.coupon;
        $http.post(url, res).success(function() {
          window.location.reload(true);
        }).error(function(res) {
          alert(res.err);
        });
      }
    });
  }

  Payments.showStripeEdit = function(){
    StripeCheckout.open({
      key: window.env.STRIPE_PUB_KEY,
      address: false,
      name: window.env.t('subUpdateTitle'),
      description: window.env.t('subUpdateDescription'),
      panelLabel: window.env.t('subUpdateCard'),
      token: function(data) {
        var url = '/stripe/subscribe/edit';
        $http.post(url, data).success(function() {
          window.location.reload(true);
        }).error(function(data) {
          alert(data.err);
        });
      }
    });
  }

  // Needs to be called everytime the modal/router is accessed
  Payments.initAmazonDonation = function(){
    if(!isAmazonReady) return;

    OffAmazonPayments.Button('AmazonPayButtonDonation', window.env.AMAZON_PAYMENTS.SELLER_ID, {
      type:  'PwA',
      color: 'Gold',
      size:  'small',

      authorization: function(){
        amazon.Login.authorize({
          scope: 'payments:widget',
          popup: true
        }, function(response){
          if(response.error) return alert(response.error);

          var url = '/amazon/verifyAccessToken'
          $http.post(url, response).success(function(){
            console.log(arguments);
          }).error(function(res){
            alert(res.err);
          });
        });
      },

      onError: function(error) {
        console.error('amazon error ', error)
      }
    });
  }

  // Needs to be called everytime the modal/router is accessed
  Payments.initAmazonSubscription = function(){

  }

  Payments.cancelSubscription = function(){
    if (!confirm(window.env.t('sureCancelSub'))) return;
    window.location.href = '/' + User.user.purchased.plan.paymentMethod.toLowerCase() + '/subscribe/cancel?_id=' + User.user._id + '&apiToken=' + User.user.apiToken;
  }

  Payments.encodeGift = function(uuid, gift){
    gift.uuid = uuid;
    return JSON.stringify(gift);
  }

  return Payments;
}]);
