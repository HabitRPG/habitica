'use strict';

// Make user and settings available for everyone through root scope.
habitrpg.controller('SettingsCtrl',
  ['$scope', 'User', '$rootScope', '$http', 'API_URL',
  function($scope, User, $rootScope, $http, API_URL) {

    // FIXME we have this re-declared everywhere, figure which is the canonical version and delete the rest
//    $scope.auth = function (id, token) {
//        User.authenticate(id, token, function (err) {
//            if (!err) {
//                alert('Login successful!');
//                $location.path("/habit");
//            }
//        });
//    }

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

  }
]);
