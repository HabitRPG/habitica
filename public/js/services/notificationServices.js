/**
 Set up "+1 Exp", "Level Up", etc notifications
 */
angular.module("notificationServices", [])
  .factory("Notification", [function() {
    function growl(html, type) {
      $.bootstrapGrowl(html, {
        ele: '#notification-area',
        type: type, //(null, 'info', 'error', 'success', 'gp', 'xp', 'hp', 'lvl','death')
        top_offset: 20,
        align: 'right', //('left', 'right', or 'center')
        width: 250, //(integer, or 'auto')
        delay: 3000,
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
        growl("<i class='icon-heart'></i> " + sign(val) + " " + round(val) + " HP", 'hp');
      },
      exp: function(val) {
        if (val < -50) return; // don't show when they level up (resetting their exp)
        growl("<i class='icon-star'></i> " + sign(val) + " " + round(val) + " XP", 'xp');
      },
      gp: function(val) {
        growl(sign(val) + " " + coins(val), 'gp');
      },
      text: function(val){
        growl(val);
      },
      lvl: function(){
        growl('<i class="icon-chevron-up"></i> Level Up!', 'lvl');
      },
      death: function(){
        growl("<i class='icon-death'></i> Respawn!", "death");
      },
      error: function(error){
        growl("<i class='icon-exclamation-sign'></i> " + error, "error");
      }
    };
  }
]);
