'use strict';

/**
 * Services that handle achievement logic.
 */

angular.module("habitrpg").factory("Achievement",
['$rootScope', function($rootScope) {

	function openModal(achievementName) {
		$rootScope.openModal('achievements/' + achievementName,
			{controller:'UserCtrl', size:'sm'});
	}

	return {
		openModal: openModal
	};
}]);
