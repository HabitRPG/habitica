/**
 Set up "+1 Exp", "Level Up", etc notifications
 */
angular.module("notificationServices", [])
  .factory("Notification", [function() {
    function growl(html, type) {
      $.bootstrapGrowl(html, {
        ele: '#notification-area',
        type: type || 'warning', //('info', 'text', 'warning', 'success', 'gp', 'xp', 'hp', 'lvl', 'death', 'mp', 'crit')
        top_offset: 60,
        align: 'right', //('left', 'right', or 'center')
        width: 250, //(integer, or 'auto')
        delay: (type=='error') ? 0 : 7000,
        allow_dismiss: true,
        stackup_spacing: 10 // spacing between consecutive stacked growls.
      });
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
        growl("<span class='glyphicon glyphicon-heart'></span>&nbsp; " + sign(val) + " " + round(val) + " " + window.env.t('hp'), 'hp');
      },
      exp: function(val) {
        if (val < -50) return; // don't show when they level up (resetting their exp)
        growl("<span class='glyphicon glyphicon-star'></span>&nbsp; " + sign(val) + " " + round(val) + " " + window.env.t('xp'), 'xp');
      },
      gp: function(val, bonus) {
        growl(sign(val) + " " + coins(val - bonus), 'gp');
      },
      text: function(val){
        growl(val);
      },
      lvl: function(){
        growl('<span class="glyphicon glyphicon-chevron-up"></span>&nbsp;' + window.env.t('levelUp'), 'lvl');
      },
      error: function(error){
        growl("<span class='glyphicon glyphicon-exclamation-sign'></span>&nbsp; " + error, "danger");
      },
      mp: function(val) {
        growl("<span class='glyphicon glyphicon-fire'></span>&nbsp; " + sign(val) + " " + round(val) + " " + window.env.t('mp'), 'mp');
      },
      crit: function(val) {
        growl("<span class='glyphicon glyphicon-certificate'></span>&nbsp;" + window.env.t('critBonus') + Math.round(val) + "%", 'crit');
      },
      drop: function(val) {
        growl("<span class='glyphicon glyphicon-gift'></span>&nbsp; " + val, 'drop');
      }
    };
  }
]);
