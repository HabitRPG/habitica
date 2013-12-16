'use strict';

/**
 * Services that persists and retrieves user from localStorage.
 */

angular.module('challengeServices', ['ngResource']).
    factory('Challenges', ['API_URL', '$resource', 'User', '$q', 'Members',
      function(API_URL, $resource, User, $q, Members) {
        var Challenge = $resource(API_URL + '/api/v2/challenges/:cid',
          {cid:'@_id'},
          {
            //'query': {method: "GET", isArray:false}
            join: {method: "POST", url: API_URL + '/api/v2/challenges/:cid/join'},
            leave: {method: "POST", url: API_URL + '/api/v2/challenges/:cid/leave'},
            close: {method: "POST", params: {uid:''}, url: API_URL + '/api/v2/challenges/:cid/close'},
            getMember: {method: "GET", url: API_URL + '/api/v2/challenges/:cid/member/:uid'}
          });

        //var challenges = [];

        return {
          Challenge: Challenge
          //challenges: challenges
        }
      }
]);
