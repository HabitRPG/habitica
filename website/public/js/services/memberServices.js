'use strict';
(function(){
  angular
    .module('habitrpg')
    .factory('Members', membersFactory);

  membersFactory.$inject = [
    '$rootScope',
    'Shared',
    'ApiUrl',
    '$resource'
  ];

  function membersFactory($rootScope, Shared, ApiUrl, $resource) {
    var members = {};
    var fetchMember = $resource(ApiUrl.get() + '/api/v2/members/:uid', { uid: '@_id' }).get;

    function selectMember(uid, cb) {

      var self = this;
      var memberIsReady = _checkIfMemberIsReady(members[uid]);

      if (memberIsReady) {
        _prepareMember(self, members[uid], cb);
      } else {
        fetchMember({ uid: uid }, function(member) {
          addToMembersList(member); // lazy load for later
          _prepareMember(self, member, cb);
        });
      }
    }

    function addToMembersList(member){
      if (member._id) {
        members[member._id] = member;
      }
    }

    function _checkIfMemberIsReady(member) {
      return member && member.items && member.items.weapon;
    }

    function _prepareMember(self, member, cb) {
      Shared.wrap(member, false);
      self.selectedMember = members[member._id];
      cb();
    }

    $rootScope.$on('userUpdated', function(event, user){
      addToMembersList(user);
    })

    return {
      members: members,
      addToMembersList: addToMembersList,
      selectedMember: undefined,
      selectMember: selectMember
    }
  }
}());
