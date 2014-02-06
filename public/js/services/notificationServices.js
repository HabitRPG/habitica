/**
 Set up "+1 Exp", "Level Up", etc notifications
 */
angular.module("notificationServices", [])
  .factory("Notification", [function() {
    function growl(html, type) {
      $.bootstrapGrowl(html, {
        ele: '#notification-area',
        type: type, //(null, 'text', 'error', 'success', 'gp', 'xp', 'hp', 'lvl', 'death', 'mp', 'crit')
        top_offset: 20,
        align: 'right', //('left', 'right', or 'center')
        width: 250, //(integer, or 'auto')
        delay: (type=='error') ? 0 : 7000,
        allow_dismiss: true,
        stackup_spacing: 10 // spacing between consecutive stacecked growls.
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
        return "" + gold + " <i class='icon-gold'></i> " + silver + " <i class='icon-silver'></i>";
      } else if (gold > 0) {
        return "" + gold + " <i class='icon-gold'></i>";
      } else if (silver > 0) {
        return "" + silver + " <i class='icon-silver'></i>";
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
        growl("<i class='icon-heart'></i> " + sign(val) + " " + round(val) + " " + window.env.t('hp'), 'hp');
      },
      exp: function(val) {
        if (val < -50) return; // don't show when they level up (resetting their exp)
        growl("<i class='icon-star'></i> " + sign(val) + " " + round(val) + " " + window.env.t('xp'), 'xp');
      },
      gp: function(val, bonus) {
        growl(sign(val) + " " + coins(val - bonus), 'gp');
      },
      text: function(val){
        growl(val);
      },
      lvl: function(){
        growl('<i class="icon-chevron-up"></i> ' + window.env.t('levelUp'), 'lvl');
      },
      death: function(){
        growl("<i class='icon-death'></i> " + window.env.t('respawn'), "death");
      },
      error: function(error){
        growl("<i class='icon-exclamation-sign'></i> " + error, "error");
      },
      mp: function(val) {
        growl("<i class='icon-fire'></i> " + sign(val) + " " + round(val) + " " + window.env.t('mp'), 'mp');
      },
      crit: function(val) {
        growl("<i class='icon-certificate'></i>" + window.env.t('critBonus') + Math.round(val) + "%", 'crit');
      },
      drop: function(val) {
        growl("<i class='icon-gift'></i> " + val, 'drop');
      }
    };
  }
]);
