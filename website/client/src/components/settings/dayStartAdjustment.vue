<template>
  <div>
    <div>
      <h5>{{ $t('dayStartAdjustment') }}</h5>
      <div class="mb-4">
        {{ $t('customDayStartInfo1') }}
      </div>
      <h3 v-once>{{ $t('adjustment') }}</h3>
      <div class="form-horizontal">
        <div class="form-group">
          <div class="">
            <select
              v-model="newDayStart"
              class="form-control"
            >
              <option
                v-for="option in dayStartOptions"
                :key="option.value"
                :value="option.value"
              >
                {{ option.name }}
              </option>
            </select>
          </div>
          <div>
            <button
              class="btn btn-primary full-width mt-3"
              :disabled="newDayStart === user.preferences.dayStart"
              @click="openDayStartModal()"
            >
              {{ $t('save') }}
            </button>
          </div>
        </div>
      </div>
    </div>
    <div class="form-horizontal">
      <div class="form-group">
        <small>
          <p v-html="$t('timezoneUTC', {utc: timezoneOffsetToUtc})"></p>
          <p v-html="$t('timezoneInfo')"></p>
        </small>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import moment from 'moment';
import getUtcOffset from '../../../../common/script/fns/getUtcOffset';
import { mapState } from '@/libs/store';

export default {
  name: 'dayStartAdjustment',
  data () {
    const dayStartOptions = [];
    for (let number = 0; number <= 12; number += 1) {
      const meridian = number < 12 ? 'AM' : 'PM';
      const hour = number % 12;
      const timeWithMeridian = `(${hour || 12}:00 ${meridian})`;
      const option = {
        value: number,
        name: `+${number} hours ${timeWithMeridian}`,
      };

      if (number === 0) {
        option.name = `Default ${timeWithMeridian}`;
      }

      dayStartOptions.push(option);
    }

    return {
      newDayStart: 0,
      dayStartOptions,
    };
  },
  mounted () {
    this.newDayStart = this.user.preferences.dayStart;
  },
  computed: {
    ...mapState({
      user: 'user.data',
    }),
    timezoneOffsetToUtc () {
      const offsetString = moment().utcOffset(getUtcOffset(this.user)).format('Z');
      return `UTC${offsetString}`;
    },
    dayStart () {
      return this.user.preferences.dayStart;
    },
  },
  methods: {
    async saveDayStart () {
      this.user.preferences.dayStart = this.newDayStart;
      await axios.post('/api/v4/user/custom-day-start', {
        dayStart: this.newDayStart,
      });
      // @TODO
      // Notification.text(response.data.data.message);
    },
    openDayStartModal () {
      const nextCron = this.calculateNextCron();
      // @TODO: Add generic modal
      if (!window.confirm(this.$t('sureChangeCustomDayStartTime', { time: nextCron }))) return; // eslint-disable-line no-alert
      this.saveDayStart();
      // $rootScope.openModal('change-day-start', { scope: $scope });
    },
    calculateNextCron () {
      let nextCron = moment()
        .hours(this.newDayStart)
        .minutes(0)
        .seconds(0)
        .milliseconds(0);

      const currentHour = moment().format('H');
      if (currentHour >= this.newDayStart) {
        nextCron = nextCron.add(1, 'day');
      }

      return nextCron.format(`${this.user.preferences.dateFormat.toUpperCase()} @ h:mm a`);
    },
  },
};
</script>

<style scoped>
  .full-width {
    width: 100%;
  }
</style>
