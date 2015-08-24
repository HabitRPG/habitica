'use strict';

(function() {
  angular
    .module('habitrpg')
    .factory('Groups', groupsFactory);

  groupsFactory.$inject = [
    '$location',
    '$resource',
    '$rootScope',
    'Analytics',
    'ApiUrl',
    'Challenges',
    'User'
  ];

  function groupsFactory($location, $resource, $rootScope, Analytics, ApiUrl, Challenges, User) {

    var data = {party: undefined, myGuilds: undefined, publicGuilds: undefined, tavern: undefined};
    var Group = $resource(ApiUrl.get() + '/api/v2/groups/:gid',
      {gid:'@_id', messageId: '@_messageId'},
      {
        get: {
          method: "GET",
          isArray:false,
          // Wrap challenges as ngResource so they have functions like $leave or $join
          transformResponse: function(data) {
            data = angular.fromJson(data);
            _.each(data && data.challenges, function(c) {
              angular.extend(c, Challenges.Challenge.prototype);
            });
            return data;
          }
        },

        syncParty: {method: "GET", url: '/api/v2/groups/party'},
        join: {method: "POST", url: ApiUrl.get() + '/api/v2/groups/:gid/join'},
        leave: {method: "POST", url: ApiUrl.get() + '/api/v2/groups/:gid/leave'},
        invite: {method: "POST", url: ApiUrl.get() + '/api/v2/groups/:gid/invite'},
        removeMember: {method: "POST", url: ApiUrl.get() + '/api/v2/groups/:gid/removeMember'},
        questAccept: {method: "POST", url: ApiUrl.get() + '/api/v2/groups/:gid/questAccept'},
        questReject: {method: "POST", url: ApiUrl.get() + '/api/v2/groups/:gid/questReject'},
        questCancel: {method: "POST", url: ApiUrl.get() + '/api/v2/groups/:gid/questCancel'},
        questAbort: {method: "POST", url: ApiUrl.get() + '/api/v2/groups/:gid/questAbort'},
        questLeave: {method: "POST", url: ApiUrl.get() + '/api/v2/groups/:gid/questLeave'}
      });

    function _syncUser() {
      User.sync();
    }

    function _logError(err) {
      console.log(err);
    }

    function party(cb) {
      if (!data.party) return (data.party = Group.get({gid: 'party'}, cb));
      return (cb) ? cb(party) : data.party;
    }

    function publicGuilds() {
      //TODO combine these as {type:'guilds,public'} and create a $filter() to separate them
      if (!data.publicGuilds) data.publicGuilds = Group.query({type:'public'});
      return data.publicGuilds;
    }

    function myGuilds() {
      if (!data.myGuilds) data.myGuilds = Group.query({type:'guilds'});
      return data.myGuilds;
    }

    function tavern() {
      if (!data.tavern) data.tavern = Group.get({gid:'habitrpg'});
      return data.tavern;
    }

    function questAccept(party) {
      Analytics.updateUser({'partyID':party.id,'partySize':party.memberCount});
      return party.$questAccept()
        .then(_syncUser, _logError);
    }

    function questReject(party) {
      Analytics.updateUser({'partyID':party.id,'partySize':party.memberCount});
      return party.$questReject()
        .then(_syncUser, _logError);
    }

    function questCancel(party) {
      Analytics.updateUser({'partyID':party.id,'partySize':party.memberCount});
      return party.$questCancel()
        .then(_syncUser, _logError);
    }

    function questAbort(party) {
      Analytics.updateUser({'partyID':party.id,'partySize':party.memberCount});
      return party.$questAbort()
        .then(_syncUser, _logError);
    }

    function questLeave(party) {
      Analytics.updateUser({'partyID':party.id,'partySize':party.memberCount});
      return party.$questLeave()
        .then(_syncUser, _logError);
    }

    function inviteOrStartParty(group) {
      if (group.type === "party" || $location.$$path === "/options/groups/party") {
        group.type = 'party';
        $rootScope.openModal('invite-party', {
          controller:'InviteToGroupCtrl',
          resolve: {
            injectedGroup: function(){ return group; }
          }
        });
      } else {
        Analytics.track({'hitType':'event','eventCategory':'button','eventAction':'click','eventLabel':'Invite Friends'});
        $location.path("/options/groups/party");
      }
    }

    return {
      party: party,
      publicGuilds: publicGuilds,
      myGuilds: myGuilds,
      tavern: tavern,
      questAccept: questAccept,
      questReject: questReject,
      questAbort: questAbort,
      questLeave: questLeave,
      questCancel: questCancel,
      inviteOrStartParty: inviteOrStartParty,

      data: data,
      Group: Group
    }
  }
})();
