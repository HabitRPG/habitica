'use strict';

/**
 * Services that expose habitrpg-shared
 */

angular.module('sharedServices', []).
    factory('Shared', [function () {
        return window.habitrpgShared;
    }
]).
    factory('Content', ['Shared', function (Shared) {
        return Shared.content;
    }
]);
