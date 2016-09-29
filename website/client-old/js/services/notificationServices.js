'use strict'
/**
 Set up "+1 Exp", "Level Up", etc notifications
 */
angular.module("habitrpg").factory("Notification",
['$filter', function($filter) {

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
  }

  function crit(val) {
    _notify(window.env.t('critBonus') + Math.round(val) + "%", 'crit', 'glyphicon glyphicon-certificate');
  }

  function drop(val, item) {
    var dropClass = "";
    if ( item !== undefined ) {
      switch ( item.type ) {
        case "Egg":
          dropClass = 'Pet_Egg_' + item.key;
          break;
        case "HatchingPotion":
          dropClass = 'Pet_HatchingPotion_' + item.key;
          break;
        case "Food":
          dropClass = 'Pet_Food_' + item.key;
          break;
        case "armor":
        case "back":
        case "body":
        case "eyewear":
        case "head":
        case "headAccessory":
        case "shield":
        case "weapon":
          dropClass = 'shop_' + item.key;
          break;
        default:
          dropClass = 'glyphicon glyphicon-gift';
     }
    }
    _notify(val, 'drop', dropClass);
  }

  function quest(type, val) {
    _notify(window.env.t(type, { val: val }), 'success');
  }

  function exp(val) {
    if (val < -50) return; // don't show when they level up (resetting their exp)
    _notify(_sign(val) + " " + _round(val) + " " + window.env.t('experience'), 'xp', 'glyphicon glyphicon-star');
  }

  function error(error, canHide){
    _notify(error, "danger", 'glyphicon glyphicon-exclamation-sign', canHide);
  }

  function gp(val, bonus) {
    _notify(_sign(val) + " " + coins(val - bonus), 'gp');
  }

  function hp(val) {
    // don't show notifications if user dead
    _notify(_sign(val) + " " + _round(val) + " " + window.env.t('health'), 'hp', 'glyphicon glyphicon-heart');
  }

  function lvl(){
    _notify(window.env.t('levelUp'), 'lvl', 'glyphicon glyphicon-chevron-up');
  }

  function markdown(val){
    if (val) {
      var parsed_markdown = $filter("markdown")(val);
      _notify(parsed_markdown, 'info');
    }
  }

  function mp(val) {
    _notify(_sign(val) + " " + _round(val) + " " + window.env.t('mana'), 'mp', 'glyphicon glyphicon-fire');
  }

  function streak(val) {
    _notify(window.env.t('streakName') + ': ' + val, 'streak', 'glyphicon glyphicon-repeat');
  }

  function text(val, onClick){
    if (val) {
      _notify(val, 'info', null, null, onClick);
    }
  }

  //--------------------------------------------------
  // Private Methods
  //--------------------------------------------------

  function _sign(number){
    return number?number<0?'-':'+':'+';
  }

  function _round(number){
    return Math.abs(number.toFixed(1));
  }

  // Used to stack notifications, must be outside of _notify
  var stack_topright = {"dir1": "down", "dir2": "left", "spacing1": 15, "spacing2": 15, "firstpos1": 60};

  function _notify(html, type, icon, canHide, onClick) {
    var notice = $.pnotify({
      type: type || 'warning', //('info', 'text', 'warning', 'success', 'gp', 'xp', 'hp', 'lvl', 'death', 'mp', 'crit')
      text: html,
      opacity: 1,
      addclass: 'alert-' + type,
      delay: 7000,
      hide: ((type == 'error' || type == 'danger') && !canHide) ? false : true,
      mouse_reset: false,
      width: "250px",
      stack: stack_topright,
      icon: icon || false
    }).click(function() {
      notice.pnotify_remove();

      if (onClick) {
        onClick();
      }
    });
  }

  return {
    coins: coins,
    crit: crit,
    drop: drop,
    exp: exp,
    error: error,
    gp: gp,
    hp: hp,
    lvl: lvl,
    markdown: markdown,
    mp: mp,
    streak: streak,
    text: text,
    quest: quest
  };
}]);
