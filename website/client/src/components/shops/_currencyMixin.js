import { mapGetters, mapState } from '@/libs/store';

export default {
  computed: {
    ...mapGetters({
      userGems: 'user:gems',
    }),
    ...mapState({
      userHourglasses: 'user.data.purchased.plan.consecutive.trinkets',
      userGold: 'user.data.stats.gp',
    }),
  },
  methods: {
    enoughCurrency (currency, amount) { // eslint-disable-line consistent-return
      switch (currency) { // eslint-disable-line default-case
        case 'gold':
          return this.userGold >= amount;
        case 'gems':
          return this.userGems >= amount;
        case 'hourglasses':
          return this.userHourglasses >= amount;
      }
    },
  },
};
