angular.module('habitrpg')
  .filter('timezoneOffsetToUtc', function () {
    return function (offset) {
      var sign = offset > 0 ? '-' : '+';

      offset = Math.abs(offset) / 60;

      var hour = Math.floor(offset);

      var minutes_int = (offset - hour) * 60;
      var minutes = minutes_int < 10 ? '0'+minutes_int : minutes_int;

      return 'UTC' + sign + hour + ':' + minutes;
    }
  });
