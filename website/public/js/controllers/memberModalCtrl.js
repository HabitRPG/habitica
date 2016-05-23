"use strict";

habitrpg
  .controller("MemberModalCtrl", ['$scope', '$rootScope', 'Members', 'Shared', '$http', 'Notification', 'Groups', 'Chat', '$controller', 'Stats',
    function($scope, $rootScope, Members, Shared, $http, Notification, Groups, Chat, $controller, Stats) {

      $controller('RootCtrl', {$scope: $scope});

      $scope.timestamp = function(timestamp){
        return moment(timestamp).format($rootScope.User.user.preferences.dateFormat.toUpperCase());
      }

      $scope.statCalc = Stats;

      // We watch Members.selectedMember because it's asynchronously set, so would be a hassle to handle updates here
      $scope.$watch( function() { return Members.selectedMember; }, function (member) {
        if(member) {
          $scope.profile = member;
        }
      });

      $scope.sendPrivateMessage = function(uuid, message){
        // Don't do anything if the user somehow gets here without a message.
        if (!message) return;

        $http.post('/api/v2/members/'+uuid+'/message',{message:message}).success(function(){
          Notification.text(window.env.t('messageSentAlert'));
          $rootScope.User.sync();
          $scope.$close();
        });
      };

      $scope.gift = {
        type: 'gems',
        gems: {amount:0, fromBalance:true},
        subscription: {key:''},
        message:''
      };

      $scope.sendGift = function(uuid, gift){
        $http.post('/api/v2/members/'+uuid+'/gift', gift).success(function(){
          Notification.text('Gift sent!')
          $rootScope.User.sync();
          $scope.$close();
        })
      };

      $scope.reportAbuse = function(reporter, message, groupId) {
        message.flags[reporter._id] = true;
        Chat.utils.flagChatMessage({gid: groupId, messageId: message.id}, undefined, function(data){
          Notification.text(window.env.t('abuseReported'));
          $scope.$close();
        });
      };

      $scope.clearFlagCount = function(message, groupId) {
        Chat.utils.clearFlagCount({gid: groupId, messageId: message.id}, undefined, function(data){
          message.flagCount = 0;
          Notification.text("Flags cleared");
          $scope.$close();
        });
      }
    }
  ]);
