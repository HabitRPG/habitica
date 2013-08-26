"use strict"

###
The main HabitRPG app module.

@type {angular.Module}
###

#    .constant('API_URL', 'https://beta.habitrpg.com')
# userServices handles redirect to /login if not authenticated
window.habitrpg = angular.module('habitrpg', ['userServices', 'sharedServices', 'authServices', 'notificationServices', 'ui.bootstrap'])
  .constant("API_URL", "")
