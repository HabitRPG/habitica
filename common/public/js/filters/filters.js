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
      return (gp > 999999999) ? (gp / Math.pow(10, 9)).toFixed(1) + "b" :
        (gp > 999999) ? (gp / Math.pow(10, 6)).toFixed(1) + "m" :
        (gp > 999) ? (gp / Math.pow(10, 3)).toFixed(1) + "k" : gp;
    }
  })
