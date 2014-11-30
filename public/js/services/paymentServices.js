'use strict';

angular.module('paymentServices',[]).factory('Payments',
['$rootScope', 'User', '$http', 'Content',
function($rootScope, User, $http, Content) {
  var user = User.user;
  var plan = User.user.purchased.plan;
  var Payments = {};

  Payments.currentSub = _.find(Content.subscriptionBlocks, function(b){
    switch (plan.paymentMethod) {
      case 'Stripe':
        return b.key == plan.planId;
      case 'Paypal':
        return b.paypalKey == plan.planId;
      default: return undefined;
    }
  })

  Payments.showStripe = function(data) {
    var sub =
      data.subscription ? data.subscription
        : data.gift && data.gift.type=='subscription' ? data.gift.subscription.months
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
      name: sub ? window.env.t('subscribe') : window.env.t('checkout'),
      description: sub ? window.env.t('buySubsText') : window.env.t('donationDesc'),
      panelLabel: sub ? window.env.t('subscribe') : window.env.t('checkout'),
      token: function(res) {
        var url = '/stripe/checkout?a=a'; // just so I can concat &x=x below
        if (data.gift) url += '&gift=' + $rootScope.encodeGift(data.uuid, data.gift);
        if (data.subscription) url += '&sub='+sub.months;
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
      name: 'Update',
      description: 'Update the card to be charged for your subscription',
      panelLabel: 'Update Card',
      token: function(data) {
        var url = '/stripe/subscribe/edit?plan=basic_earned';
        $http.post(url, data).success(function() {
          window.location.reload(true);
        }).error(function(data) {
          alert(data.err);
        });
      }
    });
  }

  Payments.cancelSubscription = function(){
    if (!confirm(window.env.t('sureCancelSub'))) return;
    window.location.href = '/' + plan.paymentMethod.toLowerCase() + '/subscribe/cancel?_id=' + user._id + '&apiToken=' + user.apiToken;
  }

  return Payments;
}]);
