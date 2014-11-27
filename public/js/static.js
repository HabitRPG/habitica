"use strict";

window.habitrpgStatic = angular.module('habitrpgStatic', ['notificationServices', 'userServices', 'chieffancypants.loadingBar', 'authCtrl', 'ui.bootstrap'])
  .constant("API_URL", "")
  .constant("STORAGE_USER_ID", 'habitrpg-user')
  .constant("STORAGE_SETTINGS_ID", 'habit-mobile-settings')
  .constant("MOBILE_APP", false)

.controller("RootCtrl", ['$scope', '$location', '$modal', '$http', function($scope, $location, $modal, $http){
    // must be #?memberId=xx, see https://github.com/angular/angular.js/issues/7239
    var memberId = $location.search()['memberId'];
    if (memberId) {
      $http.get('/api/v2/members/'+memberId).success(function(data, status, headers, config){
        $scope.profile = data;
        $scope.Content = window.habitrpgShared.content;
        $modal.open({
          templateUrl: 'modals/member.html',
          scope: $scope
        });
      })
    }
  }])

.controller("PlansCtrl", ['$rootScope',
  function($rootScope) {
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
