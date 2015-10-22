'use strict';

(function(){
  angular
    .module('habitrpg')
    .factory('Social', socialFactory);

  socialFactory.$inject = [];

  function socialFactory() {

    function loadWidgets() {
      // Facebook
      (function(d, s, id) {
        var js, fjs = d.getElementsByTagName(s)[0];
        if (d.getElementById(id)) return;
        js = d.createElement(s); js.id = id;
        js.src = "//connect.facebook.net/en_US/sdk.js#xfbml=1&version=v2.5";
        fjs.parentNode.insertBefore(js, fjs);
      }(document, 'script', 'facebook-jssdk'));

      // Tumblr
      $.getScript('https://assets.tumblr.com/share-button.js');

      // Twitter
      $.getScript('https://platform.twitter.com/widgets.js');
    }

    return {
      loadWidgets: loadWidgets
    }
  }
}());
