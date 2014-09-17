'use strict';

/**
 * Services that persists and retrieves user from localStorage.
 */

angular.module('challengeServices', ['ngResource']).
    factory('Challenges', ['ApiUrlService', '$resource', 'User', '$q', 'Members',
      function(ApiUrlService, $resource, User, $q, Members) {
        var Challenge = $resource(ApiUrlService.get() + '/api/v2/challenges/:cid',
          {cid:'@_id'},
          {
            //'query': {method: "GET", isArray:false}
            join: {method: "POST", url: ApiUrlService.get() + '/api/v2/challenges/:cid/join'},
            leave: {method: "POST", url: ApiUrlService.get() + '/api/v2/challenges/:cid/leave'},
            close: {method: "POST", params: {uid:''}, url: ApiUrlService.get() + '/api/v2/challenges/:cid/close'},
            getMember: {method: "GET", url: ApiUrlService.get() + '/api/v2/challenges/:cid/member/:uid'}
          });

        //var challenges = [];

        return {
          Challenge: Challenge
          //challenges: challenges
        }
      }
]);
