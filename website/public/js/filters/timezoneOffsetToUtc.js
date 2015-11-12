angular.module('habitrpg')
  .filter('timezoneOffsetToUtc', function () {
    return function (offset) {
      if (offset > 0) {
        var sign = '-';
      } else {
        var sign = '+';
      }

      offset = Math.abs(offset) / 60;

      var hour = Math.floor(offset);

      var minutes = (offset - hour) * 60;

      return 'UTC' + sign + hour + ':' + minutes;
    }
  });
