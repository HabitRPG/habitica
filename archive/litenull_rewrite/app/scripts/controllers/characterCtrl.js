'use strict';

/**
 * The character controller:
 *
 */

habitrpg.controller( 'CharacterCtrl', function CharacterCtrl( $scope, $location, filterFilter, User ) {

        $scope.user = User.user;

        $scope.equipped = function(user, type) {
            return window.habitrpgShared.helpers.equipped(user, type);
        }

        $scope.$watch('user.tasks', function(){
            $scope.hpPercent = function(hp) {
                return (hp / 50) * 100;
            }

            $scope.expPercent = function(exp, level) {
                return Math.round((exp / window.habitrpgShared.algos.tnl(level)) * 100);
            }
        })

        $scope.showUserAvatar = function() {
            $('.userAvatar').show()
        }



});
