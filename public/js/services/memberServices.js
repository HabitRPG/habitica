'use strict';

/**
 * Services that persists and retrieves user from localStorage.
 */

angular.module('memberServices', ['ngResource', 'sharedServices']).
    factory('Members', ['$rootScope', 'Shared', 'API_URL', '$resource',
      function($rootScope, Shared, API_URL, $resource) {
        var members = {};
        var Member = $resource(API_URL + '/api/v2/members/:uid', {uid:'@_id'});
        var memberServices = {

          Member: Member,

          members: members,

          /**
           * Allows us to lazy-load party / group / public members throughout the application.
           * @param obj - either a group or an individual member. If it's a group, we lazy-load all of its members.
           */
          populate: function(obj){

            function populateGroup(group){
              _.each(group.members, function(member){
                // meaning `populate('members')` wasn't run on the server, so we're getting the "in-database" form of
                // the members array, which is just a list of IDs - not the populated objects
                if (_.isString(member)) return;

                // lazy-load
                members[member._id] = member;
              })
            }

            // Array of groups
            if (_.isArray(obj)) {
              if (obj[0] && obj[0].members) {
                _.each(obj, function(group){
                  populateGroup(group);
                })
              }

            // Individual Group
            } else if (obj.members)
              populateGroup(obj);

            // individual Member
            if (obj._id) {
              members[obj._id] = obj;
            }
          },

          selectedMember: undefined,

          /**
           * Once users are populated, we fetch them throughout the application (eg, modals). This
           * either gets them or fetches if not available
           * @param uid
           */
          selectMember: function(uid) {
            var self = this;
            // Fetch from cache if we can. For guild members, only their uname will have been fetched on initial load,
            // check if they have full fields (eg, check profile.items and an item inside
            // because sometimes profile.items exists but it's empty like when user is fetched for party
            // and then for guild)
            // and if not, fetch them
            if (members[uid] && members[uid].items && members[uid].items.weapon) {
              Shared.wrap(members[uid],false);
              self.selectedMember = members[uid];
            } else {
              Member.get({uid: uid}, function(member){
                self.populate(member); // lazy load for later
                Shared.wrap(member,false);
                self.selectedMember = members[member._id];
              });
            }
          }
        }

        $rootScope.$on('userUpdated', function(event, user){
          memberServices.populate(user);
        })

        return memberServices;
      }
]);
