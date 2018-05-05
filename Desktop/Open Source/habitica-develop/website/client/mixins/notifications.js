import habiticaMarkdown from 'habitica-markdown';
import { mapState } from 'client/libs/store';
import { getDropClass, getXPMessage, getSign, round } from 'client/libs/notifications';

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
      let message = getXPMessage(val);
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
      this.notify(`${val}`, 'streak');
    },
    text (val, onClick) {
      if (!val) return;
      this.notify(val, 'info', null, null, onClick);
    },
    sign (number) {
      return getSign(number);
    },
    round (number, nDigits) {
      return round(number, nDigits);
    },
    notify (html, type, icon, sign) {
      this.$store.dispatch('snackbars:add', {
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
