angular.module('habitrpg')
  .filter('gold', function () {
    return function (gp) {
      return Math.floor(gp);
    }
  })
  .filter('silver', function () {
    return function (gp) {
      return Math.floor((gp - Math.floor(gp))*100);
    }
  })
  .filter('htmlDecode',function(){
    return function(html){
      return $('<div/>').html(html).text();
    }
  })
  .filter('goldRoundThousandsToK', function(){
    return function (gp) {
      return (gp > 999) ? (Math.floor(gp / 100) / 10.0 + 'K') : gp;
    }
  })