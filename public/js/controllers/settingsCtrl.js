'use strict';

// Make user and settings available for everyone through root scope.
habitrpg.controller('SettingsCtrl',
  ['$scope', 'User', '$rootScope', '$http', 'API_URL', 'Guide', '$location', '$timeout',
  function($scope, User, $rootScope, $http, API_URL, Guide, $location, $timeout) {

    // FIXME we have this re-declared everywhere, figure which is the canonical version and delete the rest
//    $scope.auth = function (id, token) {
//        User.authenticate(id, token, function (err) {
//            if (!err) {
//                alert('Login successful!');
//                $location.path("/habit");
//            }
//        });
//    }

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

    $scope.changePassword = function(changePass){
      if (!changePass.oldPassword || !changePass.newPassword || !changePass.confirmNewPassword) {
        return alert(window.env.t('fillAll'));
      }
      $http.post(API_URL + '/api/v2/user/change-password', changePass)
        .success(function(){
          alert(window.env.t('passSuccess'));
          $scope.changePass = {};
        })
        .error(function(data){
          alert(data);
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
      $http['delete'](API_URL + '/api/v2/user')
        .success(function(res, code){
          if (res.err) return alert(res.err);
          localStorage.clear();
          window.location.href = '/logout';
        });
    }
  }
]);
