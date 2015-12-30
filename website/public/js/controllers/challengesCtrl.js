habitrpg.controller("ChallengesCtrl", ['$rootScope','$scope', 'Shared', 'User', 'Challenges', 'Notification', '$compile', 'Groups', '$state', '$stateParams', 'Members', 'Tasks',
  function($rootScope, $scope, Shared, User, Challenges, Notification, $compile, Groups, $state, $stateParams, Members, Tasks) {

    // Use presence of cid to determine whether to show a list or a single
    // challenge
    $scope.cid = $state.params.cid;

    $scope.groupIdFilter = $stateParams.groupIdFilter;

    _getChallenges();

    // FIXME $scope.challenges needs to be resolved first (see app.js)
    $scope.groups = Groups.Group.query({type:'party,guilds,tavern'});

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

    $scope.editTask = Tasks.editTask;

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

      if(!defaultGroup) defaultGroup = 'habitrpg';

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

      _calculateMaxPrize(defaultGroup);
    };

    /**
     * Clone
     */
    $scope.clone = function(challenge) {
      var clonedTasks = {
        habit: [],
        daily: [],
        todo: [],
        reward: []
      };

      _(clonedTasks).each(function(val, type) {
        challenge[type + 's'].forEach(_cloneTaskAndPush);
      }).value();

      $scope.obj = $scope.newChallenge = new Challenges.Challenge({
        name: challenge.name,
        shortName: challenge.shortName,
        description: challenge.description,
        habits: clonedTasks.habit,
        dailys: clonedTasks.daily,
        todos: clonedTasks.todo,
        rewards: clonedTasks.reward,
        leader: User.user._id,
        group: challenge.group._id,
        official: challenge.official,
        prize: challenge.prize
      });

      function _cloneTaskAndPush(taskToClone) {
        var task = Tasks.cloneTask(taskToClone);
        clonedTasks[task.type].push(task);
      }
    };

    /**
     * Save
     */
    $scope.save = function(challenge) {
      if (!challenge.group) return alert(window.env.t('selectGroup'));

      var isNew = !challenge._id;

      if(isNew && challenge.prize > $scope.maxPrize) {
        return alert(window.env.t('challengeNotEnoughGems'));
      }

      challenge.$save(function(_challenge){
        if (isNew) {
          Notification.text(window.env.t('challengeCreated'));
          User.sync();
        }

        $state.transitionTo('options.social.challenges.detail', { cid: _challenge._id }, {
          reload: true, inherit: false, notify: true
        });
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
    $scope.cancelClosing = function(challenge) {
      $scope.popoverEl.popover('destroy');
      $scope.popoverEl = undefined;
      $scope.closingChal = undefined;
      challenge.winner = undefined;
    };

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
        _backToChallenges();
      });
    };

    $scope.selectWinner = function(challenge) {
      if (!challenge.winner) return;
      if (!confirm(window.env.t('youSure'))) return;
      challenge.$close({uid:challenge.winner}, function(){
        $scope.popoverEl.popover('destroy');
        _backToChallenges();
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
    };

    $scope.toggle = function(id){
      if($state.includes('options.social.challenges.detail', {cid: id})){
        $state.go('options.social.challenges')
      }else{
        $state.go('options.social.challenges.detail', {cid: id});
      }
    };

    $scope.toggleMember = function(cid, uid){
      if($state.includes('options.social.challenges.detail.member', {cid: cid, uid: uid})){
        $state.go('options.social.challenges.detail')
      }else{
        $state.go('options.social.challenges.detail.member', {cid: cid, uid: uid});
      }
    };

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
      if (!confirm(window.env.t('sureDelete', {taskType: window.env.t(task.type), taskText: task.text}))) return;
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
        _getChallenges()
        User.log({});
      });

    }

    $scope.leave = function(keep) {
      if (keep == 'cancel') {
        $scope.selectedChal = undefined;
      } else {
        $scope.selectedChal.$leave({keep:keep}, function(){
          _getChallenges()
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

    $scope.filterChallenges = function(chal){
      if (!$scope.search) return true;

      return _shouldShowChallenge(chal);
    }

    $scope.$watch('newChallenge.group', function(gid){
      if (!gid) return;

      _calculateMaxPrize(gid);

      if (gid == 'habitrpg') {
        $scope.newChallenge.prize = 1;
      }
    })

    $scope.selectAll = function(){
      $scope.search.group = _.transform($scope.groups, function(searchPool, group){
        searchPool[group._id] = true;
      });
    }

    $scope.selectNone = function(){
      $scope.search.group = _.transform($scope.groups, function(searchPool, group){
        searchPool[group._id] = false;
      });
    }

    $scope.shouldShow = function(task, list, prefs){
      return true;
    };

    $scope.insufficientGemsForTavernChallenge = function() {
      var balance = User.user.balance || 0;
      var isForTavern = $scope.newChallenge.group == 'habitrpg';

      if (isForTavern) {
        return balance <= 0;
      } else {
        return false;
      }
    }

    $scope.sendMessageToChallengeParticipant = function(uid) {
      Members.selectMember(uid, function(){
        $rootScope.openModal('private-message',{controller:'MemberModalCtrl'});
      });
    };

    $scope.sendGiftToChallengeParticipant = function(uid) {
      Members.selectMember(uid, function(){
        $rootScope.openModal('send-gift',{controller:'MemberModalCtrl'})
      });
    };

    $scope.filterInitialChallenges = function() {
      $scope.groupsFilter = _.uniq(_.pluck($scope.challenges, 'group'), function(g){return g._id});
      $scope.search = {
        group: _.transform($scope.groups, function(m,g){m[g._id]=true;}),
        _isMember: "either",
        _isOwner: "either"
      };
      //If we game from a group, then override the filter to that group

      if ($scope.groupIdFilter) {
        $scope.search.group = {};
        $scope.search.group[$scope.groupIdFilter] = true ;
      }
    }

    function _calculateMaxPrize(gid) {

      var userBalance = User.getBalanceInGems() || 0;
      var availableGroupBalance = _calculateAvailableGroupBalance(gid);

      $scope.maxPrize = userBalance + availableGroupBalance;
    }

    function _calculateAvailableGroupBalance(gid) {
      var groupBalance = 0;
      var group = _.find($scope.groups, { _id: gid });

      if (group && group.balance && group.leader === User.user._id) {
        groupBalance = group.balance * 4;
      }

      return groupBalance;
    }

    function _shouldShowChallenge(chal) {
      // Have to check that the leader object exists first in the
      // case where a challenge's leader deletes their account
      var userIsOwner = (chal.leader && chal.leader._id) === User.user.id;

      var groupSelected = $scope.search.group[chal.group._id];
      var checkOwner = $scope.search._isOwner === 'either' || (userIsOwner === $scope.search._isOwner);
      var checkMember = $scope.search._isMember === 'either' || (chal._isMember === $scope.search._isMember);

      return groupSelected && checkOwner && checkMember;
    }

    function _backToChallenges(){
      $scope.popoverEl.popover('destroy');
      $scope.cid = null;
      $state.go('options.social.challenges');
      $scope.challenges = Challenges.Challenge.query();
      User.log({});
    }


    // Fetch single challenge if a cid is present; fetch multiple challenges
    // otherwise
    function _getChallenges() {
      if ($scope.cid) {
        Challenges.Challenge.get({cid: $scope.cid}, function(challenge) {
          $scope.challenges = [challenge];
        });
      } else {
        Challenges.Challenge.query(function(challenges){
          $scope.challenges = challenges;
          $scope.filterInitialChallenges();
        });
      }
    };

}]);
