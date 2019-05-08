import habiticaMarkdown from 'habitica-markdown';
import { mapState } from 'client/libs/store';
import { getDropClass, getXPMessage, getSign, round } from 'client/libs/notifications';

// See https://stackoverflow.com/questions/4187146/truncate-number-to-two-decimal-places-without-rounding
function toFixedWithoutRounding (num, fixed) {
  const re = new RegExp(`^-?\\d+(?:\.\\d{0,${(fixed || -1)}})?`);
  return num.toString().match(re)[0];
}

export default {
  computed: {
    ...mapState({notifications: 'notificationStore'}),
  },
  methods: {
    coins (money) {
      return this.round(money, 2);
    },
    crit (val) {
      let message = `${this.$t('critBonus')} ${Math.round(val)} %`;
      this.notify(message, 'crit', 'glyphicon glyphicon-certificate');
    },
    drop (val, item) {
      let dropClass = getDropClass({key: item.key, type: item.type});
      this.notify(val, 'drop', dropClass);
    },
    quest (type, val) {
      this.notify(this.$t(type, { val }), 'success');
    },
    exp (val) {
      const message = getXPMessage(val);
      this.notify(message, 'xp', 'glyphicon glyphicon-star', this.sign(val));
    },
    error (error) {
      this.notify(error, 'error', 'glyphicon glyphicon-exclamation-sign');
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
      let parsedMarkdown = habiticaMarkdown.render(String(val));
      this.notify(parsedMarkdown, 'info');
    },
    mp (val) {
      const cleanMp = `${val}`.replace('-', '').replace('+', '');
      this.notify(`${this.sign(val)} ${toFixedWithoutRounding(cleanMp, 1)}`, 'mp', 'glyphicon glyphicon-fire', this.sign(val));
    },
    purchased (itemName) {
      this.text(this.$t('purchasedItem', {
        itemName,
      }));
    },
    streak (val, onClick) {
      this.notify(`${val}`, 'streak', null, null, onClick, typeof onClick === 'undefined');
    },
    text (val, onClick, timeout) {
      if (!val) return;
      this.notify(val, 'info', null, null, onClick, timeout);
    },
    sign (number) {
      return getSign(number);
    },
    round (number, nDigits) {
      return round(number, nDigits);
    },
    notify (html, type, icon, sign, onClick, timeout) {
      if (typeof timeout === 'undefined') {
        timeout = true;
      }

      this.$store.dispatch('snackbars:add', {
        title: '',
        text: html,
        type,
        icon,
        sign,
        onClick,
        timeout,
      });
    },
  },
};
