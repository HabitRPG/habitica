'use strict';

/**
 * Services that persists and retrieves user from localStorage.
 */

angular.module('groupServices', ['ngResource']).
    factory('Groups', ['API_URL', '$resource', '$q',
      function(API_URL, $resource, $q) {
        var Group = $resource(API_URL + '/api/v2/groups/:gid',
          {gid:'@_id', messageId: '@_messageId'},
          {
            //query: {method: "GET", isArray:false},
            postChat: {method: "POST", url: API_URL + '/api/v2/groups/:gid/chat'},
            deleteChatMessage: {method: "DELETE", url: API_URL + '/api/v2/groups/:gid/chat/:messageId'},
            join: {method: "POST", url: API_URL + '/api/v2/groups/:gid/join'},
            leave: {method: "POST", url: API_URL + '/api/v2/groups/:gid/leave'},
            invite: {method: "POST", url: API_URL + '/api/v2/groups/:gid/invite'},
            removeMember: {method: "POST", url: API_URL + '/api/v2/groups/:gid/removeMember'},
            questAccept: {method: "POST", url: API_URL + '/api/v2/groups/:gid/questAccept'},
            questReject: {method: "POST", url: API_URL + '/api/v2/groups/:gid/questReject'},
            questAbort: {method: "POST", url: API_URL + '/api/v2/groups/:gid/questAbort'}
          });

        // Defer loading everything until they're requested
        var party, myGuilds, publicGuilds, tavern;

        return {
          party: function(cb){
            if (!party) return (party = Group.get({gid: 'party'}, cb));
            return (cb) ? cb(party) : party;
          },
          publicGuilds: function(){
            //TODO combine these as {type:'guilds,public'} and create a $filter() to separate them
            if (!publicGuilds) publicGuilds = Group.query({type:'public'});
            return publicGuilds;
          },
          myGuilds: function(){
            if (!myGuilds) myGuilds = Group.query({type:'guilds'});
            return myGuilds;
          },
          tavern: function(){
            if (!tavern) tavern = Group.get({gid:'habitrpg'});
            return tavern;
          },

          Group: Group
        }
      }
]);
