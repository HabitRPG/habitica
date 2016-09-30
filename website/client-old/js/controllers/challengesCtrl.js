habitrpg.controller("ChallengesCtrl", ['$rootScope','$scope', 'Shared', 'User', 'Tasks', 'Challenges', 'Notification', '$compile', 'Groups', '$state', '$stateParams', 'Members', 'Tasks', 'TAVERN_ID',
  function($rootScope, $scope, Shared, User, Tasks, Challenges, Notification, $compile, Groups, $state, $stateParams, Members, Tasks, TAVERN_ID) {

    // Use presence of cid to determine whether to show a list or a single
    // challenge
    $scope.cid = $state.params.cid;

    $scope.groupIdFilter = $stateParams.groupIdFilter;

    _getChallenges();

    // FIXME $scope.challenges needs to be resolved first (see app.js)
    $scope.groups = [];
    Groups.Group.getGroups('party,guilds,tavern')
      .then(function (response) {
        $scope.groups = response.data.data;
      });

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

    $scope.isUserMemberOf = function (challenge) {
      return User.user.challenges.indexOf(challenge._id) !== -1;
    }

    $scope.editTask = Tasks.editTask;
    $scope.cancelTaskEdit = Tasks.cancelTaskEdit;

    $scope.canEdit = function(task) {
      return true;
    }

    $scope.doubleClickTask = function (obj, task) {
      if (obj._locked) {
        return false;
      }

      if (task._editing) {
        $scope.saveTask(task);
      } else {
        $scope.editTask(task);
      }
    }

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
        if ($scope.search.group[groupsWithChallenges[i]] === true) {
          filterCount += 1;
          defaultGroup = groupsWithChallenges[i];
        }

        if (filterCount >= 1 && defaultGroup) {
          break;
        }
      }

      if(!defaultGroup) defaultGroup = TAVERN_ID;

      $scope.obj = $scope.newChallenge = {
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
      };

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
        if (challenge[type + 's']) {
          challenge[type + 's'].forEach(_cloneTaskAndPush);
        }
      }).value();

      $scope.obj = $scope.newChallenge = {
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
      };

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

      if (!challenge.shortName || challenge.shortName.length < 3) return alert(window.env.t('shortNameTooShort'));

      var isNew = !challenge._id;

      if(isNew && challenge.prize > $scope.maxPrize) {
        return alert(window.env.t('challengeNotEnoughGems'));
      }

      if (isNew) {
        var _challenge;
        Challenges.createChallenge(challenge)
          .then(function (response) {
            _challenge = response.data.data;
            Notification.text(window.env.t('challengeCreated'));

            var challengeTasks = [];
            challengeTasks = challengeTasks.concat(challenge.todos);
            challengeTasks = challengeTasks.concat(challenge.habits);
            challengeTasks = challengeTasks.concat(challenge.dailys);
            challengeTasks = challengeTasks.concat(challenge.rewards);

            return Tasks.createChallengeTasks(_challenge._id, challengeTasks);
          })
          .then(function (response) {
            $state.transitionTo('options.social.challenges.detail', { cid: _challenge._id }, {
              reload: true, inherit: false, notify: true
            });
            User.sync();
          });
      } else {
        Challenges.updateChallenge(challenge._id, challenge)
          .then(function (response) {
            var _challenge = response.data.data;
            $state.transitionTo('options.social.challenges.detail', { cid: _challenge._id }, {
              reload: true, inherit: false, notify: true
            });
            User.sync();
          });
      }
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

    //@TODO: change to $scope.remove
    $scope["delete"] = function(challenge) {
      var warningMsg;

      if(challenge.group._id == TAVERN_ID) {
        warningMsg = window.env.t('sureDelChaTavern');
      } else {
        warningMsg = window.env.t('sureDelCha');
      }

      if (!confirm(warningMsg)) return;

      Challenges.deleteChallenge(challenge._id)
        .then(function (response) {
          $scope.popoverEl.popover('destroy');
          _backToChallenges();
        });
    };

    $scope.selectWinner = function(challenge) {
      if (!challenge.winner) return;
      if (!confirm(window.env.t('youSure'))) return;

      Challenges.selectChallengeWinner(challenge._id, challenge.winner)
        .then(function (response) {
          $scope.popoverEl.popover('destroy');
          _backToChallenges();
        });
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
    function addChallengeTasks (listDef, challenge, tasks) {
      var type = listDef.type;

      // If the challenge has not been created, we bulk add tasks on save
      tasks = tasks.map(function (task) {
        return Shared.taskDefaults({
          text: task,
          type: type,
        });
      });

      type = type + 's';

      if (challenge._id) {
        Tasks.createChallengeTasks(challenge._id, tasks).then(function (res) {
          addToList(challenge, type, res.data.data);
        });
      } else {
        addToList(challenge, type, tasks);
      }
    };

    function addToList (challenge, type, tasks) {
      if (!_.isArray(tasks)) {
        tasks = [tasks];
      }
      if (!challenge[type]) {
        challenge[type] = [];
      }
      challenge[type].unshift.apply(challenge[type], tasks);
    }

    $scope.addTask = function(listDef, challenge) {
      Tasks.addTasks(listDef, function (listDef, tasks) {
        addChallengeTasks(listDef, challenge, tasks);
      });
    }

    $scope.removeTask = function(task, challenge) {
      if (!confirm(window.env.t('sureDelete', {taskType: window.env.t(task.type), taskText: task.text}))) return;
      //We only pass to the api if the challenge exists, otherwise, the tasks only exist on the client
      if (challenge._id) Tasks.deleteTask(task._id);
      var index = challenge[task.type + 's'].indexOf(task);
      challenge[task.type + 's'].splice(index, 1);
    };

    $scope.saveTask = function(task){
      angular.copy(task._edit, task);
      task._edit = undefined;
      task._editing = false;
      Tasks.updateTask(task._id, task);
    }

    $scope.toggleBulk = Tasks.toggleBulk;

    /*
    --------------------------
     Subscription
    --------------------------
    */

    $scope.join = function (challenge) {
      Challenges.joinChallenge(challenge._id)
        .then(function (response) {
          User.user.challenges.push(challenge._id);
          _getChallenges();
          return Tasks.getUserTasks();
        })
        .then(function (response) {
          var tasks = response.data.data;
          User.syncUserTasks(tasks);
        });
    }

    $scope.leave = function(keep, challenge) {
      if (keep == 'cancel') {
        $scope.selectedChal = undefined;
      } else {
        Challenges.leaveChallenge($scope.selectedChal._id, keep)
          .then(function (response) {
            var index = User.user.challenges.indexOf($scope.selectedChal._id);
            delete User.user.challenges[index];
            _getChallenges();
            return Tasks.getUserTasks();
          })
          .then(function (response) {
            var tasks = response.data.data;
            User.syncUserTasks(tasks);
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

      if (gid == TAVERN_ID && !($scope.newChallenge.prize > 0)) {
        $scope.newChallenge.prize = 1;
      }
    })

    $scope.selectAll = function(){
      $scope.search.group = _.transform($scope.groupsFilter, function(searchPool, group){
        searchPool[group._id] = true;
      });
    }

    $scope.selectNone = function(){
      $scope.search.group = _.transform($scope.groupsFilter, function(searchPool, group){
        searchPool[group._id] = false;
      });
    }

    $scope.shouldShow = function(task, list, prefs){
      return true;
    };

    $scope.insufficientGemsForTavernChallenge = function() {
      var balance = User.user.balance || 0;
      var isForTavern = $scope.newChallenge.group == TAVERN_ID;

      if (isForTavern) {
        return balance <= 0;
      } else {
        return false;
      }
    }

    $scope.sendMessageToChallengeParticipant = function(uid) {
      Members.selectMember(uid)
        .then(function () {
          $rootScope.openModal('private-message', {controller:'MemberModalCtrl'});
        });
    };

    $scope.sendGiftToChallengeParticipant = function(uid) {
      Members.selectMember(uid)
        .then(function () {
          $rootScope.openModal('send-gift', {controller:'MemberModalCtrl'});
        });
    };

    $scope.filterInitialChallenges = function() {
      $scope.groupsFilter = _.uniq(_.compact(_.pluck($scope.challenges, 'group')), function(g) {return g._id});

      $scope.search = {
        group: _.transform($scope.groupsFilter, function(m,g) { m[g._id] = true;}),
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

    function _shouldShowChallenge (chal) {
      // Have to check that the leader object exists first in the
      // case where a challenge's leader deletes their account
      var userIsOwner = (chal.leader && chal.leader._id) === User.user.id;

      var groupSelected = $scope.search.group[chal.group ? chal.group._id : null];
      var checkOwner = $scope.search._isOwner === 'either' || (userIsOwner === $scope.search._isOwner);
      var checkMember = $scope.search._isMember === 'either' || ($scope.isUserMemberOf(chal) === $scope.search._isMember);

      return groupSelected && checkOwner && checkMember;
    }

    function _backToChallenges(){
      $scope.popoverEl.popover('destroy');
      $scope.cid = null;
      $state.go('options.social.challenges');
      _getChallenges();
    }

    // Fetch single challenge if a cid is present; fetch multiple challenges
    // otherwise
    function _getChallenges() {
      if ($scope.cid) {
        Challenges.getChallenge($scope.cid)
          .then(function (response) {
            var challenge = response.data.data;
            $scope.challenges = [challenge];
          });
      } else {
        Challenges.getUserChallenges()
          .then(function(response){
            $scope.challenges = response.data.data;
            $scope.filterInitialChallenges();
          });
      }
    };
}]);
