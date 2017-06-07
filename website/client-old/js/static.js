"use strict";

window.habitrpg = angular.module('habitrpg', ['chieffancypants.loadingBar', 'ui.bootstrap'])
  .constant("API_URL", "")
  .constant("STORAGE_USER_ID", 'habitrpg-user')
  .constant("STORAGE_SETTINGS_ID", 'habit-mobile-settings')
  .constant("MOBILE_APP", false)

.controller("RootCtrl", ['$scope', '$location', '$modal', '$http', 'Stats', 'Members',
  function($scope, $location, $modal, $http, Stats, Members) {
    var memberId = $location.search()['memberId'];
    if (memberId) {
      Members.fetchMember(memberId)
        .success(function(response) {
          $scope.profile = response.data;

          $scope.statCalc = Stats;
          $scope.Content = window.habitrpgShared.content;
          $modal.open({
            templateUrl: 'modals/member.html',
            scope: $scope
          });
        });
    }

    $http.defaults.headers.common['x-client'] = 'habitica-web';
  }])

.controller("PlansCtrl", ['$rootScope','Analytics','$location','User','$scope',
  function($rootScope,Analytics,$location,User,$scope) {
    $rootScope.clickContact = function(){
      Analytics.track({'hitType':'event','eventCategory':'button','eventAction':'click','eventLabel':'Contact Us (Plans)'})
    };
    $scope.goToNewGroupPage = function () {
      if (User.authenticated()) {
        window.location.href="/#/options/groups/new-group";
      } else {
        // There is no authenticated user, so redirect to the login page,
        // taking the hash with it to effectively redirect after login.
        window.location.href = "/static/login#/options/groups/new-group";
      }
    };
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

.controller('AccordionCtrl', function() {
  function openHashAccordion() {
    if (window.location.hash) {
      var $target = $(window.location.hash.replace('/',''));
      if ($target.hasClass('collapse')) {
        $target.collapse('show');
        $('html, body').animate({
          scrollTop: $($target).offset().top - 100
        });
      }
    }
  }
  $(document).ready(function(){
    openHashAccordion();
  });
})
