'use strict';

/**
 * Services that persists and retrieves user from localStorage.
 */

angular.module('groupServices', ['ngResource']).
    factory('Groups', ['API_URL', '$resource', 'User',
      function(API_URL, $resource, User) {
        var Group = $resource(API_URL + '/api/v1/groups/:gid',
          {gid:'@_id'},
          {'query': {method: "GET", isArray:false}});
        return Group;
      }
]);
