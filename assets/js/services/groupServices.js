'use strict';

/**
 * Services that persists and retrieves user from localStorage.
 */

angular.module('groupServices', ['ngResource']).
    factory('Groups', ['API_URL', '$resource', 'User',
      function(API_URL, $resource, User) {
        var Group = $resource(API_URL + '/api/v1/groups/:gid',
          {gid:'@_id'},
          {
            //'query': {method: "GET", isArray:false}
            postChat: {method: "POST", url: API_URL + '/api/v1/groups/:gid/chat'},
            join: {method: "POST", url: API_URL + '/api/v1/groups/:gid/join'},
            leave: {method: "POST", url: API_URL + '/api/v1/groups/:gid/leave'},
            invite: {method: "POST", url: API_URL + '/api/v1/groups/:gid/invite'}
          });

        return Group;
      }
]);
