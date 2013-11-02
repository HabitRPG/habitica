'use strict';

/**
 * Services that persists and retrieves user from localStorage.
 */

angular.module('groupServices', ['ngResource']).
    factory('Groups', ['API_URL', '$resource', '$q',
      function(API_URL, $resource, $q) {
        var Group = $resource(API_URL + '/api/v1/groups/:gid',
          {gid:'@_id', messageId: '@_messageId'},
          {
            //query: {method: "GET", isArray:false},
            postChat: {method: "POST", url: API_URL + '/api/v1/groups/:gid/chat'},
            deleteChatMessage: {method: "DELETE", url: API_URL + '/api/v1/groups/:gid/chat/:messageId'},
            join: {method: "POST", url: API_URL + '/api/v1/groups/:gid/join'},
            leave: {method: "POST", url: API_URL + '/api/v1/groups/:gid/leave'},
            invite: {method: "POST", url: API_URL + '/api/v1/groups/:gid/invite'},
            removeMember: {method: "POST", url: API_URL + '/api/v1/groups/:gid/removeMember'}
          });

        // Defer loading everything until they're requested
        var party, myGuilds, publicGuilds, tavern;

        // But we don't defer triggering Party, since we always need it for the header if nothing else
        party = Group.get({gid: 'party'});

        return {
          party: function(){
            return party;
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
