<template>
  <div class="accordion-group">
    <h3
      class="expand-toggle"
      :class="{'open': expand}"
      @click="toggleTransactionsOpen"
    >
      Transactions
    </h3>
    <div v-if="expand">
      <purchase-history-table
        :gem-transactions="gemTransactions"
        :hourglass-transactions="hourglassTransactions"
      />
    </div>
  </div>
</template>

<script>
import PurchaseHistoryTable from '../../ui/purchaseHistoryTable.vue';
import { userStateMixin } from '../../../mixins/userState';

export default {
  components: {
    PurchaseHistoryTable,
  },
  mixins: [userStateMixin],
  props: {
    hero: {
      type: Object,
      required: true,
    },
    resetCounter: {
      type: Number,
      required: true,
    },
  },
  data () {
    return {
      expand: false,
      gemTransactions: [],
      hourglassTransactions: [],
    };
  },
  watch: {
    resetCounter () {
      if (this.expand) {
        this.expand = !this.expand;
        this.toggleTransactionsOpen();
      }
    },
  },
  methods: {
    async toggleTransactionsOpen () {
      this.expand = !this.expand;
      if (this.expand) {
        const transactions = await this.$store.dispatch('members:getPurchaseHistory', { memberId: this.hero._id });
        this.gemTransactions = transactions.filter(transaction => transaction.currency === 'gems');
        this.hourglassTransactions = transactions.filter(transaction => transaction.currency === 'hourglasses');
      }
    },
  },
};
</script>
