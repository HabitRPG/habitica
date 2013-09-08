'use strict';

/**
 * Services that persists and retrieves user from localStorage.
 */

angular.module('groupServices', ['ngResource']).
    factory('Groups', ['API_URL', '$resource', 'User', '$q', 'Members',
      function(API_URL, $resource, User, $q, Members) {
        var Group = $resource(API_URL + '/api/v1/groups/:gid',
          {gid:'@_id', messageId: '@_messageId'},
          {
            //'query': {method: "GET", isArray:false}
            postChat: {method: "POST", url: API_URL + '/api/v1/groups/:gid/chat'},
            deleteChatMessage: {method: "DELETE", url: API_URL + '/api/v1/groups/:gid/chat/:messageId'},
            join: {method: "POST", url: API_URL + '/api/v1/groups/:gid/join'},
            leave: {method: "POST", url: API_URL + '/api/v1/groups/:gid/leave'},
            invite: {method: "POST", url: API_URL + '/api/v1/groups/:gid/invite'}
          });

        // The user may not visit the public guilds, personal guilds, and tavern pages. So
        // we defer loading them to the html until they've clicked the tabs
        var partyQ = $q.defer(),
          guildsQ = $q.defer(),
          publicQ = $q.defer(),
          tavernQ = $q.defer();

        var groups = {
          party: partyQ.promise,
          guilds: guildsQ.promise,
          public: publicQ.promise,
          tavern: tavernQ.promise
        };

        // But we don't defer triggering Party, since we always need it for the header if nothing else
        Group.query({type:'party'}, function(_groups){
          partyQ.resolve(_groups[0]);
          Members.populate(_groups[0]);
        })

        return {
          // Note the _.once() to make sure it can never be called again
          fetchGuilds: _.once(function(){
            $('#loading-indicator').show();
            Group.query({type:'guilds'}, function(_groups){
              guildsQ.resolve(_groups);
              Members.populate(_groups);
              $('#loading-indicator').hide();
            })
            Group.query({type:'public'}, function(_groups){
              publicQ.resolve(_groups);
              Members.populate(_groups);
            })
          }),

          fetchTavern: _.once(function(){
            $('#loading-indicator').show();
            Group.query({type:'tavern'}, function(_groups){
              $('#loading-indicator').hide();
              tavernQ.resolve(_groups[0]);
              Members.populate(_groups[0]);
            })
          }),

          Group: Group,

          groups: groups

        }
      }
]);
