'use strict';

// Make user and settings available for everyone through root scope.
habitrpg.controller('SettingsCtrl',
  ['$scope', 'User', '$rootScope', '$http', 'ApiUrlService', 'Guide', '$location', '$timeout', 'Notification', 'Shared',
  function($scope, User, $rootScope, $http, ApiUrlService, Guide, $location, $timeout, Notification, Shared) {

    // FIXME we have this re-declared everywhere, figure which is the canonical version and delete the rest
//    $scope.auth = function (id, token) {
//        User.authenticate(id, token, function (err) {
//            if (!err) {
//                alert('Login successful!');
//                $location.path("/habit");
//            }
//        });
//    }

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
      $location.path('/tasks');
      $timeout(Guide.initTour);
    }

    $scope.showClassesTour = function(){
      Guide.classesTour();
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

    $scope.reroll = function(){
      User.user.ops.reroll({});
      $rootScope.$state.go('tasks');
    }

    $scope.rebirth = function(){
      User.user.ops.rebirth({});
      $rootScope.$state.go('tasks');
    }

    $scope.changeUsername = function(changeUser){
      if (!changeUser.newUsername || !changeUser.password) {
        return alert(window.env.t('fillAll'));
      }
      $http.post(ApiUrlService.get() + '/api/v2/user/change-username', changeUser)
        .success(function(){
          alert(window.env.t('usernameSuccess'));
          $scope.changeUser = {};
        })
        .error(function(data){
          alert(data.err);
        });
    }

    $scope.changePassword = function(changePass){
      if (!changePass.oldPassword || !changePass.newPassword || !changePass.confirmNewPassword) {
        return alert(window.env.t('fillAll'));
      }
      $http.post(ApiUrlService.get() + '/api/v2/user/change-password', changePass)
        .success(function(data, status, headers, config){
          if (data.err) return alert(data.err);
          alert(window.env.t('passSuccess'));
          $scope.changePass = {};
        })
        .error(function(data, status, headers, config){
          alert(data.err);
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
      $http['delete'](ApiUrlService.get() + '/api/v2/user')
        .success(function(res, code){
          if (res.err) return alert(res.err);
          localStorage.clear();
          window.location.href = '/logout';
        });
    }

    $scope.enterCoupon = function(code) {
      $http.post(ApiUrlService.get() + '/api/v2/user/coupon/' + code).success(function(res,code){
        if (code!==200) return;
        User.sync();
        Notification.text('Coupon applied! Check your inventory');
      });
    }
    $scope.generateCodes = function(codes){
      $http.post(ApiUrlService.get() + '/api/v2/coupons/generate/'+codes.event+'?count='+(codes.count || 1))
        .success(function(res,code){
          $scope._codes = {};
          if (code!==200) return;
          window.location.href = '/api/v2/coupons?limit='+codes.count+'&_id='+User.user._id+'&apiToken='+User.user.apiToken;
        })
    }
    $scope.release = function() {
      User.user.ops.release({});
      $rootScope.$state.go('tasks');
    }

    $scope.release2 = function() {
      User.user.ops.release2({});
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
  }
]);
