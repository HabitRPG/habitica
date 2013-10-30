"use strict";

habitrpg.controller("ChallengesCtrl", ['$scope', 'User', 'Challenges', 'Notification', '$compile', 'Groups',
  function($scope, User, Challenges, Notification, $compile, Groups) {

    // FIXME get this from cache
    Groups.Group.query(function(groups){
      groups.tavern[0].name = 'Tavern';
      $scope.groups = groups.party.concat(groups.guilds).concat(groups.tavern);
    });
    // FIXME $scope.challenges needs to be resolved first (see app.js)
    $scope.challenges = Challenges.Challenge.query();
    // we should fix this, that's pretty brittle

    //------------------------------------------------------------
    // Challenge
    //------------------------------------------------------------

    /**
     * Create
     */
    $scope.create = function() {
      $scope.newChallenge = new Challenges.Challenge({
        name: '',
        description: '',
        habits: [],
        dailys: [],
        todos: [],
        rewards: [],
        leader: User.user._id,
        group: null,
        timestamp: +(new Date),
        members: []
      });
    };

    /**
     * Save
     */
    $scope.save = function(challenge) {
      if (!challenge.group) return alert('Please select group');
      var isNew = !challenge._id;
      challenge.$save(function(){
        if (isNew) {
          Notification.text('Challenge Created');
          $scope.discard();
          Challenges.Challenge.query();
        } else {
          // TODO figure out a more elegant way about this
          //challenge._editing = false;
          challenge._locked = true;
        }
      });
    };

    /**
     * Discard
     */
    $scope.discard = function() {
      $scope.newChallenge = null;
    };


    /**
     * Delete
     */
    $scope["delete"] = function(challenge) {
      if (confirm("Delete challenge, are you sure?") !== true) return;
      challenge.$delete();
    };

    //------------------------------------------------------------
    // Tasks
    //------------------------------------------------------------

    $scope.addTask = function(addTo, listDef) {
      var task = window.habitrpgShared.helpers.taskDefaults({text: listDef.newTask, type: listDef.type});
      addTo.unshift(task);
      //User.log({op: "addTask", data: task}); //TODO persist
      delete listDef.newTask;
    };

    $scope.removeTask = function(list, $index) {
      if (confirm("Are you sure you want to delete this task?")) return;
      //TODO persist
      // User.log({
      //  op: "delTask",
      //  data: task
      //});
      list.splice($index, 1);
    };

    $scope.saveTask = function(task){
      task._editing = false;
      // TODO persist
    }

    /*
    --------------------------
     Unsubscribe functions
    --------------------------
    */

    $scope.unsubscribe = function(keep) {
      if (keep == 'cancel') {
        $scope.selectedChal = undefined;
      } else {
        $scope.selectedChal.$leave({keep:keep});
      }
      $scope.popoverEl.popover('destroy');
    }
    $scope.clickUnsubscribe = function(chal, $event) {
      $scope.selectedChal = chal;
      $scope.popoverEl = $($event.target);
      var html = $compile(
        '<a ng-controller="ChallengesCtrl" ng-click="unsubscribe(\'remove-all\')">Remove Tasks</a><br/>\n<a ng-click="unsubscribe(\'keep-all\')">Keep Tasks</a><br/>\n<a ng-click="unsubscribe(\'cancel\')">Cancel</a><br/>'
      )($scope);
      $scope.popoverEl.popover('destroy').popover({
        html: true,
        placement: 'top',
        trigger: 'manual',
        title: 'Unsubscribe From Challenge And:',
        content: html
      }).popover('show');
    }

}]);