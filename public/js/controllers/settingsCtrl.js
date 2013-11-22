'use strict';

// Make user and settings available for everyone through root scope.
habitrpg.controller('SettingsCtrl',
  ['$scope', 'User', '$rootScope', '$http', 'API_URL', 'Guide', '$location',
  function($scope, User, $rootScope, $http, API_URL, Guide, $location) {

    // FIXME we have this re-declared everywhere, figure which is the canonical version and delete the rest
//    $scope.auth = function (id, token) {
//        User.authenticate(id, token, function (err) {
//            if (!err) {
//                alert('Login successful!');
//                $location.path("/habit");
//            }
//        });
//    }

    $scope.showTour = function(){
      User.set('flags.showTour',true);
      Guide.initTour();
      $location.path('/tasks');
    }

    $scope.showBailey = function(){
      User.set('flags.newStuff',true);
    }

    $scope.saveDayStart = function(){
      var dayStart = +User.user.preferences.dayStart;
      if (dayStart < 0 || dayStart > 24) {
        dayStart = 0;
      }
      User.log({'op':'set', data:{'preferences.dayStart': dayStart}});
    }

    $scope.reroll = function(){

      $http.post(API_URL + '/api/v1/user/reroll')
        .success(function(){
          window.location.href = '/';
          // FIXME, I can't get the tasks to update in the browser, even with _.extend(user,data). refreshing for now
        })
        .error(function(data){
          alert(data.err)
        })
    }

    $scope.changePassword = function(changePass){
      if (!changePass.oldPassword || !changePass.newPassword || !changePass.confirmNewPassword) {
        return alert("Please fill out all fields");
      }
      $http.post(API_URL + '/api/v1/user/change-password', changePass)
        .success(function(){
          alert("Password successfully changed");
          $scope.changePass = {};
        })
        .error(function(data){
          alert(data);
        });
    }

    $scope.restoreValues = {};
    $rootScope.$watch('modals.restore', function(value){
      if(value === true){
        $scope.restoreValues.stats = angular.copy(User.user.stats);
        $scope.restoreValues.items = angular.copy(User.user.items);
        $scope.restoreValues.achievements = {streak: User.user.achievements.streak || 0};
      }
    })

    $scope.restore = function(){
      var stats = $scope.restoreValues.stats,
        items = $scope.restoreValues.items,
        achievements = $scope.restoreValues.achievements;
      User.setMultiple({
        "stats.hp": stats.hp,
        "stats.exp": stats.exp,
        "stats.gp": stats.gp,
        "stats.lvl": stats.lvl,
        "items.weapon": items.weapon,
        "items.armor": items.armor,
        "items.head": items.head,
        "items.shield": items.shield,
        "achievements.streak": achievements.streak
      });
      $rootScope.modals.restore = false;
    }
    $scope.reset = function(){
      $http.post(API_URL + '/api/v1/user/reset')
        .success(function(){
          User.user._v--;
          User.log({});
          $rootScope.modals.reset = false;
        })
        .error(function(data){
          alert(data);
        });
    }
    $scope['delete'] = function(){
      $http['delete'](API_URL + '/api/v1/user')
        .success(function(){
          localStorage.clear();
          window.location.href = '/logout';
        })
        .error(function(data){
          alert(data);
        });
    }


    // Audio list of themes
    $scope.soundThemes = {
      'browserquest': 'BrowserQuest',
      'artisticdude': 'ArtisticDude',
    };
  }
]);
