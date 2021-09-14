import { mapState } from '@/libs/store';

export default {
  computed: {
    ...mapState({ user: 'user.data' }),
    bugReportMailto () {
      let subscriptionInfo = 'Not Subscribed';
      if (this.user.purchased.plan.customerId) {
        subscriptionInfo = `
          Subscription: ${this.user.purchased.plan.planId}%0d%0a
          Payment Platform: ${this.user.purchased.plan.paymentMethod}%0d%0a
          Customer ID: ${this.user.purchased.plan.customerId}%0d%0a
          Consecutive Months: ${this.user.purchased.plan.consecutive.count}%0d%0a
          Offset Months: ${this.user.purchased.plan.consecutive.offset}%0d%0a
          Mystic Hourglasses: ${this.user.purchased.plan.consecutive.trinkets}
        `;
      }
      return `mailto:admin@habitica.com?subject=Habitica Web Bug Report&body=
        Please describe the issue you encountered:%0d%0a%0d%0a
        User ID: ${this.user._id}%0d%0a
        Level: ${this.user.stats.lvl}%0d%0a
        Class: ${this.user.stats.class}%0d%0a
        Dailies Paused: ${this.user.preferences.sleep}%0d%0a
        Uses Costume: ${this.user.preferences.costume}%0d%0a
        Custom Day Start: ${this.user.preferences.dayStart}%0d%0a
        Timezone Offset: ${this.user.preferences.timezoneOffset}%0d%0a
        ${subscriptionInfo}
      `;
    },
  },
};
