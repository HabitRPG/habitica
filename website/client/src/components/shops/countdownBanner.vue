<template>
  <div
    class="limitedTime"
    :class="availabilityClass"
  >
    <span
      class="svg-icon inline icon-16"
      v-html="availabilityClass === 'expired' ? icons.clockWhite : icons.clock"
    ></span>
    <span class="limitedString"> {{ limitedString }} </span>
  </div>
</template>

<style lang="scss" scoped>
  @import '~@/assets/scss/colors.scss';

  .limitedTime {
    height: 32px;
    font-size: 12px;
    line-height: 1.33;
    text-align: center;
    color: $white;

    display: flex;
    align-items: center;
    justify-content: center;

    .limitedString {
      height: 16px;
      margin-left: 8px;
    }
  }

  .available {
    background-color: $purple-300;
  }
  .expired {
    background-color: $gray-200;
  }
</style>

<script>
import moment from 'moment';
import svgClock from '@/assets/svg/clock.svg';
import clockWhite from '@/assets/svg/clock-white.svg';

export default {
  props: {
    endDate: {
      type: Object, // moment
    },
  },
  data () {
    return {
      icons: Object.freeze({
        clock: svgClock,
        clockWhite,
      }),
      timer: '',
      limitedString: '',
      availabilityClass: 'available',
    };
  },
  mounted () {
    this.countdownString();
    this.timer = setInterval(this.countdownString, 1000);
  },
  beforeDestroy () {
    this.cancelAutoUpdate();
  },
  methods: {
    countdownString () {
      const diffDuration = moment.duration(moment(this.endDate).diff(moment()));

      if (moment(this.endDate).isBefore()) {
        this.limitedString = this.$t('noLongerAvailable');
        this.availabilityClass = 'expired';
        this.cancelAutoUpdate();
      } else if (diffDuration.days() > 0 || diffDuration.months() > 0) {
        this.limitedString = this.$t('limitedAvailabilityDays', {
          days: moment(this.endDate).diff(moment(), 'days'),
          hours: diffDuration.hours(),
          minutes: diffDuration.minutes(),
        });
      } else if (diffDuration.asMinutes() > 2) {
        this.limitedString = this.$t('limitedAvailabilityHours', {
          hours: diffDuration.hours(),
          minutes: diffDuration.minutes(),
        });
      } else {
        this.limitedString = this.$t('limitedAvailabilityMinutes', {
          minutes: diffDuration.minutes(),
          seconds: diffDuration.seconds(),
        });
      }
    },
    cancelAutoUpdate () {
      clearInterval(this.timer);
    },
  },
};
</script>
