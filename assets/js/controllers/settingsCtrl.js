'use strict';

// Make user and settings available for everyone through root scope.
habitrpg.controller('SettingsCtrl',
  ['$scope', 'User', '$location',
  function($scope, User, $location) {
    $scope.resetApp = function () {
        localStorage.clear();
        location.reload();
    };
    $scope.auth = function (id, token) {
        User.authenticate(id, token, function (err) {
            if (!err) {
                alert('Login successful!');
                $location.path("/habit");
            }
        });
    }

  }
]);
