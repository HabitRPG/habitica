<template>
  <b-modal
    id="task-summary"
    :hide-footer="true"
    @show="syncTask()"
    @hidden="$emit('cancel')"
  >
    <div
      v-if="task"
      slot="modal-header"
      class="task-modal-header px-4 d-flex align-items-center"
      :class="cssClass('bg')"
    >
      <h2
        class="my-auto"
        :class="cssClass('headings')"
      >
        {{ title }}
      </h2>
      <div
        class="svg-icon color-stroke icon-12 close-x ml-auto my-auto"
        :class="cssClass('headings')"
        aria-hidden="true"
        tabindex="0"
        @click="cancel()"
        @keypress.enter="cancel()"
        v-html="icons.close"
      ></div>
    </div>
  </b-modal>
</template>

<style lang="scss">
  @import '~@/assets/scss/colors.scss';
  #task-summary {
    .modal-content {
      border-top-left-radius: 10px;
      border-top-right-radius: 10px;
      border: none;
      box-shadow: 0 14px 28px 0 rgba($black, 0.24), 0 10px 10px 0 rgba($black, 0.28);
    }

    .modal-header, .modal-body, .modal-footer {
      padding: 0px;
      border: none;
    }

    .modal-dialog {
      width: 448px;
      margin-top: 50vh;
      transform: translateY(-50%);
    }

    .modal-header {
      padding: 0px;
    }
  }
</style>

<style lang="scss" scoped>
  @import '~@/assets/scss/colors.scss';

  .close-x {
    height: 12px;
    width: 12px;
    position: relative;
    opacity: 0.75;

    &:hover, &:focus {
      opacity: 1;
    }
  }

  .task-modal-header {
    color: $white;
    height: 60px;
    width: 100%;
    border-top-left-radius: 8px;
    border-top-right-radius: 8px;

    h2 {
      color: $white;
    }
  }
</style>

<script>
import keys from 'lodash/keys';
import moment from 'moment';
import pickBy from 'lodash/pickBy';

import syncTask from '../../mixins/syncTask';
import { mapGetters } from '@/libs/store';

import closeIcon from '@/assets/svg/close.svg';

export default {
  mixins: [syncTask],
  props: ['task'],
  data () {
    return {
      expandDayString: {
        su: 'Sunday',
        m: 'Monday',
        t: 'Tuesday',
        w: 'Wednesday',
        th: 'Thursday',
        f: 'Friday',
        s: 'Saturday',
      },
      icons: Object.freeze({
        close: closeIcon,
      }),
    };
  },
  computed: {
    ...mapGetters({
      getTaskClasses: 'tasks:getTaskClasses',
    }),
    summarySentence () {
      if (this.task.type === 'daily' && moment().isBefore(this.task.startDate)) {
        return `This is ${this.formattedDifficulty(this.task.priority)} task that will repeat
        ${this.formattedRepeatInterval(this.task.frequency, this.task.everyX)}${this.formattedDays(this.task.frequency, this.task.repeat, this.task.daysOfMonth, this.task.weeksOfMonth, this.task.startDate)}
        starting on <strong>${moment(this.task.startDate).format('MM/DD/YYYY')}</strong>.`;
      }
      if (this.task.type === 'daily') {
        return `This is ${this.formattedDifficulty(this.task.priority)} task that repeats
        ${this.formattedRepeatInterval(this.task.frequency, this.task.everyX)}${this.formattedDays(this.task.frequency, this.task.repeat, this.task.daysOfMonth, this.task.weeksOfMonth, this.task.startDate)}.`;
      }
      if (this.task.date) {
        return `This is ${this.formattedDifficulty(this.task.priority)} task that is due <strong>${moment(this.task.date).format('MM/DD/YYYY')}.`;
      }
      return `This is ${this.formattedDifficulty(this.task.priority)} task.`;
    },
    title () {
      const type = this.$t(this.task.type);
      return this.$t('taskSummary', { type });
    },
  },
  methods: {
    cancel () {
      this.$root.$emit('bv::hide::modal', 'task-summary');
    },
    cssClass (suffix) {
      if (!this.task) {
        return '';
      }

      return this.getTaskClasses(this.task, `edit-modal-${suffix}`);
    },
    formattedDays (frequency, repeat, daysOfMonth, weeksOfMonth, startDate) {
      let activeDays;
      const dayStringArray = [];
      switch (frequency) {
        case 'weekly':
          activeDays = keys(pickBy(repeat, value => value === true));
          if (activeDays.length === 0) return ' on <strong>no days</strong>';
          if (activeDays.length === 7) return ' on <strong>every day of the week</strong>';
          dayStringArray.push(' on <strong>');
          activeDays.forEach((value, index) => {
            if (activeDays.length > 1 && index === activeDays.length - 1) dayStringArray.push(' and');
            dayStringArray.push(` ${this.expandDayString[value]}`);
            if (activeDays.length > 2 && index !== activeDays.length - 1) dayStringArray.push(',');
          });
          dayStringArray.push('</strong>');
          break;
        case 'monthly':
          dayStringArray.push(' on <strong>the ');
          if (daysOfMonth.length > 0) {
            daysOfMonth.forEach((value, index) => {
              const stringDay = String(value);
              const stringFinalDigit = stringDay.slice(-1);
              let ordinalSuffix = 'th';
              if (stringFinalDigit === '1' && stringDay !== '11') ordinalSuffix = 'st';
              if (stringFinalDigit === '2' && stringDay !== '12') ordinalSuffix = 'nd';
              if (stringFinalDigit === '3' && stringDay !== '13') ordinalSuffix = 'rd';
              if (daysOfMonth.length > 1 && index === daysOfMonth.length - 1) dayStringArray.push(' and');
              dayStringArray.push(`${stringDay}${ordinalSuffix}`);
              if (daysOfMonth.length > 2 && index !== daysOfMonth.length - 1) dayStringArray.push(',');
            });
            dayStringArray.push('</strong>');
          } else if (weeksOfMonth.length > 0) {
            switch (weeksOfMonth[0]) {
              case 0:
                dayStringArray.push('first');
                break;
              case 1:
                dayStringArray.push('second');
                break;
              case 2:
                dayStringArray.push('third');
                break;
              case 3:
                dayStringArray.push('fourth');
                break;
              case 4:
                dayStringArray.push('fifth');
                break;
              default:
                break;
            }
            activeDays = keys(pickBy(repeat, value => value === true));
            dayStringArray.push(` ${this.expandDayString[activeDays[0]]} of the month</strong>`);
          }
          break;
        case 'yearly':
          return ` on <strong>${moment(startDate).format('MMMM Do')}</strong>`;
        default:
          return '';
      }
      return dayStringArray.join('');
    },
    formattedDifficulty (priority) {
      switch (priority) {
        case 0.1:
          return 'a <strong>trivial</strong>';
        case 1:
          return 'an <strong>easy</strong>';
        case 1.5:
          return 'a <strong>medium</strong>';
        case 2:
          return 'a <strong>hard</strong>';
        default:
          return null;
      }
    },
    formattedRepeatInterval (frequency, everyX) {
      const numericX = Number(everyX);
      switch (frequency) {
        case 'daily':
          if (numericX === 1) return '<strong>every day</strong>';
          if (numericX === 2) return '<strong>every other day</strong>';
          return `<strong>every ${numericX} days</strong>`;
        case 'weekly':
          if (numericX === 1) return '<strong>every week</strong>';
          if (numericX === 2) return '<strong>every other week</strong>';
          return `<strong>every ${numericX} weeks</strong>`;
        case 'monthly':
          if (numericX === 1) return '<strong>every month</strong>';
          if (numericX === 2) return '<strong>every other month</strong>';
          return `<strong>every ${numericX} months</strong>`;
        case 'yearly':
          if (numericX === 1) return '<strong>every year</strong>';
          return `<strong>every ${everyX} years</strong>`;
        default:
          return null;
      }
    },
  },
};
</script>
