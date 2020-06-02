import habiticaMarkdown from 'habitica-markdown';
import { mapState } from '@/libs/store';
import {
  getDropClass, getXPMessage, getSign, round,
} from '@/libs/notifications';

// See https://stackoverflow.com/questions/4187146/truncate-number-to-two-decimal-places-without-rounding
function toFixedWithoutRounding (num, fixed) {
  const re = new RegExp(`^-?\\d+(?:\.\\d{0,${(fixed || -1)}})?`); // eslint-disable-line no-useless-escape
  return num.toString().match(re)[0];
}

export default {
  computed: {
    ...mapState({ notifications: 'notificationStore' }),
  },
  methods: {
    coins (money) {
      return this.round(money, 2);
    },
    crit (val) {
      const message = `${this.$t('critBonus')} ${Math.round(val)} %`;
      this.notify(message, 'crit', 'glyphicon glyphicon-certificate');
    },
    drop (val, item) {
      const dropClass = getDropClass({ key: item.key, type: item.type });
      this.notify(val, 'drop', dropClass);
    },
    quest (type, val) {
      this.notify(this.$t(type, { val }), 'success');
    },
    damage (val) {
      this.notify(`${this.sign(val)}${val}`, 'damage');
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
      const parsedMarkdown = habiticaMarkdown.render(String(val));
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
    text (val, onClick, timeout, delay) {
      if (!val) return;
      this.notify(val, 'info', null, null, onClick, timeout, delay);
    },
    sign (number) {
      return getSign(number);
    },
    round (number, nDigits) {
      return round(number, nDigits);
    },
    notify (html, type, icon, sign, onClick, timeout = true, delay) {
      this.$store.dispatch('snackbars:add', {
        title: '',
        text: html,
        type,
        icon,
        sign,
        onClick,
        timeout,
        delay,
      });
    },
  },
};
