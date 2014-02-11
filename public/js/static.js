"use strict";

window.habitrpgStatic = angular.module('habitrpgStatic', ['notificationServices', 'userServices', 'chieffancypants.loadingBar', 'authCtrl', 'ui.bootstrap'])
  .constant("API_URL", "")
  .constant("STORAGE_USER_ID", 'habitrpg-user')
  .constant("STORAGE_SETTINGS_ID", 'habit-mobile-settings')
  .constant("MOBILE_APP", false)

habitrpgStatic.controller("PlansCtrl", ['$rootScope', '$location', '$timeout',
  function($rootScope, $location, $timeout) {

    // GA goal-tracking
    $timeout(function(){
      window.ga && ga('send', 'event', 'page', 'view', 'Plans');
    });

    $rootScope.clickContact = function(){
      window.ga && ga('send', 'event', 'button', 'click', 'Contact Us (Plans)');
    }
  }
])
.controller('AboutCtrl',[function(){
  $(document).ready(function(){
    $('a.gallery').colorbox({
      maxWidth: '90%',
      maxHeight: '80%',
      transition: 'none',
      scalePhotos:true
      //maxHeight: '70%'
    });
  });
}])
