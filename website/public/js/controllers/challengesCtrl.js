"use strict";

habitrpg.controller("ChallengesCtrl", ['$rootScope','$scope', 'Shared', 'User', 'Challenges', 'Notification', '$compile', 'Groups', '$state', '$stateParams',
  function($rootScope, $scope, Shared, User, Challenges, Notification, $compile, Groups, $state, $stateParams) {

    // Use presence of cid to determine whether to show a list or a single
    // challenge
    $scope.cid = $state.params.cid;

    // Fetch single challenge if a cid is present; fetch multiple challenges
    // otherwise
    var getChallenges = function() {
      if ($scope.cid) {
        Challenges.Challenge.get({cid: $scope.cid}, function(challenge) {
          $scope.challenges = [challenge];
        });
      } else {
        Challenges.Challenge.query(function(challenges){
          $scope.challenges = challenges;
          $scope.groupsFilter = _.uniq(_.pluck(challenges, 'group'), function(g){return g._id});
          $scope.search = {
            group: _.transform($scope.groups, function(m,g){m[g._id]=true;})
          };
        });
      }
    };

    getChallenges();

    // FIXME $scope.challenges needs to be resolved first (see app.js)
    $scope.groups = Groups.Group.query({type:'party,guilds,tavern'});


    // we should fix this, that's pretty brittle

    // override score() for tasks listed in challenges-editing pages, so that nothing happens
    $scope.score = function(){}

    //------------------------------------------------------------
    // Challenge
    //------------------------------------------------------------

    // Use this to force the top view to change, not just the nested view.
    $scope.edit = function(challenge) {
      $state.transitionTo('options.social.challenges.edit', {cid: challenge._id}, {
        reload: true, inherit: false, notify: true
      });
    };

    /**
     * Create
     */
    $scope.create = function() {

      //If the user has one filter selected, assume that the user wants to default to that group
      var defaultGroup;
      //Our filters contain all groups, but we only want groups that have atleast one challenge
      var groupsWithChallenges = _.uniq(_.pluck($scope.groupsFilter, '_id'));
      var len = groupsWithChallenges.length;
      var filterCount = 0;

      for ( var i = 0; i < len; i += 1 ) {
        if ( $scope.search.group[groupsWithChallenges[i]] == true ) {
          filterCount += 1;
          defaultGroup = groupsWithChallenges[i];
        }
        if (filterCount > 1) {
          defaultGroup = $scope.groups[0]._id
          break;
        }
      }

      $scope.obj = $scope.newChallenge = new Challenges.Challenge({
        name: '',
        description: '',
        habits: [],
        dailys: [],
        todos: [],
        rewards: [],
        leader: User.user._id,
        group: defaultGroup,
        timestamp: +(new Date),
        members: [],
        official: false
      });
    };

    /**
     * Save
     */
    $scope.save = function(challenge) {
      if (!challenge.group) return alert(window.env.t('selectGroup'));
      var isNew = !challenge._id;
      challenge.$save(function(_challenge){
        if (isNew) {
          Notification.text(window.env.t('challengeCreated'));
          $state.go('options.social.challenges.detail', {cid: _challenge._id});
          $scope.discard();
          $scope.challenges = Challenges.Challenge.query();
          User.sync();
        } else {
          // TODO figure out a more elegant way about this
          //challenge._editing = false;
          challenge._locked = true;
          getChallenges();
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
     * Close Challenge
     * ------------------
     */
    function backToChallenges(){
      $scope.popoverEl.popover('destroy');
      $scope.cid = null;
      $state.go('options.social.challenges');
      $scope.challenges = Challenges.Challenge.query();
      User.log({});
    }
    $scope.cancelClosing = function(challenge) {
      $scope.popoverEl.popover('destroy');
      $scope.popoverEl = undefined;
      $scope.closingChal = undefined;
      challenge.winner = undefined;
    }
    $scope["delete"] = function(challenge) {
      var warningMsg;
      if(challenge.group._id == 'habitrpg') {
        warningMsg = window.env.t('sureDelChaTavern');
      } else {
        warningMsg = window.env.t('sureDelCha');
      }
      if (!confirm(warningMsg)) return;
      challenge.$delete(function(){
        $scope.popoverEl.popover('destroy');
        backToChallenges();
      });
    };
    $scope.selectWinner = function(challenge) {
      if (!challenge.winner) return;
      if (!confirm(window.env.t('youSure'))) return;
      challenge.$close({uid:challenge.winner}, function(){
        $scope.popoverEl.popover('destroy');
        backToChallenges();
      })
    }
    $scope.close = function(challenge, $event) {
      $scope.closingChal = challenge;
      $scope.popoverEl = $($event.target);
      var html = $compile('<div><div ng-include="\'partials/options.social.challenges.detail.close.html\'" /></div></div>')($scope);
      $scope.popoverEl.popover('destroy').popover({
        html: true,
        placement: 'right',
        trigger: 'manual',
        title: window.env.t('closeCha'),
        content: html
      }).popover('show');

    }

    $scope.toggle = function(id){
      if($state.includes('options.social.challenges.detail', {cid: id})){
        $state.go('options.social.challenges')
      }else{
        $state.go('options.social.challenges.detail', {cid: id});
      }
    }

    $scope.toggleMember = function(cid, uid){
      if($state.includes('options.social.challenges.detail.member', {cid: cid, uid: uid})){
        $state.go('options.social.challenges.detail')
      }else{
        $state.go('options.social.challenges.detail.member', {cid: cid, uid: uid});
      }
    }

    //------------------------------------------------------------
    // Tasks
    //------------------------------------------------------------

    $scope.addTask = function(addTo, listDef) {
      var task = Shared.taskDefaults({text: listDef.newTask, type: listDef.type});
      addTo.unshift(task);
      //User.log({op: "addTask", data: task}); //TODO persist
      delete listDef.newTask;
    };

    $scope.removeTask = function(task, list) {
      if (!confirm(window.env.t('sureDelete'))) return;
      //TODO persist
      // User.log({op: "delTask", data: task});
      _.remove(list, task);
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
        getChallenges()
        User.log({});
      });

    }

    $scope.leave = function(keep) {
      if (keep == 'cancel') {
        $scope.selectedChal = undefined;
      } else {
        $scope.selectedChal.$leave({keep:keep}, function(){
          getChallenges()
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
        '<a ng-controller="ChallengesCtrl" ng-click="leave(\'remove-all\')">' + window.env.t('removeTasks') + '</a><br/>\n<a ng-click="leave(\'keep-all\')">' + window.env.t('keepTasks') + '</a><br/>\n<a ng-click="leave(\'cancel\')">' + window.env.t('cancel') + '</a><br/>'
      )($scope);
      $scope.popoverEl.popover('destroy').popover({
        html: true,
        placement: 'top',
        trigger: 'manual',
        title: window.env.t('leaveCha'),
        content: html
      }).popover('show');
    }

    //------------------------------------------------------------
    // Filtering
    //------------------------------------------------------------

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
      if (gid == 'habitrpg') $scope.newChallenge.prize = 1;
    })

    $scope.selectAll = function(){
      $scope.search.group = _.transform($scope.groups, function(m,g){m[g._id] = true});
    }

    $scope.selectNone = function(){
      $scope.search.group = _.transform($scope.groups, function(m,g){m[g._id] = false});
    }

   $scope.shouldShow = function(task, list, prefs){
     return true;
   };
}]);
