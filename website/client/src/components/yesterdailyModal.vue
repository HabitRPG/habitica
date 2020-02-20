<template>
  <b-modal
    id="yesterdaily"
    size="m"
    :hide-header="true"
    :hide-footer="true"
    :no-close-on-backdrop="true"
    :no-close-on-esc="true"
    @hide="$emit('hide')"
  >
    <h1 class="header-welcome text-center">
      {{ $t('welcomeBack') }}
    </h1>
    <p class="call-to-action text-center">
      {{ $t('checkOffYesterDailies') }}
    </p>
    <div class="tasks-list">
      <task
        v-for="task in tasksByType.daily"
        :key="task.id"
        :task="task"
        :is-user="true"
        :due-date="dueDate"
      />
    </div>
    <div class="start-day text-center">
      <button
        class="btn btn-primary"
        @click="close()"
      >
        {{ $t('yesterDailiesCallToAction') }}
      </button>
    </div>
  </b-modal>
</template>

<style lang="scss">
  #yesterdaily {
    .modal-dialog {
      width: 22.625rem;
    }

    .task-wrapper:not(:last-of-type) {
      margin-bottom: 2px;
    }

    .modal-content {
      border-radius: 8px;
    }
  }
</style>

<style lang="scss" scoped>
  @import '~@/assets/scss/colors.scss';

  .header-welcome {
    color: $purple-200;
    margin-top: 1rem;
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
    overflow: auto;
  }

  .start-day {
    margin: 1.5rem auto 1rem auto;
  }
</style>

<script>
import moment from 'moment';
import { mapState } from '@/libs/store';
import Task from './tasks/task';

export default {
  components: {
    Task,
  },
  props: ['yesterDailies'],
  data () {
    return {
      dueDate: moment().subtract(1, 'days'),
    };
  },
  computed: {
    ...mapState({ user: 'user.data' }),
    tasksByType () {
      this.dueDate = moment().subtract(1, 'days'); // eslint-disable-line vue/no-side-effects-in-computed-properties

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
