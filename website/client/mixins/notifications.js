export default {
  methods: {
    /**
     Show '+ 5 {gold_coin} 3 {silver_coin}'
     */
    coins (money) {
      let absolute;
      let gold;
      let silver;
      absolute = Math.abs(money);
      gold = Math.floor(absolute);
      silver = Math.floor((absolute - gold) * 100);
      if (gold && silver > 0) {
        return `${gold} <span class='notification-icon shop_gold'></span> ${silver} <span class='notification-icon shop_silver'></span>`;
      } else if (gold > 0) {
        return `${gold} <span class='notification-icon shop_gold'></span>`;
      } else if (silver > 0) {
        return `${silver} <span class='notification-icon shop_silver'></span>`;
      }
    },
    crit (val) {
      let message = `${this.$t('critBonus')} ${Math.round(val)} %`;
      this.notify(message, 'crit', 'glyphicon glyphicon-certificate');
    },
    drop (val, item) {
      let dropClass = '';
      if (item) {
        switch (item.type) {
          case 'Egg':
            dropClass = `Pet_Egg_${item.key}`;
            break;
          case 'HatchingPotion':
            dropClass = `Pet_HatchingPotion_${item.key}`;
            break;
          case 'Food':
            dropClass = `Pet_Food_${item.key}`;
            break;
          case 'armor':
          case 'back':
          case 'body':
          case 'eyewear':
          case 'head':
          case 'headAccessory':
          case 'shield':
          case 'weapon':
            dropClass = `shop_${item.key}`;
            break;
          default:
            dropClass = 'glyphicon glyphicon-gift';
        }
      }
      this.notify(val, 'drop', dropClass);
    },
    quest (type, val) {
      this.notify(this.$t(type, { val }), 'success');
    },
    exp (val) {
      if (val < -50) return; // don't show when they level up (resetting their exp)
      let message = `${this.sign(val)} ${this.round(val)} + ${this.$t('experience')}`;
      this.notify(message, 'xp', 'glyphicon glyphicon-star');
    },
    error (error, canHide) {
      this.notify(error, 'danger', 'glyphicon glyphicon-exclamation-sign', canHide);
    },
    gp (val, bonus) {
      this.notify(`${this.sign(val)} ${this.coins(val - bonus)}`, 'gp');
    },
    hp (val) {
      // don't show notifications if user dead
      this.notify(`${this.sign(val)} ${this.round(val)} ${this.$t('health')}`, 'hp', 'glyphicon glyphicon-heart');
    },
    lvl () {
      this.notify(this.$t('levelUp'), 'lvl', 'glyphicon glyphicon-chevron-up');
    },
    markdown (val) {
      if (!val) return;
      // @TODO: Implement markdown library
      // let parsed_markdown = $filter("markdown")(val);
      // this.notify(parsed_markdown, 'info');
    },
    mp (val) {
      this.notify(`${this.sign(val)} ${this.round(val)} ${this.$t('mana')}`, 'mp', 'glyphicon glyphicon-fire');
    },
    streak (val) {
      this.notify(`${this.$t('streaks')}: ${val}`, 'streak', 'glyphicon glyphicon-repeat');
    },
    text (val, onClick) {
      if (!val) return;
      this.notify(val, 'info', null, null, onClick);
    },
    sign (number) {
      let sign = '+';
      if (number && number < 0) {
        sign = '-';
      }
      return sign;
    },
    round (number) {
      return Math.abs(number.toFixed(1));
    },
    // @TODO: Implement when we have a notify library
    //notify (html, type, icon, canHide, onClick) {
      // let stack_topright = {"dir1": "down", "dir2": "left", "spacing1": 15, "spacing2": 15, "firstpos1": 60};
      // let notice = $.pnotify({
      //   type: type || 'warning', //('info', 'text', 'warning', 'success', 'gp', 'xp', 'hp', 'lvl', 'death', 'mp', 'crit')
      //   text: html,
      //   opacity: 1,
      //   addclass: 'alert-' + type,
      //   delay: 7000,
      //   hide: ((type == 'error' || type == 'danger') && !canHide) ? false : true,
      //   mouse_reset: false,
      //   width: "250px",
      //   stack: stack_topright,
      //   icon: icon || false
      // }).click(function() {
      //   notice.pnotify_remove();
      //
      //   if (onClick) {
      //     onClick();
      //   }
      // });
    //},
  },
};
