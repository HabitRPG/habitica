'use strict';

// Make user and settings available for everyone through root scope.
habitrpg.controller('SettingsCtrl',
  ['$scope', 'User', '$rootScope', '$http', 'ApiUrl', 'Guide', '$location', '$timeout', 'Content', 'Notification', 'Shared', 'Social', '$compile',
  function($scope, User, $rootScope, $http, ApiUrl, Guide, $location, $timeout, Content, Notification, Shared, Social, $compile) {
    var RELEASE_ANIMAL_TYPES = {
      pets: 'releasePets',
      mounts: 'releaseMounts',
      both: 'releaseBoth',
    };

    var SOCIAL_AUTH_NETWORKS = Shared.constants.SUPPORTED_SOCIAL_NETWORKS;
    $scope.SOCIAL_AUTH_NETWORKS = SOCIAL_AUTH_NETWORKS;

    // FIXME we have this re-declared everywhere, figure which is the canonical version and delete the rest
//    $scope.auth = function (id, token) {
//        User.authenticate(id, token, function (err) {
//            if (!err) {
//                alert('Login successful!');
//                $location.path("/habit");
//            }
//        });
//    }

    // A simple object to map the key stored in the db (user.preferences.emailNotification[key])
    // to its string but ONLY when the preferences' key and the string key don't match
    var mapPrefToEmailString = {
      'importantAnnouncements': 'inactivityEmails'
    };

    // If ?unsubFrom param is passed with valid email type,
    // automatically unsubscribe users from that email and
    // show an alert
    $timeout(function(){
      var unsubFrom = $location.search().unsubFrom;
      if(unsubFrom){
        var emailPrefKey = 'preferences.emailNotifications.' + unsubFrom;
        var emailTypeString = env.t(mapPrefToEmailString[unsubFrom] || unsubFrom);
        User.set({emailPrefKey: false});
        User.user.preferences.emailNotifications[unsubFrom] = false;
        Notification.text(env.t('correctlyUnsubscribedEmailType', {emailType: emailTypeString}));
        $location.search({});
      }
    }, 1000);

    $scope.hideHeader = function(){
      User.set({"preferences.hideHeader":!User.user.preferences.hideHeader})
      if (User.user.preferences.hideHeader && User.user.preferences.stickyHeader){
        User.set({"preferences.stickyHeader":false});
        $rootScope.$on('userSynced', function(){
          window.location.reload();
        });
      }
    }

    $scope.toggleStickyHeader = function(){
      $rootScope.$on('userSynced', function(){
        window.location.reload();
      });
      User.set({"preferences.stickyHeader":!User.user.preferences.stickyHeader});
    }

    $scope.showTour = function(){
      User.set({'flags.showTour':true});
      Guide.goto('intro', 0, true);
    }

    $scope.showBailey = function(){
      User.set({'flags.newStuff':true});
    }

    $scope.dayStart = User.user.preferences.dayStart;

    $scope.openDayStartModal = function(dayStart) {
      $scope.dayStart = +dayStart;
      $scope.nextCron = _calculateNextCron();

      $rootScope.openModal('change-day-start', { scope: $scope });
    };

    $scope.saveDayStart = function() {
      User.setCustomDayStart(Math.floor($scope.dayStart));
    };

    $scope.language = window.env.language;
    $scope.availableLanguages = window.env.availableLanguages;

    $scope.changeLanguage = function(){
      $rootScope.$on('userSynced', function(){
        window.location.reload();
      });
      User.set({'preferences.language': $scope.language.code});
    }

    $scope.availableFormats = ['MM/dd/yyyy','dd/MM/yyyy', 'yyyy/MM/dd'];

    $scope.reroll = function(confirm){
      $scope.popoverEl.popover('destroy');

      if (confirm) {
        User.reroll({});
        $rootScope.$state.go('tasks');
      }
    }

    $scope.clickReroll = function($event){
      $scope.popoverEl = $($event.target);

      var html = $compile(
          '<a ng-controller="SettingsCtrl" ng-click="$close(); reroll(true)">' + window.env.t('confirm') + '</a><br/>\n<a ng-click="reroll(false)">' + window.env.t('cancel') + '</a><br/>'
      )($scope);

      $scope.popoverEl.popover('destroy').popover({
        html: true,
        placement: 'top',
        trigger: 'manual',
        title: window.env.t('confirmFortify'),
        content: html
      }).popover('show');
    }

    $scope.rebirth = function(confirm){
      $scope.popoverEl.popover('destroy');

      if (confirm) {
        User.rebirth({});
        $rootScope.$state.go('tasks');
      }
    }

    $scope.clickRebirth = function($event){
      $scope.popoverEl = $($event.target);

      var html = $compile(
          '<a ng-controller="SettingsCtrl" ng-click="$close(); rebirth(true)">' + window.env.t('confirm') + '</a><br/>\n<a ng-click="rebirth(false)">' + window.env.t('cancel') + '</a><br/>'
      )($scope);

      $scope.popoverEl.popover('destroy').popover({
        html: true,
        placement: 'top',
        trigger: 'manual',
        title: window.env.t('confirmReborn'),
        content: html
      }).popover('show');
    }

    $scope.changeUser = function(attr, updates){
      $http.put(ApiUrl.get() + '/api/v3/user/auth/update-'+attr, updates)
        .success(function(){
          alert(window.env.t(attr+'Success'));
          _.each(updates, function(v,k){updates[k]=null;});
          User.sync();
        });
    }

    $scope.restoreValues = {};
    $rootScope.openRestoreModal = function(){
      $scope.restoreValues.stats = angular.copy(User.user.stats);
      $scope.restoreValues.achievements = {streak: User.user.achievements.streak || 0};
      $rootScope.openModal('restore', {scope:$scope});
    };

    $scope.restore = function(){
      var stats = $scope.restoreValues.stats,
        achievements = $scope.restoreValues.achievements;
      User.set({
        "stats.hp": stats.hp,
        "stats.exp": stats.exp,
        "stats.gp": stats.gp,
        "stats.lvl": stats.lvl,
        "stats.mp": stats.mp,
        "achievements.streak": achievements.streak
      });
    }

    $scope.reset = function(){
      User.reset({});
      User.sync();
      $rootScope.$state.go('tasks');
    }

    $scope['delete'] = function(password) {
      $http({
        url: ApiUrl.get() + '/api/v3/user',
        method: 'DELETE',
        data: {password: password},
      })
      .then(function(res, code) {
        localStorage.clear();
        window.location.href = '/logout';
      });
    }

    $scope.enterCoupon = function(code) {
      $http.post(ApiUrl.get() + '/api/v3/coupons/enter/' + code).success(function(res,code){
        if (code!==200) return;
        User.sync();
        Notification.text(env.t('promoCodeApplied'));
      });
    }

    $scope.generateCodes = function(codes){
      $http.post(ApiUrl.get() + '/api/v2/coupons/generate/'+codes.event+'?count='+(codes.count || 1))
        .success(function(res,code){
          $scope._codes = {};
          if (code!==200) return;
          window.location.href = '/api/v2/coupons?limit='+codes.count+'&_id='+User.user._id+'&apiToken='+User.settings.auth.apiToken;
        })
    }

    $scope.clickRelease = function(type, $event){
      // Close other popovers if they're open
      $(".release_popover").not($event.target).popover('destroy');

      // Handle clicking on the gem icon
      if ($event.target.nodeName == "SPAN") {
        $scope.releasePopoverEl = $($event.target.parentNode);
      } else {
        $scope.releasePopoverEl = $($event.target);
      }

      var html = $compile(
          '<a ng-controller="SettingsCtrl" ng-click="$close(); releaseAnimals(\'' + type + '\')">' + window.env.t('confirm') + '</a><br/>\n<a ng-click="releaseAnimals()">' + window.env.t('cancel') + '</a><br/>'
      )($scope);

      $scope.releasePopoverEl.popover('destroy').popover({
        html: true,
        placement: 'top',
        trigger: 'manual',
        title: window.env.t('confirmPetKey'),
        content: html
      }).popover('show');
    }

    $scope.releaseAnimals = function (type) {
      $scope.releasePopoverEl.popover('destroy');

      var releaseFunction = RELEASE_ANIMAL_TYPES[type];

      if (releaseFunction) {
        User[releaseFunction]({});
        $rootScope.$state.go('tasks');
      }
    }

    // ---- Webhooks ------
    $scope._newWebhook = {url:''};
    $scope.addWebhook = function(url) {
      User.addWebhook({
        id: Shared.uuid(),
        type: 'taskActivity',
        options: {
          created: false,
          updated: false,
          deleted: false,
          scored: true
        },
        url: url,
        enabled: true
      });
      $scope._newWebhook.url = '';
    }
    $scope.saveWebhook = function(webhook) {
      delete webhook._editing;
      User.updateWebhook(webhook);
    }
    $scope.deleteWebhook = User.deleteWebhook;

    $scope.applyCoupon = function(coupon){
      $http.post(ApiUrl.get() + '/api/v3/coupons/validate/'+coupon)
      .success(function(){
        Notification.text("Coupon applied!");
        var subs = Content.subscriptionBlocks;
        subs["basic_6mo"].discount = true;
        subs["google_6mo"].discount = false;
      });
    }

    $scope.gemGoldCap = function(subscription) {
      var baseCap = 25;
      var gemCapIncrement = 5;
      var capIncrementThreshold = 3;
      var gemCapExtra = User.user.purchased.plan.consecutive.gemCapExtra;
      var blocks = Content.subscriptionBlocks[subscription.key].months / capIncrementThreshold;
      var flooredBlocks = Math.floor(blocks);

      var userTotalDropCap = baseCap + gemCapExtra + flooredBlocks * gemCapIncrement;
      var maxDropCap = 50;

      return [userTotalDropCap, maxDropCap];
    };

    $scope.numberOfMysticHourglasses = function(subscription) {
      var numberOfHourglasses = Content.subscriptionBlocks[subscription.key].months / 3;
      return Math.floor(numberOfHourglasses);
    };

    $scope.hasBackupAuthOption = function(user, checkedNetworkKey) {
      if (user.auth.local.username) {
        return true;
      }
      return _.find(SOCIAL_AUTH_NETWORKS, function (network) {
        if (network.key !== checkedNetworkKey) {
          if (user.auth.hasOwnProperty(network.key)) {
            return user.auth[network.key].id;
          }
        }
      });
    };

    $scope.hasSocialAuth = function (user) {
      return _.find(SOCIAL_AUTH_NETWORKS, function (network) {
        if (user.auth.hasOwnProperty(network.key)) {
          return user.auth[network.key].id;
        }
      });
    };

    $scope.deleteSocialAuth = function (networkKey) {
      var network = _.find(SOCIAL_AUTH_NETWORKS, function (network) {
        return network.key === networkKey;
      });

      $http.delete(ApiUrl.get() + "/api/v3/user/auth/social/"+networkKey).success(function(){
        Notification.text(env.t("detachedSocial", {network: network.name}));
        User.sync();
      });
    };

    $scope.socialLogin = Social.socialLogin;

    function _calculateNextCron() {
      $scope.dayStart;

      var nextCron = moment().hours($scope.dayStart).minutes(0).seconds(0).milliseconds(0);

      var currentHour = moment().format('H');
      if (currentHour >= $scope.dayStart) {
        nextCron = nextCron.add(1, 'day');;
      }

      return +nextCron.format('x');
    }
  }
]);
