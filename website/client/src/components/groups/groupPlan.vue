<template>
  <!-- @TODO: Move to group plans folder-->
  <div class="groups-container">
    <group-plan-creation-modal />
    <group-plans />
  </div>
</template>

<style lang="scss" scoped>
  .groups-container {
    background-color: white;
    background-image: url('../../assets/images/group-plans-static/top.svg');
    background-repeat: no-repeat;
    margin-left: -12px;
    margin-right: -12px;
  }
</style>

<script>
import groupPlans from '../static/groupPlans.vue';
import paymentsMixin from '../../mixins/payments';
import { mapState } from '@/libs/store';
// import paymentsButtons from '@/components/payments/buttons/list';
import groupPlanCreationModal from '../group-plans/groupPlanCreationModal';

export default {
  components: {
    // paymentsButtons,
    groupPlanCreationModal,
    groupPlans,
  },
  mixins: [paymentsMixin],
  data () {
    return {
      amazonPayments: {},
      PAGES: {
        CREATE_GROUP: 'create-group',
        UPGRADE_GROUP: 'upgrade-group',
        PAY: 'pay',
      },
      PAYMENTS: {
        AMAZON: 'amazon',
        STRIPE: 'stripe',
      },
      paymentMethod: '',
      newGroup: {
        type: 'guild',
        privacy: 'private',
        name: '',
        leaderOnly: {
          challenges: false,
        },
      },
      activePage: '',
      type: 'guild', // Guild or Party @TODO enum this
    };
  },
  computed: {
    newGroupIsReady () {
      return Boolean(this.newGroup.name);
    },
    upgradingGroup () {
      return this.$store.state.upgradingGroup;
    },
    // @TODO: can we move this to payment mixin?
    ...mapState({ user: 'user.data' }),
  },
  mounted () {
    this.activePage = this.PAGES.BENEFITS;
    this.$store.dispatch('common:setTitle', {
      section: this.$t('groupPlans'),
    });
  },
  methods: {
    launchModal () {
      this.$root.$emit('bv::show::modal', 'create-group');
    },
    createGroup () {
      this.changePage(this.PAGES.PAY);
    },
    pay (paymentMethod) {
      const subscriptionKey = 'group_monthly'; // @TODO: Get from content API?
      const paymentData = {
        subscription: subscriptionKey,
        coupon: null,
      };

      if (this.upgradingGroup && this.upgradingGroup._id) {
        paymentData.groupId = this.upgradingGroup._id;
        paymentData.group = this.upgradingGroup;
      } else {
        paymentData.groupToCreate = this.newGroup;
      }

      this.paymentMethod = paymentMethod;

      if (this.paymentMethod === this.PAYMENTS.AMAZON) {
        paymentData.type = 'subscription';
        return paymentData;
      }

      if (this.paymentMethod === this.PAYMENTS.STRIPE) {
        this.redirectToStripe(paymentData);
      }

      return null;
    },
  },
};
</script>
