<template lang="pug">
  b-modal#yesterdaily(
    size="m",
    :hide-header="true",
    :hide-footer="true",
    :no-close-on-backdrop="true",
    :no-close-on-esc="true",
    @hide="$emit('hide')",
  )
    .modal-body
      h1.header-welcome.text-center {{ $t('welcomeBack') }}
      p.call-to-action.text-center {{ $t('checkOffYesterDailies') }}
      .tasks-list
        task(
          v-for="task in tasksByType.daily",
          :key="task.id",
          :task="task",
          :isUser="true",
          :dueDate="dueDate",
        )
      .start-day.text-center
        button.btn.btn-primary(@click='close()') {{ $t('yesterDailiesCallToAction') }}
</template>

<style lang="scss" scoped>
  @import '~client/assets/scss/colors.scss';

  .header-welcome {
    color: $purple-200;
    margin-top: 1.33333em;
  }

  .call-to-action {
    font-size: 14px;
    font-weight: bold;
  }

  .tasks-list {
    border-radius: 4px;
    background: $gray-600;
    padding: 8px;
    padding-bottom: 0.1px;
    position: relative;
    height: calc(100% - 64px);
    overflow: auto;
  }

  .start-day {
    margin: 2em auto 2em auto;
  }
</style>

<script>
import moment from 'moment';
import { mapState } from 'client/libs/store';
import Task from './tasks/task';

export default {
  props: ['yesterDailies'],
  components: {
    Task,
  },
  data () {
    return {
      dueDate: moment().subtract(1, 'days'),
    };
  },
  computed: {
    ...mapState({user: 'user.data'}),
    tasksByType () {
      this.dueDate = moment().subtract(1, 'days');

      return {
        daily: this.yesterDailies,
      };
    },
  },
  methods: {
    async close () {
      this.$root.$emit('bv::hide::modal', 'yesterdaily');
      this.$emit('run-cron');
    },
  },
};
</script>
