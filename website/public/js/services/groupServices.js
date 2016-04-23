'use strict';

angular.module('habitrpg')
.factory('Groups', [ '$location', '$resource', '$rootScope', '$http', 'Analytics', 'ApiUrl', 'Challenges','User',
  function($location, $resource, $rootScope, $http, Analytics, ApiUrl, Challenges, User) {
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
        url: groupApiURLPrefix + gid + '/removeMember/' + memberId,
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

    function party(cb) {
      if (!data.party) {
        Group.get('party')
          .then(function successCallback(response) {
            data.party = response.data.data;
          }, function errorCallback(response) {

          });
      } else {
        return data.party;
      }
    }

    function publicGuilds() {
      if (!data.publicGuilds) {
        Group.getGroups('publicGuilds')
          .then(function successCallback(response) {
            data.publicGuilds = response.data.data;
          }, function errorCallback(response) {

          });
      } else {
        return data.publicGuilds;
      }
      //TODO combine these as {type:'guilds,public'} and create a $filter() to separate them
    }

    function myGuilds() {
      if (!data.myGuilds) {
        Group.getGroups('privateGuilds')
          .then(function successCallback(response) {
            data.myGuilds = response.data.data;
          }, function errorCallback(response) {

          });
      } else {
        return data.myGuilds;
      }
    }

    function tavern() {
      if (!data.tavern) data.tavern = Group.get({gid:'habitrpg'});
      return data.tavern;
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
