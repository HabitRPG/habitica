'use strict';

/**
 * Services that persists and retrieves user from localStorage.
 */

angular.module('memberServices', ['ngResource']).
    factory('Members', ['API_URL', '$resource',
      function(API_URL, $resource) {
        var members = {};
        var Member = $resource(API_URL + '/api/v1/members/:uid', {uid:'@_id'});
        return {

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
            // check if they have full fields (eg, check profile.items) and if not, fetch them
            if (members[uid] && members[uid].items) {
              self.selectedMember = members[uid];
            } else {
              Member.get({uid: uid}, function(member){
                self.populate(member); // lazy load for later
                self.selectedMember = members[member._id];
              });
            }
          }
        }
      }
]);
