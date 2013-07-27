'use strict';

/**
 * The nav controller:
 * - sets the menu options, should we do it dynamic so it generates the menu like: width = 1/elements * 100 ?
 * - exposes the model to the template and provides event handlers
 */

habitrpg.controller( 'WrapperCtrl', function WrapperCtrl( $scope, $location, filterFilter, Facebook ) {


$scope.showMenu = function() {

  if ($location.path() == '/options') {
    $location.path('/')
  }else{
    $location.path('/options')
  }

}

$scope.logout = function() {
	localStorage.clear()
	$location.path('login')
	location.reload()
}

});
