<template lang="pug">
.row.standard-page(v-if='groupIsSubscribed && isLeader')
  .col-12.col-md-6.offset-md-3
    table.table.alert.alert-info
      tr(v-if='group.purchased.plan.dateTerminated')
        td.alert.alert-warning
          span.noninteractive-button.btn-danger {{ $t('canceledGroupPlan') }}
          i.glyphicon.glyphicon-time {{ $t('groupPlanCanceled') }}
          strong {{dateTerminated}}
      tr(v-if='!group.purchased.plan.dateTerminated')
        td
          h3 {{ $t('paymentDetails') }}
          p(v-if='group.purchased.plan.planId') {{ $t('groupSubscriptionPrice') }}
      tr(v-if='group.purchased.plan.extraMonths')
        td
          span.glyphicon.glyphicon-credit-card
          | {{ $t('purchasedGroupPlanPlanExtraMonths', purchasedGroupPlanPlanExtraMonths) }}
      tr(v-if='group.purchased.plan.consecutive.count || group.purchased.plan.consecutive.offset')
        td
          span.glyphicon.glyphicon-forward
          | {{ $t('consecutiveSubscription') }}
          ul.list-unstyled
            li {{ $t('consecutiveMonths') }} {{group.purchased.plan.consecutive.count + group.purchased.plan.consecutive.offset}}
            li {{ $t('gemCapExtra') }} {{group.purchased.plan.consecutive.gemCapExtra}}
                li {{ $t('mysticHourglasses') }} {{group.purchased.plan.consecutive.trinkets}}
  .col-12.col-md-6.offset-md-3
    button.btn.btn-success(class='btn-success', v-if='group.purchased.plan.dateTerminated', @click='upgradeGroup()')
      | {{ $t('upgrade') }}
    .btn.btn-primary(v-if='!group.purchased.plan.dateTerminated && group.purchased.plan.paymentMethod === "Stripe"',
      @click='showStripeEdit({groupId: group.id})') {{ $t('subUpdateCard') }}
    .btn.btn-sm.btn-danger(v-if='!group.purchased.plan.dateTerminated',
      @click='cancelSubscription({group: group})') {{ $t('cancelGroupSub') }}
</template>

<script>
import moment from 'moment';
import { mapState } from 'client/libs/store';
import paymentsMixin from 'client/mixins/payments';

export default {
  mixins: [paymentsMixin],
  props: ['groupId'],
  data () {
    return {
      group: {},
    };
  },
  mounted () {
    this.loadGroup();
  },
  computed: {
    ...mapState({user: 'user.data'}),
    isLeader () {
      return this.user._id === this.group.leader._id;
    },
    groupIsSubscribed () {
      return this.group.purchased && this.group.purchased.plan && this.group.purchased.plan.customerId;
    },
    dateTerminated () {
      if (!this.user.preferences || !this.user.preferences.dateFormat) return moment(this.group.purchased.plan.dateTerminated);
      return moment(this.group.purchased.plan.dateTerminated).format(this.user.preferences.dateFormat.toUpperCase());
    },
    purchasedGroupPlanPlanExtraMonths () {
      return {
        months: parseFloat(this.group.purchased.plan.extraMonths).toFixed(2),
      };
    },
  },
  methods: {
    async loadGroup () {
      let group = await this.$store.dispatch('guilds:getGroup', {groupId: this.groupId});
      this.group = Object.assign({}, group);
    },
    upgradeGroup () {
      this.$store.state.upgradingGroup = this.group;
      this.$router.push('/group-plans');
    },
  },
};
</script>
