'use strict';

/**
 * Services that persists and retrieves user from localStorage.
 */

angular.module('sharedServices', [] ).
    factory("Items", ['$rootScope', function($rootScope){
        return window.habitrpgShared.items;
    }]).
    factory("Algos", ['$rootScope', function($rootScope){
        return window.habitrpgShared.algos;
    }]).
    factory("Helpers", ['$rootScope', function($rootScope){
        return window.habitrpgShared.helpers;
    }]);