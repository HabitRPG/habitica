'use strict';

/**
 * Services that persists and retrieves user from localStorage.
 */

angular.module('habitrpg').factory('Challenges',
['ApiUrl', '$resource',
function(ApiUrl, $resource) {
  var Challenge = $resource(ApiUrl.get() + '/api/v2/challenges/:cid',
    {cid:'@_id'},
    {
      //'query': {method: "GET", isArray:false}
      join: {method: "POST", url: ApiUrl.get() + '/api/v2/challenges/:cid/join'},
      leave: {method: "POST", url: ApiUrl.get() + '/api/v2/challenges/:cid/leave'},
      close: {method: "POST", params: {uid:''}, url: ApiUrl.get() + '/api/v2/challenges/:cid/close'},
      getMember: {method: "GET", url: ApiUrl.get() + '/api/v2/challenges/:cid/member/:uid'}
    });

  //var challenges = [];

  return {
    Challenge: Challenge
    //challenges: challenges
  }
}]);
