"use strict";

habitrpg.controller('InviteToGroupCtrl', ['$scope', 'User', 'Groups', 'injectedGroup', '$http', 'Notification', function($scope, User, Groups, injectedGroup, $http, Notification) {
    $scope.group = injectedGroup;

    $scope.inviter = User.user.profile.name;
    $scope.emails = [{name:"",email:""},{name:"",email:""}];
    $scope.invitees = {uuid:""};

    $scope.inviteNewUsers = function(inviteMethod) {
      if (!$scope.group._id) {
        group.create($scope.newGroup, function() {
          _inviteByMethod(inviteMethod);
        });
      } else {
        _inviteByMethod(inviteMethod);
      }
    };

    function _inviteByMethod(inviteMethod) {
      if (inviteMethod === 'email') {
        Groups.Group.invite({gid: $scope.group._id}, {inviter: $scope.inviter, emails: $scope.emails}, function(){
          Notification.text(window.env.t('invitationsSent'));
          $scope.emails = [{name:'',email:''},{name:'',email:''}];
        }, function(){
          $scope.emails = [{name:'',email:''},{name:'',email:''}];
        });
      }
      else if (inviteMethod === 'uuid') {
        Groups.Group.invite({gid: $scope.group._id}, {uuids: [$scope.invitees.uuid]}, function(){
          Notification.text(window.env.t('invitationsSent'));
          $scope.invitees = {uuid:""};
        }, function(){
          $scope.invitees = {uuid:""};
        });
      }
      else {
        return console.log('Invalid invite method.')
      }
    }
  }]);
