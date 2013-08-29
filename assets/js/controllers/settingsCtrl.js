'use strict';

// Make user and settings available for everyone through root scope.
habitrpg.controller('SettingsCtrl',
  ['$scope', 'User', '$location',
  function($scope, User, $location) {

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
    }

  }
]);
