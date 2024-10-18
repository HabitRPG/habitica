<template>
  <form @submit.prevent="saveHero({ hero, msg: 'Subscription Perks' })">
    <div class="card mt-2">
      <div class="card-header">
        <h3
          class="mb-0 mt-0"
          :class="{ 'open': expand }"
          @click="expand = !expand"
        >
          Subscription, Monthly Perks
        </h3>
      </div>
      <div
        v-if="expand"
        class="card-body"
      >
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
          class="form-group row"
        >
          <label class="col-sm-3 col-form-label">
            Creation date:
          </label>
          <div class="col-sm-9">
            <div class="input-group">
              <input
                v-model="hero.purchased.plan.dateCreated"
                class="form-control"
                type="text"
              >
              <div class="input-group-append">
                <strong class="input-group-text">
                  {{ dateFormat(hero.purchased.plan.dateCreated) }}
                </strong>
              </div>
            </div>
          </div>
        </div>
        <div
          v-if="hero.purchased.plan.dateCurrentTypeCreated"
          class="form-group row"
        >
          <label class="col-sm-3 col-form-label">
            Current sub start date:
          </label>
          <div class="col-sm-9">
            <div class="input-group">
              <input
                v-model="hero.purchased.plan.dateCurrentTypeCreated"
                class="form-control"
                type="text"
              >
              <div class="input-group-append">
                <strong class="input-group-text">
                  {{ dateFormat(hero.purchased.plan.dateCurrentTypeCreated) }}
                </strong>
              </div>
            </div>
          </div>
        </div>
        <div class="form-group row">
          <label class="col-sm-3 col-form-label">
            Termination date:
          </label>
          <div class="col-sm-9">
            <div class="input-group">
              <input
                v-model="hero.purchased.plan.dateTerminated"
                class="form-control"
                type="text"
              >
              <div class="input-group-append">
                <strong class="input-group-text">
                  {{ dateFormat(hero.purchased.plan.dateTerminated) }}
                </strong>
              </div>
            </div>
          </div>
        </div>
        <div class="form-group row">
          <label class="col-sm-3 col-form-label">
            Cumulative months:
          </label>
          <div class="col-sm-9">
            <input
              v-model="hero.purchased.plan.cumulativeCount"
              class="form-control"
              type="number"
              min="0"
              step="1"
            >
          </div>
        </div>
        <div class="form-group row">
          <label class="col-sm-3 col-form-label">
            Received hourglass bonus:
          </label>
          <div class="col-sm-9">
            <div class="input-group">
              <input
                v-model="hero.purchased.plan.hourglassPromoReceived"
                class="form-control"
                type="text"
              >
              <div class="input-group-append">
                <strong class="input-group-text">
                  {{ dateFormat(hero.purchased.plan.hourglassPromoReceived) }}
                </strong>
              </div>
            </div>
          </div>
        </div>
        <div class="form-group row">
          <label class="col-sm-3 col-form-label">
            Mystic Hourglasses:
          </label>
          <div class="col-sm-9">
            <input
              v-model="hero.purchased.plan.consecutive.trinkets"
              class="form-control"
              type="number"
              min="0"
              step="1"
            >
          </div>
        </div>
        <div class="form-group row">
          <label class="col-sm-3 col-form-label">
            Gem cap increase:
          </label>
          <div class="col-sm-9">
            <input
              v-model="hero.purchased.plan.consecutive.gemCapExtra"
              class="form-control"
              type="number"
              min="0"
              max="26"
              step="2"
            >
          </div>
        </div>
        <div class="form-group row">
          <label class="col-sm-3 col-form-label">
            Total Gem cap:
          </label>
          <strong class="col-sm-9 col-form-label">
            {{ Number(hero.purchased.plan.consecutive.gemCapExtra) + 24 }}
          </strong>
        </div>
        <div class="form-group row">
          <label class="col-sm-3 col-form-label">
            Gems bought this month:
          </label>
          <div class="col-sm-9">
            <input
              v-model="hero.purchased.plan.gemsBought"
              class="form-control"
              type="number"
              min="0"
              :max="hero.purchased.plan.consecutive.gemCapExtra + 24"
              step="1"
            >
          </div>
        </div>
        <div v-if="hero.purchased.plan.extraMonths > 0">
          Additional credit (applied upon cancellation):
          <strong>{{ hero.purchased.plan.extraMonths }}</strong>
        </div>
        <div class="form-group row">
          <label class="col-sm-3 col-form-label">
            Mystery Items:
          </label>
          <div class="col-sm-9 col-form-label">
            <span v-if="hero.purchased.plan.mysteryItems.length > 0">
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
        </div>
      </div>
      <div
        v-if="expand"
        class="card-footer"
      >
        <input
          type="submit"
          value="Save"
          class="btn btn-primary mt-1"
        >
      </div>
    </div>
  </form>
</template>

<style lang="scss" scoped>
  @import '~@/assets/scss/colors.scss';

.input-group-append {
  width: auto;

  .input-group-text {
    border-bottom-right-radius: 2px;
    border-top-right-radius: 2px;
    font-weight: 600;
    font-size: 0.8rem;
    color: $gray-200;
  }
}
</style>

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

      if (!currentPlanContext.nextHourglassDate) return 'N/A';
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
