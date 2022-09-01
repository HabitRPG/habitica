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
      <form @submit.prevent="saveSubscriptionData()">
        <div v-if="hero.purchased.plan.paymentMethod">
          Payment method:
          <strong>{{ hero.purchased.plan.paymentMethod }}</strong>
        </div>
        <div v-if="hero.purchased.plan.planId">
          Payment schedule ("basic-earned" is monthly):
          <strong>{{ hero.purchased.plan.planId }}</strong>
        </div>
        <div v-if="hero.purchased.plan.dateCreated">
          Creation date:
          <strong>{{ dateFormat(hero.purchased.plan.dateCreated) }}</strong>
        </div>
        <div>
          Termination date:
          <strong
            v-if="hero.purchased.plan.dateTerminated"
          >
            {{ dateFormat(hero.purchased.plan.dateTerminated) }}
          </strong>
          <strong v-else> None </strong>
        </div>
        <div class="form-inline">
          <label>
            Consecutive months:
            <input
              v-model="consecutiveMonths"
              class="form-control"
              type="number"
              min="0"
              step="1"
            >
          </label>
        </div>
        <div>
          Months until renewal:
          <strong>{{ hero.purchased.plan.consecutive.offset || 1}}</strong>
        </div>
          <div>
            Next Mystic Hourglass:
            <strong>{{ nextHourglassDate }}</strong>
          </div>
          <div class="form-inline">
            <label>
              Mystic Hourglasses:
              <input
                v-model="hero.purchased.plan.consecutive.trinkets"
                class="form-control"
                type="number"
                min="0"
                step="1"
              >
            </label>
          </div>
          <div>
            Gem cap:
            <strong>{{ hero.purchased.plan.consecutive.gemCapExtra + 25 }}</strong>
          </div>
          <div class="form-inline">
            <label>
              Gems bought this month:
              <input
                v-model="hero.purchased.plan.gemsBought"
                class="form-control"
                type="number"
                min="0"
                :max="hero.purchased.plan.consecutive.gemCapExtra + 25"
                step="1"
              >
            </label>
          </div>
        <div
          v-if="hero.purchased.plan.extraMonths > 0"
        >
          Additional credit (applied upon cancellation):
          <strong>{{ hero.purchased.plan.extraMonths }}</strong>
        </div>
        <div>
          Mystery Items:
          <span
            v-if="hero.purchased.plan.mysteryItems.length > 0"
          >
            <span
              v-for="(item, index) in hero.purchased.plan.mysteryItems"
              :key="index"
            >
              <strong v-if="index < hero.purchased.plan.mysteryItems.length - 1">
                {{ item }},
              </strong>
              <strong v-else> {{ item }} </strong>
            </span>
          </span>
          <span v-else>
            <strong>None</strong>
          </span>
        </div>
        <input
          type="submit"
          value="Save"
          class="btn btn-primary mt-1"
        >
      </form>
    </div>
  </div>
</template>

<script>
import clone from 'lodash/clone';
import moment from 'moment';
import saveHero from '../mixins/saveHero';
import { getPlanContext } from '@/../../common/script/cron';

export default {
  mixins: [saveHero],
  props: {
    hero: {
      type: Object,
      required: true,
    },
  },
  data () {
    return {
      consecutiveMonths: 0,
      expand: false,
    };
  },
  computed: {
    nextHourglassDate () {
      const pendingHero = clone(this.hero);
      pendingHero.purchased.plan.consecutive.count = this.consecutiveMonths;
      const currentPlanContext = getPlanContext(pendingHero, new Date());

      return currentPlanContext.nextHourglassDate.format('MMMM');
    },
  },
  watch: {
    consecutiveMonths () {
      this.hero.purchased.plan.consecutive.gemCapExtra = Math.min(
        Math.floor(this.consecutiveMonths / 3) * 5, 25,
      );
      if (this.hero.purchased.plan.gemsBought
        > this.hero.purchased.plan.consecutive.gemCapExtra + 25) {
        this.hero.purchased.plan.gemsBought = this.hero.purchased.plan.consecutive.gemCapExtra + 25;
      }
    },
  },
  mounted () {
    this.consecutiveMonths = clone(this.hero.purchased.plan.consecutive.count);
  },
  methods: {
    dateFormat (date) {
      return moment(date).format('YYYY/MM/DD');
    },
    saveSubscriptionData () {
      if (this.consecutiveMonths !== this.hero.purchased.plan.consecutive.count) {
        this.hero.purchased.plan.consecutive.count = this.consecutiveMonths;
      }
      this.saveHero({ hero: this.hero, msg: 'Subscription Perks' });
    },
  },
};
</script>
