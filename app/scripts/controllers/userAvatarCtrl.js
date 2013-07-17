'use strict';

/**
 * The character controller:
 *
 */

habitrpg.controller( 'userAvatarCtrl', function CharacterCtrl( $scope, $location, filterFilter, User ) {

        $scope.user = User.user;

        $scope.changeHair = function(color) {
            User.user.preferences.hair = color;
            User.log({op:"set",path:"preferences.hair",value:color})
        }

        $scope.changeSkin = function(color) {
            User.user.preferences.skin = color
            User.log({op:"set",path:"preferences.skin",value:color})
        }

        $scope.changeSex = function(gender) {
            User.user.preferences.gender = gender
            User.log({op:"set",path:"preferences.gender",value:gender})
        }

        $scope.changeArmor = function(set) {
            User.user.preferences.armorSet = v
            User.log({op:"set",path:"preferences.armorSet",value:set})
        }

         $scope.hideUserAvatar = function() {
            $('.userAvatar').hide()
        }



});
