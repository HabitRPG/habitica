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
        .then(function () {
           var invitesSent = invitationDetails.emails || invitationDetails.uuids;
           var invitationString = invitesSent.length > 1 ? 'invitationsSent' : 'invitationSent';

           Notification.text(window.env.t(invitationString));

           _resetInvitees();

          if ($scope.group.type === 'party') {
            $rootScope.hardRedirect('/#/options/groups/party');
          } else {
            $rootScope.hardRedirect('/#/options/groups/guilds/' + $scope.group._id);
          }
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
