"use strict";

habitrpg.controller("ChallengesCtrl", ['$scope', 'User', 'Challenges', 'Notification', '$compile', 'Groups', '$state', 'API_URL', '$http',
  function($scope, User, Challenges, Notification, $compile, Groups, $state, API_URL, $http) {

    // FIXME get this from cache
    Groups.Group.query({type:'party,guilds,tavern'}, function(groups){
      $scope.groups = groups;
      $scope.search = {
        group: _.reduce(groups, function(m,g){m[g._id]=true;return m;}, {})
      };
    });
    // FIXME $scope.challenges needs to be resolved first (see app.js)
    $scope.challenges = Challenges.Challenge.query();
    // we should fix this, that's pretty brittle

//    $scope.$watch('search', function(search){
//      if (!search) $scope.filteredChallenges = $scope.challenges;
//      $scope.filteredChallenges = $filter('filter')($scope.challenges, function(chal) {
//        return (search.group[chal.group._id] &&
//          (typeof search._isMember == 'undefined' || search._isMember == chal._isMember));
//      })
//    })
    // TODO probably better to use $watch above, to avoid this being calculated on every digest cycle
    $scope.filterChallenges = function(chal){
      return (!$scope.search) ? true :
        ($scope.search.group[chal.group._id] &&
        (typeof $scope.search._isMember == 'undefined' || $scope.search._isMember == chal._isMember));
    }

    $scope.$watch('newChallenge.group', function(gid){
      if (!gid) return;
      var group = _.find($scope.groups, {_id:gid});
      $scope.maxPrize = User.user.balance*4 + ((group && group.balance && group.leader==User.user._id) ? group.balance*4 : 0);
    })


    //------------------------------------------------------------
    // Challenge
    //------------------------------------------------------------

    /**
     * Create
     */
    $scope.create = function() {
      $scope.obj = $scope.newChallenge = new Challenges.Challenge({
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
      challenge.$save(function(_challenge){
        if (isNew) {
          Notification.text('Challenge Created');
          $scope.discard();
          $scope.challenges.unshift(_challenge);
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
    $scope["delete"] = function(challenge, $index) {
      if (confirm("Delete challenge, are you sure?") !== true) return;
      challenge.$delete(function(){
        $state.go('options.challenges');
        $scope.challenges = Challenges.Challenge.query();
        User.log({});
      });
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
      if (!confirm("Are you sure you want to delete this task?")) return;
      //TODO persist
      // User.log({op: "delTask", data: task});
      list.splice($index, 1);
    };

    $scope.saveTask = function(task){
      task._editing = false;
      // TODO persist
    }

    /*
    --------------------------
     Subscription
    --------------------------
    */

    $scope.join = function(challenge){
      challenge.$join(function(){
        User.log({});
      });

    }

    $scope.leave = function(keep) {
      if (keep == 'cancel') {
        $scope.selectedChal = undefined;
      } else {
        $scope.selectedChal.$leave({keep:keep}, function(){
          User.log({});
        });
      }
      $scope.popoverEl.popover('destroy');
    }

    /**
     * Named "clickLeave" to distinguish between "actual" leave above, since this triggers the
     * "are you sure?" dialog.
     */
    $scope.clickLeave = function(chal, $event) {
      $scope.selectedChal = chal;
      $scope.popoverEl = $($event.target);
      var html = $compile(
        '<a ng-controller="ChallengesCtrl" ng-click="leave(\'remove-all\')">Remove Tasks</a><br/>\n<a ng-click="leave(\'keep-all\')">Keep Tasks</a><br/>\n<a ng-click="leave(\'cancel\')">Cancel</a><br/>'
      )($scope);
      $scope.popoverEl.popover('destroy').popover({
        html: true,
        placement: 'top',
        trigger: 'manual',
        title: 'Leave challenge and...',
        content: html
      }).popover('show');
    }

}]);