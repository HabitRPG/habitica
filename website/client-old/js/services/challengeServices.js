'use strict';

angular.module('habitrpg')
.factory('Challenges', ['ApiUrl', '$resource', '$http',
  function(ApiUrl, $resource, $http) {
    var apiV3Prefix = '/api/v3';

    function createChallenge (challengeData) {
      return $http({
        method: 'POST',
        url: apiV3Prefix + '/challenges',
        data: challengeData,
      });
    }

    function joinChallenge (challengeId) {
      return $http({
        method: 'POST',
        url: apiV3Prefix + '/challenges/' + challengeId + '/join',
      });
    }

    function leaveChallenge (challengeId, keep) {
      return $http({
        method: 'POST',
        url: apiV3Prefix + '/challenges/' + challengeId + '/leave',
        data: {
          keep: keep,
        }
      });
    }

    function getUserChallenges () {
      return $http({
        method: 'GET',
        url: apiV3Prefix + '/challenges/user',
      });
    }

    function getGroupChallenges (groupId) {
      return $http({
        method: 'GET',
        url: apiV3Prefix + '/challenges/groups/' + groupId,
      });
    }

    function getChallenge (challengeId) {
      return $http({
        method: 'GET',
        url: apiV3Prefix + '/challenges/' + challengeId,
      });
    }

    function exportChallengeCsv (challengeId) {
      return $http({
        method: 'GET',
        url: apiV3Prefix + '/challenges/' + challengeId + '/export/csv',
      });
    }

    function updateChallenge (challengeId, updateData) {

      var challengeDataToSend = _.omit(updateData, ['tasks', 'habits', 'todos', 'rewards', 'group']);
      if (challengeDataToSend.leader && challengeDataToSend.leader._id) challengeDataToSend.leader = challengeDataToSend.leader._id;

      return $http({
        method: 'PUT',
        url: apiV3Prefix + '/challenges/' + challengeId,
        data: challengeDataToSend,
      });
    }

    function deleteChallenge (challengeId) {
      return $http({
        method: 'DELETE',
        url: apiV3Prefix + '/challenges/' + challengeId,
      });
    }

    function selectChallengeWinner (challengeId, winnerId) {
      return $http({
        method: 'POST',
        url: apiV3Prefix + '/challenges/' + challengeId + '/selectWinner/' + winnerId,
      });
    }

    return {
      createChallenge: createChallenge,
      joinChallenge: joinChallenge,
      leaveChallenge: leaveChallenge,
      getUserChallenges: getUserChallenges,
      getGroupChallenges: getGroupChallenges,
      getChallenge: getChallenge,
      exportChallengeCsv: exportChallengeCsv,
      updateChallenge: updateChallenge,
      deleteChallenge: deleteChallenge,
      selectChallengeWinner: selectChallengeWinner,
    }
  }]);
