/**
 Set up "+1 Exp", "Level Up", etc notifications
 */
angular.module("habitrpg").factory("Notification",
[function() {
  var stack_topright = {"dir1": "down", "dir2": "left", "spacing1": 15, "spacing2": 15, "firstpos1": 60};
  function notify(html, type, icon) {
    var notice = $.pnotify({
      type: type || 'warning', //('info', 'text', 'warning', 'success', 'gp', 'xp', 'hp', 'lvl', 'death', 'mp', 'crit')
      text: html,
      opacity: 1,
      addclass: 'alert-' + type,
      delay: 7000,
      hide: (type == 'error') ? false : true,
      mouse_reset: false,
      width: "250px",
      stack: stack_topright,
      icon: icon || false
    }).click(function() { notice.pnotify_remove() });
  };

  /**
   Show "+ 5 {gold_coin} 3 {silver_coin}"
   */
  function coins(money) {
    var absolute, gold, silver;
    absolute = Math.abs(money);
    gold = Math.floor(absolute);
    silver = Math.floor((absolute - gold) * 100);
    if (gold && silver > 0) {
      return "" + gold + " <span class='notification-icon shop_gold'></span> " + silver + " <span class='notification-icon shop_silver'></span>";
    } else if (gold > 0) {
      return "" + gold + " <span class='notification-icon shop_gold'></span>";
    } else if (silver > 0) {
      return "" + silver + " <span class='notification-icon shop_silver'></span>";
    }
  };

  var sign = function(number){
    return number?number<0?'-':'+':'+';
  }

  var round = function(number){
    return Math.abs(number.toFixed(1));
  }

  return {
    coins: coins,
    hp: function(val) {
      // don't show notifications if user dead
      notify(sign(val) + " " + round(val) + " " + window.env.t('hp'), 'hp', 'glyphicon glyphicon-heart');
    },
    exp: function(val) {
      if (val < -50) return; // don't show when they level up (resetting their exp)
      notify(sign(val) + " " + round(val) + " " + window.env.t('xp'), 'xp', 'glyphicon glyphicon-star');
    },
    gp: function(val, bonus) {
      notify(sign(val) + " " + coins(val - bonus), 'gp');
    },
    text: function(val){
      if (val) {
        notify(val, 'info');
      }
    },
    lvl: function(){
      notify(window.env.t('levelUp'), 'lvl', 'glyphicon glyphicon-chevron-up');
    },
    error: function(error){
      notify(error, "danger", 'glyphicon glyphicon-exclamation-sign');
    },
    mp: function(val) {
      notify(sign(val) + " " + round(val) + " " + window.env.t('mp'), 'mp', 'glyphicon glyphicon-fire');
    },
    crit: function(val) {
      notify(window.env.t('critBonus') + Math.round(val) + "%", 'crit', 'glyphicon glyphicon-certificate');
    },
    streak: function(val) {
      notify(window.env.t('streakName') + ': ' + val, 'streak', 'glyphicon glyphicon-repeat');
    },
    drop: function(val) {
      notify(val, 'drop', 'glyphicon glyphicon-gift');
    }
  };
}]);
