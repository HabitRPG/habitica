'use strict';

habitrpg.controller("PartyCtrl", ['$rootScope','$scope','Groups','Chat','User','Challenges','$state','$compile','Analytics','Quests','Social',
    function($rootScope,$scope,Groups,Chat,User,Challenges,$state,$compile,Analytics,Quests,Social) {
      $scope.type = 'party';
      $scope.text = window.env.t('party');
      $scope.group = $rootScope.party = Groups.party();
      $scope.newGroup = new Groups.Group({type:'party'});
      $scope.inviteOrStartParty = Groups.inviteOrStartParty;
      $scope.loadWidgets = Social.loadWidgets;

      if ($state.is('options.social.party')) {
        $scope.group.$syncParty(); // Sync party automatically when navigating to party page
      }

      Chat.seenMessage($scope.group._id);

      $scope.create = function(group){
        if (!group.name) group.name = env.t('possessiveParty', {name: User.user.profile.name});
        group.$save(function(){
          Analytics.track({'hitType':'event','eventCategory':'behavior','eventAction':'join group','owner':true,'groupType':'party','privacy':'private'});
          Analytics.updateUser({'partyID':group.id,'partySize':1});
          $rootScope.hardRedirect('/#/options/groups/party');
        });
      };

      $scope.join = function(party){
        var group = new Groups.Group({_id: party.id, name: party.name});
        group.$join(function(){
          Analytics.track({'hitType':'event','eventCategory':'behavior','eventAction':'join group','owner':false,'groupType':'party','privacy':'private'});
          Analytics.updateUser({'partyID':party.id});
          $rootScope.hardRedirect('/#/options/groups/party');
        });
      };

      // TODO: refactor guild and party leave into one function
      $scope.leave = function(keep) {
        if (keep == 'cancel') {
          $scope.selectedGroup = undefined;
          $scope.popoverEl.popover('destroy');
        } else {
          Groups.Group.leave({gid: $scope.selectedGroup._id, keep:keep}, undefined, function(){
            Analytics.updateUser({'partySize':null,'partyID':null});
            $rootScope.hardRedirect('/#/options/groups/party');
          });
        }
      };

      // TODO: refactor guild and party clickLeave into one function
      $scope.clickLeave = function(group, $event){
          Analytics.track({'hitType':'event','eventCategory':'button','eventAction':'click','eventLabel':'Leave Party'});
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
                  title = window.env.t('leavePartyCha');
              } else {
                  html = $compile(
                      '<a ng-controller="GroupsCtrl" ng-click="leave(\'keep-all\')">' + window.env.t('confirm') + '</a><br/>\n<a ng-click="leave(\'cancel\')">' + window.env.t('cancel') + '</a><br/>'
                  )($scope);
                  title = window.env.t('leaveParty');
              }
          $scope.popoverEl.popover('destroy').popover({
              html: true,
              placement: 'top',
              trigger: 'manual',
                  title: title,
              content: html
          }).popover('show');
          });
      };

      $scope.clickStartQuest = function(){
        Analytics.track({'hitType':'event','eventCategory':'button','eventAction':'click','eventLabel':'Start a Quest'});
        var hasQuests = _.find(User.user.items.quests, function(quest) {
          return quest > 0;
        });

        if (hasQuests){
          $rootScope.openModal("ownedQuests", { controller:"InventoryCtrl" });
        } else {
          $rootScope.$state.go('options.inventory.quests');
        }
      };

      $scope.leaveOldPartyAndJoinNewParty = function(newPartyId, newPartyName) {
        if (confirm('Are you sure you want to delete your party and join ' + newPartyName + '?')) {
          Groups.Group.leave({gid: Groups.party()._id, keep:false}, undefined, function() {
            $scope.group = {
              loadingNewParty: true
            };
            $scope.join({ id: newPartyId, name: newPartyName });
          });
        }
      }

      $scope.reject = function(){
        User.set({'invitations.party':{}});
      }

      $scope.questCancel = function(){
        if (!confirm(window.env.t('sureCancel'))) return;

        Quests.sendAction('questCancel')
          .then(function(quest) {
            $scope.group.quest = quest;
          });
      }

      $scope.questAbort = function(){
        if (!confirm(window.env.t('sureAbort'))) return;
        if (!confirm(window.env.t('doubleSureAbort'))) return;

        Quests.sendAction('questAbort')
          .then(function(quest) {
            $scope.group.quest = quest;
          });
      }

      $scope.questLeave = function(){
        if (!confirm(window.env.t('sureLeave'))) return;

        Quests.sendAction('questLeave')
          .then(function(quest) {
            $scope.group.quest = quest;
          });
      }

      $scope.questAccept = function(){
        Quests.sendAction('questAccept')
          .then(function(quest) {
            $scope.group.quest = quest;
          });
      };

      $scope.questReject = function(){
        Quests.sendAction('questReject')
          .then(function(quest) {
            $scope.group.quest = quest;
          });
      };

      $scope.canEditQuest = function(party) {
        var isQuestLeader = party.quest && party.quest.leader === User.user._id;

        return isQuestLeader;
      };
    }
  ]);
