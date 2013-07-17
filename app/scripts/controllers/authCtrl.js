'use strict';

/**
 * The authentication controller (login & facebook)
 *
 */

habitrpg.controller('AuthCtrl', function AuthCtrl($scope, Facebook, LocalAuth, User, $http) {
    $scope.Facebook = Facebook;
    $scope.Local = LocalAuth;

    document.addEventListener('deviceready', function() {

        FB.init({
            appId: '374812825970494',
            nativeInterface: CDV.FB,
            useCachedDialogs: false
        });

        //Facebook.authUser();
        //updateAuthElements();
    }, false);

    $scope.auth = function() {
        var username = $('#username').val()
        var password = $('#password').val()

        var data = {
            username: username,
            password: password
        }

        $http.post('http://127.0.0.1:3000/api/v1/user/auth/local', data).success(function(data, status, headers, config) {
            console.log(data)
            User.authenticate(data.id, data.token, function(err) {
                if (!err) {
                    alert('Login succesfull!');
                    $location.path("/habit");
                }
            });
        }).error(function(data) {
            alert('Invalid username/password')
        })
    }

    var uuid = "0d86edcc-6ab2-44c9-91e9-de8b3bcadc6c"
    var token = "b5a7396e-b7cf-465a-945b-e43e927e6cc2"

    User.authenticate(uuid, token, function(err) {
        if (!err) {
            alert('Login succesfull!');
            $location.path("/habit");
        }
    });

});