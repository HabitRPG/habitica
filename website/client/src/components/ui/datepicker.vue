<template>
  <datepicker
    v-model="value"
    :calendar-button="true"
    :calendar-button-icon-content="icons.calendar"
    :bootstrap-styling="true"
    :clear-button="false"
    :today-button="false"
    :disabled-picker="disabled"
    :class="{disabled: disabled}"
    :highlighted="highlighted"
    calendar-class="calendar-padding"
    @input="upDate($event)"
  >
    <div
      v-if="clearButton && value"
      slot="afterDateInput"
      class="vdp-datepicker__clear-button"
      @click="upDate(null)"
      v-html="icons.close"
    >
    </div>
    <div slot="beforeCalendarHeader">
      <div class="datetime-buttons">
        <button
          class="btn btn-flat"
          type="button"
          @click="setToday()"
        >
          {{ $t('today') }}
        </button>
        <button
          class="btn btn-flat"
          type="button"
          @click="setTomorrow()"
        >
          {{ $t('tomorrow') }}
        </button>
      </div>
    </div>
  </datepicker>
</template>

<script>
import moment from 'moment';
import datepicker from 'vuejs-datepicker';
import calendarIcon from '@/assets/svg/calendar.svg';
import closeIcon from '@/assets/svg/close.svg';

export default {
  components: {
    datepicker,
  },
  props: ['date', 'disabled', 'highlighted', 'clearButton'],
  data () {
    return {
      value: this.date,
      icons: Object.freeze({
        calendar: calendarIcon,
        close: closeIcon,
      }),
    };
  },
  watch: {
    date () {
      this.value = this.date;
    },
  },
  methods: {
    upDate (after) {
      this.value = after;
      this.$emit('update:date', after);
    },
    setToday () {
      this.upDate(moment().toDate());
    },
    setTomorrow () {
      this.upDate(moment().add(1, 'day').toDate());
    },
  },
};
</script>

<style lang="scss">
  @import '~@/assets/scss/colors.scss';

  .vdp-datepicker__calendar {
    bottom: 2.125rem;  // 2rem input control height + 0.125rem margin above
  }

 .vdp-datepicker {
    .input-group-append {
      width: auto;
      min-width: 2rem;
    }
  }

  .vdp-datepicker__calendar-button .svg-icon {
    width: 12px;
    height: 12px;
  }

   .vdp-datepicker.disabled, .input-group-outer.disabled {
      .input-group:hover {
        border-color: $gray-400;
      }

      .input-group .form-control {
        background-color: $gray-700;
        border-color: $gray-500;
        color: $gray-200;
      }

      svg path {
        opacity: 0.75;
        fill: $gray-200;
      }
    }

  .vdp-datepicker .vdp-datepicker__calendar {
    width: 100%;
    padding: 0.5rem;

    .datetime-buttons {
      height: 50px;

      button {
        padding: 0;
        margin: 0.5rem;
        height: 1.5rem;
        border-radius: 2px;
        background-color: $gray-600;
        color: $gray-100;

        &:not(:hover) {
          box-shadow: none;
        }

        &:hover {
          color: $purple-300;
        }
      }
    }

    header, .datetime-buttons {
      min-height: 40px;
      margin-top: -0.5rem;
      margin-left: -0.5rem;
      margin-right: -0.5rem;
      background-color: $gray-700 !important;
    }

    .calendar-padding {
      margin: 0.25rem;
    }

    &.picker_day {
      .cell:not(.disabled) {
        width: calc(100% / 7);
        border-radius: 2px;
        font-size: 14px;
        line-height: 1.21;
        text-align: center;
        padding: 0.65rem 0.35rem;
      }
    }

    .cell:not(.blank):not(.disabled).day:hover {
      border-radius: 2px;
      border: 1px solid $purple-400;
    }

    .cell.selected,
    .cell.selected.highlighted,
    .cell.selected:hover {
      color: $white;
      background: $purple-300;
    }

    .cell.highlighted {
      background: rgba($purple-600, 0.25);
      color: $purple-300;

      font-weight: bold;
    }

    .cell.highlighted,
    .cell.selected {
      border-radius: 2px;
      font-weight: bold;
    }

    .cell.day-header {
      font-size: 12px;
      font-weight: bold;
      line-height: 1.33;
      text-align: center;
      color: $gray-100;
    }

    .month__year_btn, .day__month_btn {
      font-size: 14px;
      font-weight: bold;
      text-align: center;
      color: $gray-50;
    }
  }

  .vdp-datepicker__clear-button {
    background: transparent !important;
    display: block;
    height: 30px;
    cursor: pointer;

    svg {
      margin: auto 0.75rem;
      width: 0.563rem;
      height: 30px;
    }
  }
</style>
