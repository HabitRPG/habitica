"use strict";

window.habitrpg = angular.module('habitrpg', ['notificationServices', 'userServices', 'chieffancypants.loadingBar'])
  .constant("API_URL", "")
  .constant("STORAGE_USER_ID", 'habitrpg-user')
  .constant("STORAGE_SETTINGS_ID", 'habit-mobile-settings')