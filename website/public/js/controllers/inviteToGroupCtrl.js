'use strict';

habitrpg.controller('InviteToGroupCtrl', ['$scope', 'User', 'Groups', 'injectedGroup', '$http', 'Notification', function($scope, User, Groups, injectedGroup, $http, Notification) {
    $scope.group = injectedGroup;

    $scope.inviter = User.user.profile.name;
    _resetInvitees();

    $scope.addUuid = function() {
      $scope.invitees.push({uuid: ''});
    };

    $scope.addEmail = function() {
      $scope.emails.push({name: '', email: ''});
    };

    $scope.inviteNewUsers = function(inviteMethod) {
      if (!$scope.group._id) {
        $scope.group.name = $scope.group.name || env.t('possessiveParty', {name: User.user.profile.name});
        return $scope.group.$save()
          .then(function(res) {
            _inviteByMethod(inviteMethod);
          });
      }

      _inviteByMethod(inviteMethod);
    };

    function _inviteByMethod(inviteMethod) {
      var invitationDetails;

      if (inviteMethod === 'email') {
        var emails = _getEmails();
        invitationDetails = {inviter: $scope.inviter, emails: emails};
      } else if (inviteMethod === 'uuid') {
        var uuids = _getOnlyUuids();
        invitationDetails = {uuids: uuids};
      } else {
        return console.log('Invalid invite method.')
      }

      Groups.Group.invite({gid: $scope.group._id}, invitationDetails, function(){
        Notification.text(window.env.t('invitationsSent'));
        _resetInvitees();
      }, function(){
        _resetInvitees();
      });
    }

    function _getOnlyUuids() {
      var uuids = _.pluck($scope.invitees, 'uuid');
      var filteredUuids = _.filter(uuids, function(id) {
        return id != '';
      });
      return filteredUuids;
    }

    function _getEmails() {
      var emails = _.filter($scope.emails, function(obj) {
          return obj.email != '';
      });
      return emails;
    }

    function _resetInvitees() {
      var emptyEmails = [{name:"",email:""},{name:"",email:""}];
      var emptyInvitees = [{uuid: ''}];

      $scope.emails = emptyEmails;
      $scope.invitees = emptyInvitees;
    }
  }]);
