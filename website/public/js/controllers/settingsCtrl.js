'use strict';

// Make user and settings available for everyone through root scope.
habitrpg.controller('SettingsCtrl',
  ['$scope', 'User', '$rootScope', '$http', 'ApiUrl', 'Guide', '$location', '$timeout', 'Notification', 'Shared',
  function($scope, User, $rootScope, $http, ApiUrl, Guide, $location, $timeout, Notification, Shared) {

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

    $scope.showClassesTour = function(){
      Guide.goto('classes', 0, true);
    }

    $scope.showBailey = function(){
      User.set({'flags.newStuff':true});
    }

    $scope.saveDayStart = function(){
      var dayStart = +User.user.preferences.dayStart;
      if (_.isNaN(dayStart) || dayStart < 0 || dayStart > 24) {
        dayStart = 0;
        return alert(window.env.t('enterNumber'));
      }
      User.set({'preferences.dayStart': dayStart});
    }

    $scope.language = window.env.language;
    $scope.avalaibleLanguages = window.env.avalaibleLanguages;

    $scope.changeLanguage = function(){
      $rootScope.$on('userSynced', function(){
        window.location.reload();
      });
      User.set({'preferences.language': $scope.language.code});
    }

    $scope.availableFormats = ['MM/dd/yyyy','dd/MM/yyyy', 'yyyy/MM/dd'];

    $scope.reroll = function(){
      User.user.ops.reroll({});
      $rootScope.$state.go('tasks');
    }

    $scope.rebirth = function(){
      User.user.ops.rebirth({});
      $rootScope.$state.go('tasks');
    }

    $scope.changeUser = function(attr, updates){
      $http.post(ApiUrl.get() + '/api/v2/user/change-'+attr, updates)
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
      User.user.ops.reset({});
      $rootScope.$state.go('tasks');
    }

    $scope['delete'] = function(){
      $http['delete'](ApiUrl.get() + '/api/v2/user')
        .success(function(res, code){
          if (res.err) return alert(res.err);
          localStorage.clear();
          window.location.href = '/logout';
        });
    }

    $scope.enterCoupon = function(code) {
      $http.post(ApiUrl.get() + '/api/v2/user/coupon/' + code).success(function(res,code){
        if (code!==200) return;
        User.sync();
        Notification.text('Coupon applied! Check your inventory');
      });
    }
    $scope.generateCodes = function(codes){
      $http.post(ApiUrl.get() + '/api/v2/coupons/generate/'+codes.event+'?count='+(codes.count || 1))
        .success(function(res,code){
          $scope._codes = {};
          if (code!==200) return;
          window.location.href = '/api/v2/coupons?limit='+codes.count+'&_id='+User.user._id+'&apiToken='+User.user.apiToken;
        })
    }
    $scope.releasePets = function() {
      User.user.ops.releasePets({});
      $rootScope.$state.go('tasks');
    }

    $scope.releaseMounts = function() {
      User.user.ops.releaseMounts({});
      $rootScope.mountCount = 0;
      $rootScope.$state.go('tasks');
    }

    $scope.releaseBoth = function() {
      User.user.ops.releaseBoth({});
      $rootScope.mountCount = 0;
      $rootScope.$state.go('tasks');
    }

    // ---- Webhooks ------
    $scope._newWebhook = {url:''};
    $scope.$watch('user.preferences.webhooks',function(webhooks){
      $scope.hasWebhooks = _.size(webhooks);
    })
    $scope.addWebhook = function(url) {
      User.user.ops.addWebhook({body:{url:url, id:Shared.uuid()}});
      $scope._newWebhook.url = '';
    }
    $scope.saveWebhook = function(id,webhook) {
      delete webhook._editing;
      User.user.ops.updateWebhook({params:{id:id}, body:webhook});
    }
    $scope.deleteWebhook = function(id) {
      User.user.ops.deleteWebhook({params:{id:id}});
    }

    $scope.applyCoupon = function(coupon){
      $http.get(ApiUrl.get() + '/api/v2/coupons/valid-discount/'+coupon)
      .success(function(){
        Notification.text("Coupon applied!");
        var subs = $scope.Content.subscriptionBlocks;
        subs["basic_6mo"].discount = true;
        subs["google_6mo"].discount = false;
      });
    }
  }
]);
