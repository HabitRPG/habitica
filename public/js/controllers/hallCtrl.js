"use strict";

habitrpg.controller("HallHeroesCtrl", ['$scope', '$rootScope', 'User', 'Notification', 'ApiUrlService', '$resource',
  function($scope, $rootScope, User, Notification, ApiUrlService, $resource) {
    var Hero = $resource(ApiUrlService.get() + '/api/v2/hall/heroes/:uid', {uid:'@_id'});
    $scope.hero = undefined;
    $scope.loadHero = function(uuid){
      $scope.hero = Hero.get({uid:uuid});
    }
    $scope.saveHero = function(hero) {
      $scope.hero.contributor.admin = ($scope.hero.contributor.level > 7) ? true : false;
      hero.$save(function(){
        Notification.text("User updated");
        $scope.hero = undefined;
        $scope._heroID = undefined;
        $scope.heroes = Hero.query();
      })
    }
    $scope.heroes = Hero.query();
  }]);

habitrpg.controller("HallPatronsCtrl", ['$scope', '$rootScope', 'User', 'Notification', 'ApiUrlService', '$resource',
  function($scope, $rootScope, User, Notification, ApiUrlService, $resource) {
    var Patron = $resource(ApiUrlService.get() + '/api/v2/hall/patrons/:uid', {uid:'@_id'});

    var page = 0;
    $scope.patrons = [];

    $scope.loadMore = function(){
      Patron.query({page: page++}, function(patrons){
        $scope.patrons = $scope.patrons.concat(patrons);
      })
    }
    $scope.loadMore();

  }]);
