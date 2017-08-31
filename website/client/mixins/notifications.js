import habiticaMarkdown from 'habitica-markdown';
import { mapState } from 'client/libs/store';

export default {
  computed: {
    ...mapState({notifications: 'notificationStore'}),
  },
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
      let message = `${this.sign(val)} ${this.round(val)}`;
      this.notify(message, 'xp', 'glyphicon glyphicon-star', this.sign(val));
    },
    error (error, canHide) {
      this.notify(error, 'danger', 'glyphicon glyphicon-exclamation-sign', canHide);
    },
    gp (val, bonus) {
      this.notify(`${this.sign(val)} ${this.coins(val - bonus)}`, 'gp', '', this.sign(val));
    },
    hp (val) {
      // don't show notifications if user dead
      this.notify(`${this.sign(val)} ${this.round(val)}`, 'hp', 'glyphicon glyphicon-heart', this.sign(val));
    },
    lvl () {
      this.notify(this.$t('levelUp'), 'lvl', 'glyphicon glyphicon-chevron-up');
    },
    markdown (val) {
      if (!val) return;
      let parsedMarkdown = habiticaMarkdown.render(val);
      this.notify(parsedMarkdown, 'info');
    },
    mp (val) {
      this.notify(`${this.sign(val)} ${this.round(val)}`, 'mp', 'glyphicon glyphicon-fire', this.sign(val));
    },
    purchased (itemName) {
      this.text(this.$t('purchasedItem', {
        itemName,
      }));
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
    notify (html, type, icon, sign) {
      this.notifications.push({
        title: '',
        text: html,
        type,
        icon,
        sign,
        timeout: true,
      });
    },
  },
};
