'use strict';

(function(){
  angular
    .module('habitrpg')
    .factory('Social', socialFactory);

  socialFactory.$inject = [
    '$http','ApiUrl', 'Alert', 'Auth'
  ];

  function socialFactory($http, ApiUrl, Alert, Auth) {

    function loadWidgets() {
      // Facebook
      if (typeof FB === 'undefined') {
        (function(d, s, id) {
          var js, fjs = d.getElementsByTagName(s)[0];
          if (d.getElementById(id)) return;
          js = d.createElement(s); js.id = id;
          js.src = "//connect.facebook.net/en_US/sdk.js#xfbml=1&version=v2.5";
          fjs.parentNode.insertBefore(js, fjs);
        }(document, 'script', 'facebook-jssdk'));
      } else {
        FB.XFBML.parse(); // http://stackoverflow.com/questions/29133563/
      }

      // Tumblr
      $.getScript('https://assets.tumblr.com/share-button.js');

      // Twitter
      if (typeof twttr === 'undefined') {
        $.getScript('https://platform.twitter.com/widgets.js');
      } else {
        twttr.widgets.load();
      }
    }

    hello.init({
      facebook : window.env.FACEBOOK_KEY,
      google : window.env.GOOGLE_CLIENT_ID
    });

    function socialLogin(network){
      hello(network).login({scope:['email']}).then(function(auth){
        $http.post(ApiUrl.get() + "/api/v3/user/auth/social", auth)
          .success(function(res, status, headers, config) {
            Auth.runAuth(res.data.id, res.data.apiToken);
          }).error(Alert.authErrorAlert);
      }, function( err ){
        alert("Signin error: " + err.message );
      });
    };



    return {
      loadWidgets: loadWidgets,
      socialLogin: socialLogin
    }
  }
}());
