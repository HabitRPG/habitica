'use strict';

/**
 * Services that persists and retrieves user from localStorage.
 */

angular.module('groupServices', ['ngResource', 'challengeServices']).
    factory('Groups', ['ApiUrlService', '$resource', '$q', '$http', 'User', 'Challenges',
      function(ApiUrlService, $resource, $q, $http, User, Challenges) {

        var Group = $resource(ApiUrlService.get() + '/api/v2/groups/:gid',
          {gid:'@_id', messageId: '@_messageId'},
          {
            get: {
              method: "GET",
              isArray:false,
              // Wrap challenges as ngResource so they have functions like $leave or $join
              transformResponse: function(data, headers) {
                data = angular.fromJson(data);
                _.each(data && data.challenges, function(c) {
                  angular.extend(c, Challenges.Challenge.prototype);
                });
                return data;
              }
            },

            postChat: {method: "POST", url: ApiUrlService.get() + '/api/v2/groups/:gid/chat'},
            deleteChatMessage: {method: "DELETE", url: ApiUrlService.get() + '/api/v2/groups/:gid/chat/:messageId'},
            flagChatMessage: {method: "POST", url: ApiUrlService.get() + '/api/v2/groups/:gid/chat/:messageId/flag'},
            clearFlagCount: {method: "POST", url: ApiUrlService.get() + '/api/v2/groups/:gid/chat/:messageId/clearflags'},
            join: {method: "POST", url: ApiUrlService.get() + '/api/v2/groups/:gid/join'},
            leave: {method: "POST", url: ApiUrlService.get() + '/api/v2/groups/:gid/leave'},
            invite: {method: "POST", url: ApiUrlService.get() + '/api/v2/groups/:gid/invite'},
            removeMember: {method: "POST", url: ApiUrlService.get() + '/api/v2/groups/:gid/removeMember'},
            questAccept: {method: "POST", url: ApiUrlService.get() + '/api/v2/groups/:gid/questAccept'},
            questReject: {method: "POST", url: ApiUrlService.get() + '/api/v2/groups/:gid/questReject'},
            questCancel: {method: "POST", url: ApiUrlService.get() + '/api/v2/groups/:gid/questCancel'},
            questAbort: {method: "POST", url: ApiUrlService.get() + '/api/v2/groups/:gid/questAbort'}
          });

        // Defer loading everything until they're requested
        var data = {party: undefined, myGuilds: undefined, publicGuilds: undefined, tavern: undefined};

        return {
          party: function(cb){
            if (!data.party) return (data.party = Group.get({gid: 'party'}, cb));
            return (cb) ? cb(party) : data.party;
          },
          publicGuilds: function(){
            //TODO combine these as {type:'guilds,public'} and create a $filter() to separate them
            if (!data.publicGuilds) data.publicGuilds = Group.query({type:'public'});
            return data.publicGuilds;
          },
          myGuilds: function(){
            if (!data.myGuilds) data.myGuilds = Group.query({type:'guilds'});
            return data.myGuilds;
          },
          tavern: function(){
            if (!data.tavern) data.tavern = Group.get({gid:'habitrpg'});
            return data.tavern;
          },

          // On enter, set chat message to "seen"
          seenMessage: function(gid){
            $http.post(ApiUrlService.get() + '/api/v2/groups/'+gid+'/chat/seen');
            if (User.user.newMessages) delete User.user.newMessages[gid];
          },

          // Pass reference to party, myGuilds, publicGuilds, tavern; inside data in order to
          // be able to modify them directly (otherwise will be stick with cached version)
          data: data,

          Group: Group
        }
      }
    ])
/**
 * TODO Get this working. Make ChatService it's own ngResource, so we can update chat without having to sync the whole
 * group object (expensive). Also so we can add chat-specific routes
 */
//    .factory('Chat', ['API_URL', '$resource',
//      function(API_URL, $resource) {
//        var Chat = $resource(API_URL + '/api/v2/groups/:gid/chat/:mid',
//          //{gid:'@_id', mid: '@_messageId'},
//          {
//            like: {method: 'POST', url: API_URL + '/api/v2/groups/:gid/chat/:mid'}
//            //postChat: {method: "POST", url: API_URL + '/api/v2/groups/:gid/chat'},
//            //deleteChatMessage: {method: "DELETE", url: API_URL + '/api/v2/groups/:gid/chat/:messageId'},
//          });
//        return {Chat:Chat};
//      }
//    ]);
