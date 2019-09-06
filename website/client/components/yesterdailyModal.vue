<template lang="pug">
  b-modal#yesterdaily(
    size="m",
    :hide-header="true",
    :hide-footer="true",
    :no-close-on-backdrop="true",
    :no-close-on-esc="true",
    @hide="$emit('hide')",
  )
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

<style lang="scss">
  #yesterdaily {
    .modal-dialog {
      width: 362px;
    }

    .task-wrapper:not(:last-of-type) {
      margin-bottom: 4px;
    }

    .modal-content {
      border-radius: 8px;
    }
  }
</style>

<style lang="scss" scoped>
  @import '~client/assets/scss/colors.scss';

  .header-welcome {
    color: $purple-200;
    margin-top: 16px;
  }

  .call-to-action {
    font-size: 14px;
    font-weight: bold;
  }

  .tasks-list {
    border-radius: 4px;
    background: $gray-600;
    padding: 8px;
    position: relative;
    height: calc(100% - 64px);
    overflow: auto;
  }

  .start-day {
    margin: 24px auto 16px auto;
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
