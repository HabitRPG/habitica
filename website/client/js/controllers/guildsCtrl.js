'use strict';

habitrpg.controller("GuildsCtrl", ['$scope', 'Groups', 'User', 'Challenges', '$rootScope', '$state', '$location', '$compile', 'Analytics', 'Pusher',
    function($scope, Groups, User, Challenges, $rootScope, $state, $location, $compile, Analytics, Pusher) {
      $scope.groups = {
        guilds: [],
        public: [],
      };

      Groups.myGuilds()
        .then(function (guilds) {
          $scope.groups.guilds = guilds;
        });

      Groups.publicGuilds()
        .then(function (guilds) {
          $scope.groups.public = guilds;
        });

      $scope.type = 'guild';
      $scope.text = window.env.t('guild');

      var newGroup = function(){
        return {type:'guild', privacy:'private'};
      }
      $scope.newGroup = newGroup()

      $scope.create = function(group){
        if (User.user.balance < 1) {
          return $rootScope.openModal('buyGems', {track:"Gems > Create Group"});
        }

        if (confirm(window.env.t('confirmGuild'))) {
          Groups.Group.create(group)
            .then(function (response) {
              var createdGroup = response.data.data;
              $rootScope.hardRedirect('/#/options/groups/guilds/' + createdGroup._id);
            });
        }
      }

      $scope.join = function (group) {
        var groupId = group._id;

        //  If we don't have the _id property, we are joining from an invitation
        //  which contains a id property of the group
        if (group.id && !group._id) {
          groupId = group.id;
        }

        Groups.Group.join(groupId)
          .then(function (response) {
            var joinedGroup = response.data.data;

            User.user.guilds.push(joinedGroup._id);

            _.pull(User.user.invitations.guilds, group);

            $location.path('/options/groups/guilds/' + joinedGroup._id);
          });
      }

      $scope.reject = function(invitationToReject) {
        var index = _.findIndex(User.user.invitations.guilds, function(invite) { return invite.id === invitationToReject.id; });
        User.user.invitations.guilds = User.user.invitations.guilds.splice(0, index);
        Groups.Group.rejectInvite(invitationToReject.id);
      }

      $scope.leave = function(keep) {
         if (keep == 'cancel') {
           $scope.selectedGroup = undefined;
           $scope.popoverEl.popover('destroy');
         } else {
           Groups.Group.leave($scope.selectedGroup._id, keep)
            .success(function (data) {
              var index = User.user.guilds.indexOf($scope.selectedGroup._id);
              delete User.user.guilds[index];
              $scope.selectedGroup = undefined;
              $location.path('/options/groups/guilds');
            });
         }
      }

      $scope.clickLeave = function(group, $event){
        $scope.selectedGroup = group;
        $scope.popoverEl = $($event.target).closest('.btn');

        var html, title;

        Challenges.getGroupChallenges(group._id)
        .then(function(response) {
          var challenges = _.pluck(_.filter(response.data.data, function(c) {
              return c.group._id == group._id;
          }), '_id');

          if (_.intersection(challenges, User.user.challenges).length > 0) {
              html = $compile(
                  '<a ng-controller="GroupsCtrl" ng-click="leave(\'remove-all\')">' + window.env.t('removeTasks') + '</a><br/>\n<a ng-click="leave(\'keep-all\')">' + window.env.t('keepTasks') + '</a><br/>\n<a ng-click="leave(\'cancel\')">' + window.env.t('cancel') + '</a><br/>'
              )($scope);
              title = window.env.t('leaveGroupCha');
          } else {
              html = $compile(
                  '<a ng-controller="GroupsCtrl" ng-click="leave(\'keep-all\')">' + window.env.t('confirm') + '</a><br/>\n<a ng-click="leave(\'cancel\')">' + window.env.t('cancel') + '</a><br/>'
              )($scope);
              title = window.env.t('leaveGroup')
          }

          $scope.popoverEl.popover('destroy').popover({
            html: true,
            placement: 'top',
            trigger: 'manual',
            title: title,
            content: html
          }).popover('show');
        });
      }
    }
  ]);
