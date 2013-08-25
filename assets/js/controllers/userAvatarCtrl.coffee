"use strict"
habitrpg.controller "UserAvatarCtrl", ($scope, $location, filterFilter, User) ->
  $scope.profile = User.user
  $scope.changeHair = (color) ->
    User.user.preferences.hair = color
    User.log
      op: "set"
      data:
        "preferences.hair": color


  $scope.changeSkin = (color) ->
    User.user.preferences.skin = color
    User.log
      op: "set"
      data:
        "preferences.skin": color


  $scope.changeSex = (gender) ->
    User.user.preferences.gender = gender
    User.log
      op: "set"
      data:
        "preferences.gender": gender


  $scope.changeArmor = (armor) ->
    User.user.preferences.armorSet = armor
    User.log
      op: "set"
      data:
        "preferences.armorSet": armor


  $scope.hideUserAvatar = ->
    $(".userAvatar").hide()