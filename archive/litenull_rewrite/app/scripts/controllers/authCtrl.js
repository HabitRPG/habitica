'use strict';

/**
 * The authentication controller (login & facebook)
 *
 */

habitrpg.controller('AuthCtrl', function AuthCtrl($scope, Facebook, LocalAuth, User, $http, $location) {
    $scope.Facebook = Facebook;
    $scope.Local = LocalAuth;

    $scope.uuid = ''
    $scope.apiToken = ''

    $scope.apiLogin = function() {
    
    User.authenticate($scope.uuid, $scope.apiToken, function(err) {
        if (!err) {
            alert('Login succesfull!');
            $location.path("/habit");
            User.fetch()
        }
    });

    }

});