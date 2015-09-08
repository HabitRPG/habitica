'use strict';

habitrpg.controller('AutocompleteCtrl', ['$scope', '$timeout', 'Groups', 'User', 'InputCaret', function ($scope,$timeout,Groups,User,InputCaret) {
    $scope.clearUserlist = function() {
      $scope.response = [];
      $scope.usernames = [];
    }

    $scope.filterUser = function(msg) {
      if (!$scope.query || !msg.user) {
        return false;
      }

      // Ignore casing when checking for username
      var user = msg.user.toLowerCase();
      var text = $scope.query.text.toLowerCase();

      return user.indexOf(text) == 0;
    }

    $scope.performCompletion = function(msg) {
      $scope.autoComplete(msg);
      $scope.query = null;
    }

    $scope.addNewUser = function(user) {
      if($.inArray(user.user,$scope.usernames) == -1) {
        user.username = user.user;
        $scope.usernames.push(user.user);
        $scope.response.push(user);
      }
    }

    $scope.clearUserlist();

    $scope.chatChanged = function(newvalue,oldvalue){
      if($scope.group && $scope.group.chat && $scope.group.chat.length > 0){
        for(var i = 0; i < $scope.group.chat.length; i++) {
          $scope.addNewUser($scope.group.chat[i]);
        }
      }
    }

    $scope.$watch('group.chat',$scope.chatChanged);

    $scope.caretChanged = function(newCaretPos) {
      var relativeelement = $('.chat-form div:first');
      var textarea = $('.chat-form textarea');
      var userlist = $('.list-at-user');
      var offset = {
        x: textarea.offset().left - relativeelement.offset().left,
        y: textarea.offset().top - relativeelement.offset().top,
      };
      if(relativeelement) {
        var caretOffset = InputCaret.getPosition(textarea);
        userlist.css({
                  left: caretOffset.left + offset.x,
                  top: caretOffset.top + offset.y + 16
                });
      }
    }

    $scope.updateTimer = false;

    $scope.$watch(function () { return $scope.caretPos; },function(newCaretPos) {
      if($scope.updateTimer){
        $timeout.cancel($scope.updateTimer)
      }
      $scope.updateTimer = $timeout(function(){
        $scope.caretChanged(newCaretPos);
      },$scope.watchDelay)
    });
  }]);
