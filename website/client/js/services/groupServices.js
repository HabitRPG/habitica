'use strict';

angular.module('habitrpg')
.factory('Groups', [ '$location', '$rootScope', '$http', 'Analytics', 'ApiUrl', 'Challenges', '$q', 'User', 'Members',
  function($location, $rootScope, $http, Analytics, ApiUrl, Challenges, $q, User, Members) {
    var data =  {party: undefined, myGuilds: undefined, publicGuilds: undefined, tavern: undefined };
    var groupApiURLPrefix = "/api/v3/groups";
    var TAVERN_NAME = 'HabitRPG';

    var Group = {};

    //@TODO: Add paging
    Group.getGroups = function(type) {
      var url = groupApiURLPrefix;
      if (type) {
        url += '?type=' + type;
      }

      return $http({
        method: 'GET',
        url: url,
      });
    };

    Group.get = function(gid) {
      return $http({
        method: 'GET',
        url: groupApiURLPrefix + '/' + gid,
      });
    };

    Group.syncParty = function() {
      return party();
    };

    Group.create = function(groupDetails) {
      return $http({
        method: "POST",
        url: groupApiURLPrefix,
        data: groupDetails,
      });
    };

    Group.update = function(groupDetails) {
      //@TODO: Check for what has changed?

      //Remove populated fields
      var groupDetailsToSend = _.omit(groupDetails, ['chat', 'challenges', 'members', 'invites']);
      if (groupDetailsToSend.leader && groupDetailsToSend.leader._id) groupDetailsToSend.leader = groupDetailsToSend.leader._id;

      return $http({
        method: "PUT",
        url: groupApiURLPrefix + '/' + groupDetailsToSend._id,
        data: groupDetailsToSend,
      });
    };

    Group.join = function(gid) {
      return $http({
        method: "POST",
        url: groupApiURLPrefix + '/' + gid + '/join',
      });
    };

    Group.rejectInvite = function(gid) {
      return $http({
        method: "POST",
        url: groupApiURLPrefix + '/' + gid + '/reject-invite',
      });
    };

    Group.leave = function(gid, keep) {
      return $http({
        method: "POST",
        url: groupApiURLPrefix + '/' + gid + '/leave',
        data: {
          keep: keep,
        }
      });
    };

    Group.removeMember = function(gid, memberId, message) {
      return $http({
        method: "POST",
        url: groupApiURLPrefix + '/' + gid + '/removeMember/' + memberId,
        data: {
          message: message,
        },
      });
    };

    Group.invite = function(gid, invitationDetails) {
      return $http({
        method: "POST",
        url: groupApiURLPrefix + '/' + gid + '/invite',
        data: {
          uuids: invitationDetails.uuids,
          emails: invitationDetails.emails,
        },
      });
    };

    Group.inviteToQuest = function(gid, key) {
      return $http({
        method: "POST",
        url: groupApiURLPrefix + '/' + gid + '/quests/invite/' + key,
      });
    };

    //On page load, multiple controller request the party.
    //So, we cache the promise until the first result is returned
    var _cachedPartyPromise;

    function party (forceUpdate) {
      if (_cachedPartyPromise && !forceUpdate) return _cachedPartyPromise.promise;
      _cachedPartyPromise = $q.defer();

      if (!User.user.party._id) {
        data.party = { type: 'party' };
        _cachedPartyPromise.reject(data.party);
      }

      if (!data.party || forceUpdate) {
        Group.get('party')
          .then(function (response) {
            data.party = response.data.data;
            Members.getGroupMembers(data.party._id, true)
              .then(function (response) {
                data.party.members = response.data.data;
                return Members.getGroupInvites(data.party._id);
              })
              .then(function (response) {
                data.party.invites = response.data.data;
                return Challenges.getGroupChallenges(data.party._id)
              })
              .then(function (response) {
                data.party.challenges = response.data.data;
                _cachedPartyPromise.resolve(data.party);
              });
          }, function (response) {
            data.party = { type: 'party' };
            _cachedPartyPromise.reject(data.party);
          })
          .finally(function() {
             _cachePartyPromise = null;
          });
      } else {
        _cachedPartyPromise.resolve(data.party);
      }

      return _cachedPartyPromise.promise;
    }

    function removePartyCache () {
      _cachedPartyPromise = null;
    }

    function publicGuilds () {
      var deferred = $q.defer();

      if (!data.publicGuilds) {
        Group.getGroups('publicGuilds')
          .then(function (response) {
            data.publicGuilds = response.data.data;
            deferred.resolve(data.publicGuilds);
          }, function (response) {
            deferred.reject(response);
          });
      } else {
        deferred.resolve(data.publicGuilds);
      }

      return deferred.promise;
      //TODO combine these as {type:'guilds,public'} and create a $filter() to separate them
    }

    function myGuilds () {
      var deferred = $q.defer();

      if (!data.myGuilds) {
        Group.getGroups('guilds')
          .then(function (response) {
            data.myGuilds = response.data.data;
            deferred.resolve(data.myGuilds);
          }, function (response) {
            deferred.reject(response);
          });
      } else {
        deferred.resolve(data.myGuilds);
      }

      return deferred.promise;
    }

    function tavern (forceUpdate) {
      var deferred = $q.defer();

      if (!data.tavern || forceUpdate) {
        Group.get('habitrpg')
          .then(function (response) {
            data.tavern = response.data.data;
            deferred.resolve(data.tavern);
          }, function (response) {
            deferred.reject(response);
          });
      } else {
        deferred.resolve(data.tavern);
      }

      return deferred.promise;
    }

    function inviteOrStartParty (group) {
      Analytics.track({'hitType':'event','eventCategory':'button','eventAction':'click','eventLabel':'Invite Friends'});

      if (group.type === "party" || $location.$$path === "/options/groups/party") {
       group.type = 'party';

       $rootScope.openModal('invite-party', {
         controller:'InviteToGroupCtrl',
         resolve: {
           injectedGroup: function(){ return group; }
         }
       });
      } else {
       $location.path("/options/groups/party");
      }
    }

    return {
      TAVERN_NAME: TAVERN_NAME,
      party: party,
      publicGuilds: publicGuilds,
      myGuilds: myGuilds,
      tavern: tavern,
      inviteOrStartParty: inviteOrStartParty,
      removePartyCache: removePartyCache,

      data: data,
      Group: Group,
    };
 }]);
