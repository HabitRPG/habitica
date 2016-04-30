'use strict';

angular.module('habitrpg')
.factory('Groups', [ '$location', '$rootScope', '$http', 'Analytics', 'ApiUrl', 'Challenges', 'User', '$q',
  function($location, $rootScope, $http, Analytics, ApiUrl, Challenges, User, $q) {
    var data =  {party: undefined, myGuilds: undefined, publicGuilds: undefined, tavern: undefined };
    var groupApiURLPrefix = "/api/v3/groups";

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
      return this.get('party');
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
      return $http({
        method: "PUT",
        url: groupApiURLPrefix + '/' + groupDetails._id,
        data: groupDetails,
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

    Group.startQuest = function(gid) {
      return $http({
        method: "POST",
        url: groupApiURLPrefix + '/' + gid + '/questAccept',
      });
    };

    function party () {
      var deferred = $q.defer();

      if (!data.party) {
        Group.get('party')
          .then(function (response) {
            data.party = response.data.data;
            deferred.resolve(data.party);
          }, function (response) {
            deferred.reject(response);
          });
      } else {
        deferred.resolve(data.party);
      }

      return deferred.promise;
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
        Group.getGroups('privateGuilds')
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

    function tavern () {
      var deferred = $q.defer();

      if (!data.tavern) {
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
      party: party,
      publicGuilds: publicGuilds,
      myGuilds: myGuilds,
      tavern: tavern,
      inviteOrStartParty: inviteOrStartParty,

      data: data,
      Group: Group,
    };
 }]);
