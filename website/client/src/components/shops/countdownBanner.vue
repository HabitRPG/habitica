<template>
  <div class="limitedTime">
    <span
      class="svg-icon inline icon-16"
      v-html="icons.clock"
    ></span>
    <span class="limitedString"> {{ limitedString }} </span>
  </div>
</template>

<style lang="scss" scoped>
  @import '~@/assets/scss/colors.scss';

  .limitedTime {
    height: 32px;
    background-color: $purple-300;
    width: calc(100% + 30px);
    margin: 0 -15px; // the modal content has its own padding

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
</style>

<script>
import moment from 'moment';
import svgClock from '@/assets/svg/clock.svg';

export default {
  props: {
    endDate: {
      type: String,
    },
  },
  data () {
    return {
      icons: Object.freeze({
        clock: svgClock,
      }),
      timer: '',
      limitedString: '',
    };
  },
  mounted () {
    this.countdownString();
    this.timer = setInterval(this.countdownString, 30000);
  },
  methods: {
    countdownString () {
      const diffDuration = moment.duration(moment(this.endDate).diff(moment()));

      if (diffDuration.days() > 0) {
        this.limitedString = this.$t('limitedAvailabilityDays', {
          days: diffDuration.days(),
          hours: diffDuration.hours(),
          minutes: diffDuration.minutes(),
        });
      } else {
        this.limitedString = this.$t('limitedAvailabilityHours', {
          hours: diffDuration.hours(),
          minutes: diffDuration.minutes(),
        });
      }
    },
    cancelAutoUpdate () {
      clearInterval(this.timer);
    },
  },
  beforeDestroy () {
    this.cancelAutoUpdate();
  },
};
</script>
