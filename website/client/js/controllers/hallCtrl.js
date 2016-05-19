"use strict";

habitrpg.controller("HallHeroesCtrl", ['$scope', '$rootScope', 'User', 'Notification', 'ApiUrl', '$resource',
  function($scope, $rootScope, User, Notification, ApiUrl, $resource) {
    var Hero = $resource(ApiUrl.get() + '/api/v3/hall/heroes/:uid', {uid:'@_id'});
    $scope.hero = undefined;
    $scope.loadHero = function(uuid){
      Hero.query({uid:uuid}, function (heroData) {
        $scope.hero = heroData.data;
      });
    }
    $scope.saveHero = function(hero) {
      $scope.hero.contributor.admin = ($scope.hero.contributor.level > 7) ? true : false;
      hero.$save(function(){
        Notification.text("User updated");
        $scope.hero = undefined;
        $scope._heroID = undefined;
        Hero.query({}, function (heroesData) {
          $scope.heroes = heroesData.data;
        });
      })
    }
    Hero.query({}, function (heroesData) {
      $scope.heroes = heroesData.data;
    });

    $scope.populateContributorInput = function(id) {
      $scope._heroID = id;
      window.scrollTo(0,200);
      $scope.loadHero(id);
    };
  }]);

habitrpg.controller("HallPatronsCtrl", ['$scope', '$rootScope', 'User', 'Notification', 'ApiUrl', '$resource',
  function($scope, $rootScope, User, Notification, ApiUrl, $resource) {
    var Patron = $resource(ApiUrl.get() + '/api/v3/hall/patrons/:uid', {uid:'@_id'});

    var page = 0;
    $scope.patrons = [];

    $scope.loadMore = function(){
      Patron.query({page: page++}, function(patronsData){
        $scope.patrons = $scope.patrons.concat(patronsData.data);
      })
    }
    $scope.loadMore();

  }]);
