<template>
  <div class="accordion-group">
    <h3
      class="expand-toggle"
      :class="{'open': expand}"
      @click="expand = !expand"
    >
      Subscription, Monthly Perks
    </h3>
    <div v-if="expand">
      <div v-if="subscription.paymentMethod">
        Payment Method:
        <strong>{{ subscription.paymentMethod }}</strong>
      </div>
      <div v-if="subscription.planId">
        Payment Schedule ("basic-earned" is monthly):
        <strong>{{ subscription.planId }}</strong>
      </div>
      <div v-if="subscription.dateCreated">
        Creation Date:
        <strong>{{ moment(subscription.dateCreated).format('YYYY/MM/DD') }}</strong>
      </div>
      <div v-if="subscription.dateTerminated">
        Termination Date:
        <strong>{{ moment(subscription.dateTerminated).format('YYYY/MM/DD') }}</strong>
      </div>
      <div>
        Consecutive Months:
        <strong>{{ subscription.consecutive.count }}</strong>
      </div>
      <div>
        Months Until Renewal:
        <strong>{{ subscription.consecutive.offset }}</strong>
      </div>
      <div>
        Gem Cap:
        <strong>{{ subscription.consecutive.gemCapExtra + 25 }}</strong>
      </div>
      <div
        v-if="subscription.extraMonths > 0"
      >
        Additional Credit (applied upon cancellation):
        <strong>{{ subscription.extraMonths }}</strong>
      </div>
      <div>
        Mystery Items:
        <span
          v-for="(item, index) in subscription.mysteryItems"
          :key="index"
        >
          <strong v-if="index < subscription.mysteryItems.length"> {{ item }}, </strong>
          <strong v-else> {{ item }} </strong>
        </span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    subscription: {
      type: Object,
      required: true,
    },
  },
  data () {
    return {
      expand: false,
    };
  },
};
</script>
