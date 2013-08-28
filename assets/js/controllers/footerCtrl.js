"use strict";

habitrpg.controller("FooterCtrl", ['$scope', '$rootScope', 'User', '$http',
  function($scope, $rootScope, User, $http) {

    /**
     External Scripts
     JS files not needed right away (google charts) or entirely optional (analytics)
     Each file gets loaded async via $.getScript, so it doesn't bog page-load
    */
    $scope.deferredScripts = function(){

      // Stripe
      $.getScript('//checkout.stripe.com/v2/checkout.js');

      // Amazon Affiliate
      if ($rootScope.authenticated() && User.user.flags.ads !== 'hide') {
        $.getScript('//wms.assoc-amazon.com/20070822/US/js/link-enhancer-common.js?tag=ha0d2-20').fail(function() {
          $('body').append('<img src="//wms.assoc-amazon.com/20070822/US/img/noscript.gif?tag=ha0d2-20" alt="" />');
        });
      }

      // Google Analytics, only in production
      if (window.env.NODE_ENV === 'production') {
        window._gaq = [["_setAccount", "UA-33510635-1"], ["_setDomainName", "habitrpg.com"], ["_trackPageview"]];
        $.getScript(("https:" === document.location.protocol ? "https://ssl" : "http://www") + ".google-analytics.com/ga.js");
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
  }])