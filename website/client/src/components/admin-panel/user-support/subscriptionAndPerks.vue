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
      <form @submit.prevent="saveHero({ hero, msg: 'Subscription Perks' })">
        <div v-if="hero.purchased.plan.paymentMethod">
          Payment method:
          <strong>{{ hero.purchased.plan.paymentMethod }}</strong>
        </div>
        <div v-if="hero.purchased.plan.planId">
          Payment schedule ("basic-earned" is monthly):
          <strong>{{ hero.purchased.plan.planId }}</strong>
        </div>
        <div v-if="hero.purchased.plan.planId == 'group_plan_auto'">
          Group plan ID:
          <strong>{{ hero.purchased.plan.owner }}</strong>
        </div>
        <div
          v-if="hero.purchased.plan.dateCreated"
          class="form-inline"
        >
          <label>
            Creation date:
            <input
              v-model="hero.purchased.plan.dateCreated"
              class="form-control"
              type="text"
            > <strong class="ml-2">{{ dateFormat(hero.purchased.plan.dateCreated) }}</strong>
          </label>
        </div>
        <div
          v-if="hero.purchased.plan.dateCurrentTypeCreated"
          class="form-inline"
        >
          <label>
            Start date for current subscription type:
            <input
              v-model="hero.purchased.plan.dateCurrentTypeCreated"
              class="form-control"
              type="text"
            >
          </label>
          <strong class="ml-2">{{ dateFormat(hero.purchased.plan.dateCurrentTypeCreated) }}</strong>
        </div>
        <div class="form-inline">
          <label>
            Termination date:
            <div>
              <input
                v-model="hero.purchased.plan.dateTerminated"
                class="form-control"
                type="text"
              > <strong class="ml-2">{{ dateFormat(hero.purchased.plan.dateTerminated) }}</strong>
            </div>
          </label>
        </div>
        <div class="form-inline">
          <label>
            Consecutive months:
            <input
              v-model="hero.purchased.plan.consecutive.count"
              class="form-control"
              type="number"
              min="0"
              step="1"
            >
          </label>
        </div>
        <div class="form-inline">
          <label>
            Perk offset months:
            <input
              v-model="hero.purchased.plan.consecutive.offset"
              class="form-control"
              type="number"
              min="0"
              step="1"
            >
          </label>
        </div>
        <div class="form-inline">
          Perk month count:
          <input
            v-model="hero.purchased.plan.perkMonthCount"
            class="form-control"
            type="number"
            min="0"
            max="2"
            step="1"
          >
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
        <div class="form-inline">
          <label>
            Gem cap increase:
            <input
              v-model="hero.purchased.plan.consecutive.gemCapExtra"
              class="form-control"
              type="number"
              min="0"
              max="25"
              step="5"
            >
          </label>
        </div>
        <div>
          Total Gem cap:
          <strong>{{ Number(hero.purchased.plan.consecutive.gemCapExtra) + 25 }}</strong>
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
import moment from 'moment';
import { getPlanContext } from '@/../../common/script/cron';
import saveHero from '../mixins/saveHero';

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
      expand: false,
    };
  },
  computed: {
    nextHourglassDate () {
      const currentPlanContext = getPlanContext(this.hero, new Date());

      return currentPlanContext.nextHourglassDate.format('MMMM YYYY');
    },
  },
  methods: {
    dateFormat (date) {
      if (!date) {
        return '--';
      }
      return moment(date).format('YYYY/MM/DD');
    },
  },
};
</script>
