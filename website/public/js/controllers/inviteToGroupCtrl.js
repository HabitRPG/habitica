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
      _inviteByMethod(inviteMethod);
    };

    function _inviteByMethod(inviteMethod) {
      if (inviteMethod === 'email') {
        Groups.Group.invite({gid: $scope.group._id}, {inviter: $scope.inviter, emails: $scope.emails}, function(){
          Notification.text(window.env.t('invitationsSent'));
          _resetInvitees();
        }, function(){
          _resetInvitees();
        });
      }
      else if (inviteMethod === 'uuid') {
        var uuids = _getOnlyUuids();
        Groups.Group.invite({gid: $scope.group._id}, {uuids: uuids}, function(){
          Notification.text(window.env.t('invitationsSent'));
          _resetInvitees();
        }, function(){
          _resetInvitees();
        });
      }
      else {
        return console.log('Invalid invite method.')
      }
    }

    function _getOnlyUuids() {
      var uuids = _.pluck($scope.invitees, 'uuid');
      var filteredUuids = _.filter(uuids, function(id) {
        return id != '';
      });
      return filteredUuids;
    }

    function _resetInvitees() {
      var emptyEmails = [{name:"",email:""},{name:"",email:""}];
      var emptyInvitees = [{uuid: ''}];

      $scope.emails = emptyEmails;
      $scope.invitees = emptyInvitees;
    }
  }]);
