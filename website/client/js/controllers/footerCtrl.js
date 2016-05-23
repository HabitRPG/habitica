"use strict";

angular.module('habitrpg').controller("FooterCtrl",
['$scope', '$rootScope', 'User', '$http', 'Notification', 'ApiUrl', 'Social',
function($scope, $rootScope, User, $http, Notification, ApiUrl, Social) {

  $scope.loadWidgets = Social.loadWidgets;

  if(env.isStaticPage){
    $scope.languages = env.availableLanguages;
    $scope.selectedLanguage = _.find(env.availableLanguages, {code: env.language.code});

    $rootScope.selectedLanguage = $scope.selectedLanguage;

    $scope.changeLang = function(){
      window.location = '?lang='+$scope.selectedLanguage.code;
    }
  }

  /**
   External Scripts
   JS files not needed right away (google charts) or entirely optional (analytics)
   Each file gets loaded async via $.getScript, so it doesn't bog page-load
  */

  $scope.deferredScripts = function(){

    // Amazon Payments
    var amazonPaymentsUrl = 'https://static-na.payments-amazon.com/OffAmazonPayments/us/' +
                        (window.env.NODE_ENV === 'production' ? '' : 'sandbox/') + 'js/Widgets.js';
    $.getScript(amazonPaymentsUrl);

    // Stripe
    $.getScript('//checkout.stripe.com/v2/checkout.js');

    /* Google Content Experiments
    if (window.env.NODE_ENV === 'production') {
      $.getScript('//www.google-analytics.com/cx/api.js?experiment=boVO4eEyRfysNE5D53nCMQ', function(){
        $rootScope.variant = cxApi.chooseVariation();
        $rootScope.$apply();
      })
    } */

    // Scripts only for desktop
    if (!window.env.IS_MOBILE) {
      // Add This
      //$.getScript("//s7.addthis.com/js/300/addthis_widget.js#pubid=ra-5016f6cc44ad68a4"); //FIXME why isn't this working when here? instead it's now in <head>
      var addthisServices = 'facebook,twitter,googleplus,tumblr,'+window.env.BASE_URL.replace('https://','').replace('http://','');
      window.addthis_config = {
        ui_click: true,
        services_custom:{
          name: "Download",
          url: window.env.BASE_URL+"/export/avatar-"+User.user._id+".png",
          icon: window.env.BASE_URL+"/favicon.ico"
        },
        services_expanded:addthisServices,
        services_compact:addthisServices
      };

      // Google Charts
      $.getScript("//www.google.com/jsapi", function() {
        google.load("visualization", "1", {
          packages: ["corechart"],
          callback: function() {}
        });
      });
    }
  }

  /**
   * Debug functions. Note that the server route for gems is only available if process.env.DEBUG=true
   */
  if (_.contains(['development','test'],window.env.NODE_ENV)) {

    $scope.setHealthLow = function(){
      User.set({
        'stats.hp': 1
      });
    };

    $scope.addMissedDay = function(numberOfDays){
      if (!confirm("Are you sure you want to reset the day by " + numberOfDays + " day(s)?")) return;

      User.setCron(numberOfDays);
    };

    $scope.addTenGems = function(){
      User.addTenGems();
    };

    $scope.addHourglass = function(){
      User.addHourglass();
    };

    $scope.addGold = function(){
      User.set({
        'stats.gp': User.user.stats.gp + 500,
      });
    };

    $scope.addMana = function(){
      User.set({
        'stats.mp': User.user.stats.mp + 500,
      });
    };

    $scope.addLevelsAndGold = function(){
      User.set({
        'stats.exp': User.user.stats.exp + 10000,
        'stats.gp':  User.user.stats.gp  + 10000,
        'stats.mp':  User.user.stats.mp  + 10000
      });
    };

    $scope.addOneLevel = function(){
      User.set({
        'stats.exp': User.user.stats.exp + (Math.round(((Math.pow(User.user.stats.lvl, 2) * 0.25) + (10 * User.user.stats.lvl) + 139.75) / 10) * 10)
      });
    };

    $scope.addQuestProgress = function(){
      $http({
        method: "POST",
        url: 'api/v3/debug/quest-progress'
      })
      .then(function (response) {
        Notification.text('Quest progress increased');
        User.sync();
      })
    };

    $scope.makeAdmin = function () {
      User.makeAdmin();
    };

    $scope.openModifyInventoryModal = function () {
      $rootScope.openModal('modify-inventory', {controller: 'FooterCtrl', scope: $scope });
      $scope.showInv = { };
      $scope.inv = {
        gear: {},
        special: {},
        pets: {},
        mounts: {},
        eggs: {},
        hatchingPotions: {},
        food: {},
        quests: {},
      };
      $scope.setAllItems = function (type, value) {
        var set = $scope.inv[type];

        for (var item in set) {
          if (set.hasOwnProperty(item)) {
            set[item] = value;
          }
        }
      };
    };

    $scope.modifyInventory = function () {
      $http({
        method: "POST",
        url: 'api/v3/debug/modify-inventory',
        data: {
          gear: $scope.showInv.gear ? $scope.inv.gear : null,
          special: $scope.showInv.special ? $scope.inv.special : null,
          pets: $scope.showInv.pets ? $scope.inv.pets : null,
          mounts: $scope.showInv.mounts ? $scope.inv.mounts : null,
          eggs: $scope.showInv.eggs ? $scope.inv.eggs : null,
          hatchingPotions: $scope.showInv.hatchingPotions ? $scope.inv.hatchingPotions : null,
          food: $scope.showInv.food ? $scope.inv.food : null,
          quests: $scope.showInv.quests ? $scope.inv.quests : null,
        }
      })
      .then(function (response) {
        Notification.text('Inventory updated. Refresh or sync.');
      })
    };
  }
}])
