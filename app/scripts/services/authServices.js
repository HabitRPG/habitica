'use strict';

/**
 * Services that persists and retrieves user from localStorage.
 */

var facebook = {}

angular.module('authServices', ['userServices']).
factory('Facebook', function($http, User) {
    //TODO FB.init({appId: '${section.parameters['facebook.app.id']}', status: true, cookie: true, xfbml: true});
    var auth, user = User.user;

    facebook.handleStatusChange = function(session) {
        if (session.authResponse) {

            FB.api('/me', {
                fields: 'name, picture, email'
            }, function(response) {
                console.log(response.error)
                if (!response.error) {

                    var data = {
                        name: response.name,
                        facebook_id: response.id,
                        email: response.email
                    }

                    $http.post('http://127.0.0.1:3000/api/v1/user/auth/facebook', data).success(function(data, status, headers, config) {
                        User.authenticate(data.id, data.token, function(err) {
                            if (!err) {
                                alert('Login succesfull!');
                                $location.path("/habit");
                            }
                        });
                    }).error(function(response) {
                        console.log('error')
                    })

                } else {
                    alert('napaka')
                }
                //clearAction();
            });
        } else {
            document.body.className = 'not_connected';
            //clearAction();
        }
    }

    return {

        authUser: function() {
            FB.Event.subscribe('auth.statusChange', facebook.handleStatusChange);
        },

        getAuth: function() {
            return auth;
        },

        login: function() {

            FB.login(null, {
                scope: 'email'
            });
        },

        logout: function() {
            FB.logout(function(response) {
                window.location.reload();
            });
        }
    }

})

.factory('LocalAuth', function($http, User) {

    var auth, user = User.user;

    return {

        getAuth: function() {
            return auth;
        },

        login: function() {
            user.id = '';
            user.apiToken = '';
            User.authenticate();
            return;

        },

        logout: function() {}
    }

});