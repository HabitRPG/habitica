'use strict';

angular.module('habitRPG')
  .controller('HeaderCtrl', function ($scope, User) {
        var user = User.get()
        $scope.partySize = function(){
            //FIXME if (gt(user.partyMembers.length,1)}{truarr(_partyMembers.length)}{else}0{/}
            return 0;
        }
  });
