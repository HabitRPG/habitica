'use strict';

/**
 * Services that expose habitrpg-shared
 */

angular.module('habitrpg')
.factory('Shared', [function () {
  return window.habitrpgShared;
}])
.factory('Content', ['Shared', '$http', function (Shared, $http) {

  function loadContent () {
    return $http({
      method: 'GET',
      url: '/api/v3/content',
    })
    .then(function (response) {
      Shared.content = response.data.data;
      for (var key in Shared.content.gear.flat) {
        var gearItem = Shared.content.gear.flat[key];
        var text = gearItem.text;

        gearItem.textlocaleKey = gearItem.text;
        gearItem.text = function (language) {
          if (!language) language = 'en';
          return window.env.t(this.textlocaleKey, language);
        }

        gearItem.noteslocaleKey = gearItem.notes;
        gearItem.notes = function (language) {
          if (!language) language = 'en';
          return window.env.t(this.noteslocaleKey, language);
        }
      }
      return Shared.content;
    });
  }

  Shared.content.loadContent = loadContent;

  return Shared.content;
}]);
