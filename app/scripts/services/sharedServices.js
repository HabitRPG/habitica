'use strict';

/**
 * Services that persists and retrieves user from localStorage.
 */

angular.module('sharedServices', [] ).
    factory("Items", function($rootScope){
        return window.habitrpgShared.items;
    }).
    factory("Algos", function($rootScope){
        return window.habitrpgShared.algos;
    }).
    factory("Helpers", function($rootScope){
        return window.habitrpgShared.helpers;
    });