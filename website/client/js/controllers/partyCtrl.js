'use strict';

habitrpg.controller("PartyCtrl", ['$rootScope','$scope','Groups','Chat','User','Challenges','$state','$compile','Analytics','Quests','Social', 'Achievement',
    function($rootScope, $scope, Groups, Chat, User, Challenges, $state, $compile, Analytics, Quests, Social, Achievement) {

      var PARTY_LOADING_MESSAGES = 4;

      var user = User.user;

      $scope.type = 'party';
      $scope.text = window.env.t('party');
      $scope.group = {loadingParty: true};

      $scope.inviteOrStartParty = Groups.inviteOrStartParty;
      $scope.loadWidgets = Social.loadWidgets;

      // Random message between 1 and PARTY_LOADING_MESSAGES
      var partyMessageNumber = Math.floor(Math.random() * PARTY_LOADING_MESSAGES) + 1;
      $scope.partyLoadingMessage = window.env.t('partyLoading' + partyMessageNumber);

      function handlePartyResponse (group) {
        // Assign and not replace so that all the references get the modifications
        _.assign($rootScope.party, group);
        $scope.group = $rootScope.party;
        $scope.group.loadingParty = false;
        checkForNotifications();
        if ($state.is('options.social.party')) {
          if ('Notification' in window && window.Notification.permission === 'default') {
            setTimeout(function () {
              var notifsModal = $rootScope.openModal('enableDesktopNotifications', {
                backdrop: true,
                windowClass: 'vertically-centered-modals',
              });

              // Safari doesn't support promises
              var isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

              function closeModal () { notifsModal.close(); }
              if (isSafari) {
                window.Notification.requestPermission(closeModal);
              } else {
                window.Notification.requestPermission().then(closeModal);
              }
            }, 100);
          }
          Chat.markChatSeen($scope.group._id);
        }
      }

      function handlePartyError (response) {
        $rootScope.party = $scope.group = $scope.newGroup = { type: 'party' };
      }

      if ($state.is('options.social.party') && $rootScope.party && $rootScope.party.id) {
        Groups.party().then(handlePartyResponse, handlePartyError);
      } else {
        Groups.Group.syncParty().then(handlePartyResponse, handlePartyError);
      }

      function checkForNotifications () {
        // Checks if user's party has reached 2 players for the first time.
        if(!user.achievements.partyUp
            && $scope.group.memberCount >= 2) {
          User.set({'achievements.partyUp':true});
          Achievement.displayAchievement('partyUp');
        }

        // Checks if user's party has reached 4 players for the first time.
        if(!user.achievements.partyOn
            && $scope.group.memberCount >= 4) {
          User.set({'achievements.partyOn':true});
          Achievement.displayAchievement('partyOn');
        }
      }

      $scope.create = function(group) {
        group.loadingParty = true;

        if (!group.name) group.name = env.t('possessiveParty', {name: User.user.profile.name});
        Groups.Group.create(group)
          .then(function(response) {
            Analytics.updateUser({'party.id': $scope.group ._id, 'partySize': 1});
            $rootScope.hardRedirect('/#/options/groups/party');
          });
      };

      $scope.join = function (party) {
        Groups.Group.join(party.id)
          .then(function (response) {
            $rootScope.party = $scope.group = response.data.data;
            User.sync();
            Analytics.updateUser({'partyID': party.id});
            $rootScope.hardRedirect('/#/options/groups/party');
          });
      };

      // TODO: refactor guild and party leave into one function
      $scope.leave = function (keep) {
        if (keep == 'cancel') {
          $scope.selectedGroup = undefined;
          $scope.popoverEl.popover('destroy');
        } else {
          Groups.Group.leave($scope.selectedGroup._id, keep)
            .then(function (response) {
              Analytics.updateUser({'partySize':null,'partyID':null});
              User.sync().then(function () {
                $rootScope.hardRedirect('/#/options/groups/party');
              });
            });
        }
      };

      // TODO: refactor guild and party clickLeave into one function
      $scope.clickLeave = function(group, $event){
          Analytics.track({'hitType':'event','eventCategory':'button','eventAction':'click','eventLabel':'Leave Party'});
          $scope.selectedGroup = group;
          $scope.popoverEl = $($event.target).closest('.btn');
          var html, title;
          html = $compile('<a ng-controller="GroupsCtrl" ng-click="leave(\'remove-all\')">' + window.env.t('removeTasks') + '</a><br/>\n<a ng-click="leave(\'keep-all\')">' + window.env.t('keepTasks') + '</a><br/>\n<a ng-click="leave(\'cancel\')">' + window.env.t('cancel') + '</a><br/>')($scope);
          title = window.env.t('leavePartyCha');

          //TODO: Move this to challenge service
          Challenges.getGroupChallenges(group._id)
          .then(function(response) {
              var challenges = _.pluck(_.filter(response.data.data, function(c) {
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

      $scope.clickStartQuest = function () {
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
          Groups.Group.leave(Groups.data.party._id, false)
            .then(function() {
              $rootScope.party = $scope.group = {
                loadingParty: true
              };
              $scope.join({ id: newPartyId, name: newPartyName });
            });
        }
      }

      $scope.reject = function(party) {
        Groups.Group.rejectInvite(party.id).then(function () {
          User.sync();
        });
      }

      $scope.questInit = function() {
        var key = $rootScope.selectedQuest.key;

        Quests.initQuest(key).then(function() {
          $rootScope.selectedQuest = undefined;
          $scope.$close();
        });
      };

      $scope.questCancel = function(){
        if (!confirm(window.env.t('sureCancel'))) return;

        Quests.sendAction('quests/cancel')
          .then(function(quest) {
            $scope.group.quest = quest;
          });
      }

      $scope.questAbort = function(){
        if (!confirm(window.env.t('sureAbort'))) return;
        if (!confirm(window.env.t('doubleSureAbort'))) return;

        Quests.sendAction('quests/abort')
          .then(function(quest) {
            $scope.group.quest = quest;
          });
      }

      $scope.questLeave = function(){
        if (!confirm(window.env.t('sureLeave'))) return;

        Quests.sendAction('quests/leave')
          .then(function(quest) {
            $scope.group.quest = quest;
          });
      }

      $scope.questAccept = function(){
        Quests.sendAction('quests/accept')
          .then(function(quest) {
            $scope.group.quest = quest;
          });
      };

      $scope.questForceStart = function(){
        Quests.sendAction('quests/force-start')
          .then(function(quest) {
            $scope.group.quest = quest;
          });
      };

      $scope.questReject = function(){
        Quests.sendAction('quests/reject')
          .then(function(quest) {
            $scope.group.quest = quest;
          });
      };

      $scope.canEditQuest = function() {
        var isQuestLeader = $scope.group.quest && $scope.group.quest.leader === User.user._id;

        return isQuestLeader;
      };
    }
  ]);
