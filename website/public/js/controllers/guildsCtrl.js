'use strict';

habitrpg.controller("GuildsCtrl", ['$scope', 'Groups', 'User', 'Challenges', '$rootScope', '$state', '$location', '$compile', 'Analytics',
    function($scope, Groups, User, Challenges, $rootScope, $state, $location, $compile, Analytics) {
      $scope.groups = {
        guilds: Groups.myGuilds(),
        "public": Groups.publicGuilds()
      }

      $scope.type = 'guild';
      $scope.text = window.env.t('guild');
      var newGroup = function(){
        return new Groups.Group({type:'guild', privacy:'private'});
      }
      $scope.newGroup = newGroup()
      $scope.create = function(group){
        if (User.user.balance < 1)
          return $rootScope.openModal('buyGems', {track:"Gems > Create Group"});

        if (confirm(window.env.t('confirmGuild'))) {
          group.$save(function(saved){
            if (saved.privacy == 'public') {Analytics.track({'hitType':'event','eventCategory':'behavior','eventAction':'join group','owner':true,'groupType':'guild','privacy':saved.privacy,'groupName':saved.name})}
            else {Analytics.track({'hitType':'event','eventCategory':'behavior','eventAction':'join group','owner':true,'groupType':'guild','privacy':saved.privacy})}
            $rootScope.hardRedirect('/#/options/groups/guilds/' + saved._id);
          });
        }
      }

      $scope.join = function(group){
        // If we're accepting an invitation, we don't have the actual group object, but a faux group object (for performance
        // purposes) {id, name}. Let's trick ngResource into thinking we have a group, so we can call the same $join
        // function (server calls .attachGroup(), which finds group by _id and handles this properly)
        if (group.id && !group._id) {
          group = new Groups.Group({_id:group.id});
        }

        group.$join(function(joined){
          if (joined.privacy == 'public') {Analytics.track({'hitType':'event','eventCategory':'behavior','eventAction':'join group','owner':false,'groupType':'guild','privacy':joined.privacy,'groupName':joined.name})}
          else {Analytics.track({'hitType':'event','eventCategory':'behavior','eventAction':'join group','owner':false,'groupType':'guild','privacy':joined.privacy})}
          $rootScope.hardRedirect('/#/options/groups/guilds/' + joined._id);
        })
      }

      $scope.leave = function(keep) {
         if (keep == 'cancel') {
           $scope.selectedGroup = undefined;
           $scope.popoverEl.popover('destroy');
         } else {
           Groups.Group.leave({gid: $scope.selectedGroup._id, keep:keep}, undefined, function(){
             $rootScope.hardRedirect('/#/options/groups/guilds');
           });
         }
      }

      $scope.clickLeave = function(group, $event){
          $scope.selectedGroup = group;
          $scope.popoverEl = $($event.target);
          var html, title;
          Challenges.Challenge.query(function(challenges) {
              challenges = _.pluck(_.filter(challenges, function(c) {
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

      $scope.reject = function(guild){
        var i = _.findIndex(User.user.invitations.guilds, {id:guild.id});
        if (~i){
          User.user.invitations.guilds.splice(i, 1);
          User.set({'invitations.guilds':User.user.invitations.guilds});
        }
      }
    }
  ]);
