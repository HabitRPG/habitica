"use strict";

(typeof habitrpg !== 'undefined' ? habitrpg : habitrpgStatic)
  .controller("FooterCtrl", ['$scope', '$rootScope', 'User', '$http', 'Notification', 'API_URL',
  function($scope, $rootScope, User, $http, Notification, API_URL) {

    if(typeof habitrpg === "undefined"){
      $scope.languages = env.avalaibleLanguages;
      $scope.selectedLanguage = _.find(env.avalaibleLanguages, {code: env.language.code});

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

      // Stripe
      $.getScript('//checkout.stripe.com/v2/checkout.js');

      // Google Analytics, only in production
      if (window.env.NODE_ENV === 'production') {
        (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
          (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
        m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
        })(window,document,'script','//www.google-analytics.com/analytics.js','ga');
        ga('create', window.env.GA_ID, 'habitrpg.com');
        ga('send', 'pageview');
      }

      // Scripts only for desktop
      if (!window.env.IS_MOBILE) {
        // Add This
        $.getScript("//s7.addthis.com/js/250/addthis_widget.js#pubid=lefnire");

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
      $scope.addMissedDay = function(){
        if (!confirm("Are you sure you want to reset the day?")) return;
        var dayBefore = moment(User.user.lastCron).subtract('days', 1).toDate();
        User.set({'lastCron': dayBefore});
        Notification.text('-1 day, remember to refresh');
      }
      $scope.addTenGems = function(){
        $http.post(API_URL + '/api/v2/user/addTenGems').success(function(){
          User.log({});
        })
      }
      $scope.addLevelsAndGold = function(){
        User.set({
          'stats.exp': User.user.stats.exp + 10000,
          'stats.gp': User.user.stats.gp + 10000,
          'stats.mp': User.user.stats.mp + 10000
        });
      }
      $scope.addOneLevel = function(){
        User.set({
          'stats.exp': User.user.stats.exp + (Math.round(((Math.pow(User.user.stats.lvl, 2) * 0.25) + (10 * User.user.stats.lvl) + 139.75) / 10) * 10)
        });
      }
    }

  }])