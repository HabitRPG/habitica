'use strict';

habitrpg.controller('InviteToGroupCtrl', ['$scope', '$rootScope', 'User', 'Groups', 'injectedGroup', '$http', 'Notification',
  function($scope, $rootScope, User, Groups, injectedGroup, $http, Notification) {
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

        return Groups.Group.create($scope.group)
          .then(function(response) {
            $scope.group = response.data.data;
            User.sync();
            Groups.data.party = $scope.group;
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

      Groups.Group.invite($scope.group._id, invitationDetails)
        .then(function() {
          Notification.text(window.env.t('invitationsSent'));
          _resetInvitees();
          var redirectTo = '/#/options/groups/'
          if ($scope.group.type === 'party') {
            redirectTo += 'party';
          } else {
            redirectTo += ('guilds/' + $scope.group._id);
          }

          $rootScope.hardRedirect(redirectTo);
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
