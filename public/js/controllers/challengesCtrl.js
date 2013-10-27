"use strict";

habitrpg.controller("ChallengesCtrl", ['$scope', '$rootScope', 'User', 'Challenges', 'Notification', '$http', 'API_URL', '$compile',
  function($scope, $rootScope, User, Challenges, Notification, $http, API_URL, $compile) {

    $http.get(API_URL + '/api/v1/groups?minimal=true').success(function(groups){
      $scope.groups = groups;
    });

    $scope.challenges = Challenges.Challenge.query();

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
          challenge._editing = false;
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
      challenge.delete();
    };

    //------------------------------------------------------------
    // Tasks
    //------------------------------------------------------------

    $scope.addTask = function(list) {
      var task = window.habitrpgShared.helpers.taskDefaults({text: list.newTask, type: list.type}, User.user.filters);
      list.tasks.unshift(task);
      //User.log({op: "addTask", data: task}); //TODO persist
      delete list.newTask;
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

    /**
     * Render graphs for user scores when the "Challenges" tab is clicked
     */
    //TODO
    // 1. on main tab click or party
    //    * sort & render graphs for party
    // 2. guild -> all guilds
    // 3. public -> all public
//    $('#profile-challenges-tab-link').on 'shown', ->
//      async.each _.toArray(model.get('groups')), (g) ->
//        async.each _.toArray(g.challenges), (chal) ->
//          async.each _.toArray(chal.tasks), (task) ->
//            async.each _.toArray(chal.members), (member) ->
//              if (history = member?["#{task.type}s"]?[task.id]?.history) and !!history
//                data = google.visualization.arrayToDataTable _.map(history, (h)-> [h.date,h.value])
//                options =
//                  backgroundColor: { fill:'transparent' }
//                  width: 150
//                  height: 50
//                  chartArea: width: '80%', height: '80%'
//                  axisTitlePosition: 'none'
//                  legend: position: 'bottom'
//                  hAxis: gridlines: color: 'transparent' # since you can't seem to *remove* gridlines...
//                  vAxis: gridlines: color: 'transparent'
//                chart = new google.visualization.LineChart $(".challenge-#{chal.id}-member-#{member.id}-history-#{task.id}")[0]
//                chart.draw(data, options)

    /**
     * Sync user to challenge (when they score, add to statistics)
     */
    // TODO this needs to be moved to the server. Either:
    // 1. Calculate on load (simplest, but bad performance)
    // 2. Updated from user score API
//    app.model.on("change", "_page.user.priv.tasks.*.value", function(id, value, previous, passed) {
//      /* Sync to challenge, but do it later*/
//
//      var _this = this;
//      return async.nextTick(function() {
//        var chal, chalTask, chalUser, ctx, cu, model, pub, task, tobj;
//        model = app.model;
//        ctx = {
//          model: model
//        };
//        task = model.at("_page.user.priv.tasks." + id);
//        tobj = task.get();
//        pub = model.get("_page.user.pub");
//        if (((chalTask = helpers.taskInChallenge.call(ctx, tobj)) != null) && chalTask.get()) {
//          chalTask.increment("value", value - previous);
//          chal = model.at("groups." + tobj.group.id + ".challenges." + tobj.challenge);
//          chalUser = function() {
//            return helpers.indexedAt.call(ctx, chal.path(), 'members', {
//              id: pub.id
//            });
//          };
//          cu = chalUser();
//          if (!(cu != null ? cu.get() : void 0)) {
//            chal.push("members", {
//              id: pub.id,
//              name: model.get(pub.profile.name)
//            });
//            cu = model.at(chalUser());
//          } else {
//            cu.set('name', pub.profile.name);
//          }
//          return cu.set("" + tobj.type + "s." + tobj.id, {
//            value: tobj.value,
//            history: tobj.history
//          });
//        }
//      });
//    });

      /*
      --------------------------
       Unsubscribe functions
      --------------------------
      */

      $scope.unlink = function(task, keep) {
        // TODO move this to userServices, turn userSerivces.user into ng-resource
        $http.post(API_URL + '/api/v1/user/task/' + task.id + '/unlink', {keep:keep})
          .success(function(){
            debugger
            User.log({});
          });
      };

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