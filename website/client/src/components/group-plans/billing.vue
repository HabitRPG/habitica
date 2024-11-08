<template>
  <div
    v-if="groupIsSubscribed && isLeader"
    class="row standard-page"
  >
    <div class="col-12 col-md-6 offset-md-3">
      <table class="table alert alert-info">
        <tr v-if="group.purchased.plan.dateTerminated">
          <td class="alert alert-warning">
            <span class="noninteractive-button btn-danger">{{ $t('canceledGroupPlan') }}</span>
            <i class="glyphicon glyphicon-time">{{ $t('groupPlanCanceled') }}</i>
            <strong>{{ dateTerminated }}</strong>
          </td>
        </tr>
        <tr v-if="!group.purchased.plan.dateTerminated">
          <td>
            <h3>{{ $t('paymentDetails') }}</h3>
            <p v-if="group.purchased.plan.planId">
              {{ $t('groupSubscriptionPrice') }}
            </p>
          </td>
        </tr>
        <tr v-if="group.purchased.plan.extraMonths">
          <td>
            <span class="glyphicon glyphicon-credit-card"></span>
            {{ $t('purchasedGroupPlanPlanExtraMonths', purchasedGroupPlanPlanExtraMonths) }}
          </td>
        </tr>
        <tr
          v-if="group.purchased.plan.consecutive.count || group.purchased.plan.consecutive.offset"
        >
          <td>
            <span class="glyphicon glyphicon-forward"></span>
            {{ $t('consecutiveSubscription') }}
            <ul class="list-unstyled">
              <li>{{ $t('consecutiveMonths') }} {{ group.purchased.plan.consecutive.count + group.purchased.plan.consecutive.offset }}</li> <!-- eslint-disable-line max-len -->
              <li>{{ $t('gemCapExtra') }} {{ group.purchased.plan.consecutive.gemCapExtra }}</li>
              <li>{{ $t('mysticHourglasses') }} {{ group.purchased.plan.consecutive.trinkets }}</li>
            </ul>
          </td>
        </tr>
      </table>
    </div>
    <div class="col-12 col-md-6 offset-md-3">
      <button
        v-if="group.purchased.plan.dateTerminated"
        class="btn btn-success btn-success"
        @click="upgradeGroup()"
      >
        {{ $t('upgradeToGroup') }}
      </button>
      <div
        v-if="!group.purchased.plan.dateTerminated
          && group.purchased.plan.paymentMethod === 'Stripe'"
        class="btn btn-primary"
        @click="redirectToStripeEdit({groupId: group.id})"
      >
        {{ $t('subUpdateCard') }}
      </div>
      <div
        v-if="!group.purchased.plan.dateTerminated"
        class="btn btn-sm btn-danger"
        @click="cancelSubscriptionConfirm({group: group})"
      >
        {{ $t('cancelGroupSub') }}
      </div>
    </div>
  </div>
</template>

<script>
import moment from 'moment';
import { mapState } from '@/libs/store';
import paymentsMixin from '@/mixins/payments';
import { CONSTANTS, getLocalSetting, removeLocalSetting } from '@/libs/userlocalManager';

export default {
  mixins: [paymentsMixin],
  props: ['groupId'],
  data () {
    return {
      group: {},
    };
  },
  computed: {
    ...mapState({ user: 'user.data' }),
    isLeader () {
      return this.user._id === this.group.leader._id;
    },
    groupIsSubscribed () {
      return this.group.purchased && this.group.purchased.plan
        && this.group.purchased.plan.customerId;
    },
    dateTerminated () {
      if (!this.user.preferences || !this.user.preferences.dateFormat) {
        return moment(this.group.purchased.plan.dateTerminated);
      }

      return moment(this.group.purchased.plan.dateTerminated)
        .format(this.user.preferences.dateFormat.toUpperCase());
    },
    purchasedGroupPlanPlanExtraMonths () {
      return {
        months: parseFloat(this.group.purchased.plan.extraMonths).toFixed(2),
      };
    },
  },
  async mounted () {
    await this.loadGroup();

    let appState = getLocalSetting(CONSTANTS.savedAppStateValues.SAVED_APP_STATE);
    if (appState) {
      appState = JSON.parse(appState);
      if (appState.groupPlanCanceled) {
        removeLocalSetting(CONSTANTS.savedAppStateValues.SAVED_APP_STATE);
        this.$root.$emit('habitica:subscription-canceled', {
          dateTerminated: this.dateTerminated,
          isGroup: true,
        });
      }
    }
  },
  methods: {
    async loadGroup () {
      const group = await this.$store.dispatch('guilds:getGroup', { groupId: this.groupId });
      this.group = { ...group };
    },
    upgradeGroup () {
      this.$store.state.upgradingGroup = this.group;
      this.$router.push('/group-plans');
    },
  },
};
</script>
