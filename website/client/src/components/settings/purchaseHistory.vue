<template>
  <div class="standard-page">
    <purchase-history-table
      :gem-transactions="gemTransactions"
      :hourglass-transactions="hourglassTransactions"
    />
  </div>
</template>

<script>
import { mapState } from '@/libs/store';
import PurchaseHistoryTable from '../ui/purchaseHistoryTable.vue';

export default {
  components: {
    PurchaseHistoryTable,
  },
  data () {
    return {
      gemTransactions: [],
      hourglassTransactions: [],
    };
  },
  computed: {
    ...mapState({ user: 'user.data' }),
  },
  async mounted () {
    this.$store.dispatch('common:setTitle', {
      section: this.$t('settings'),
      subSection: this.$t('transactions'),
    });

    const history = await this.$store.dispatch('user:getPurchaseHistory');
    this.gemTransactions = history.filter(transaction => transaction.currency === 'gems');
    this.hourglassTransactions = history.filter(transaction => transaction.currency === 'hourglasses');
  },
};
</script>
