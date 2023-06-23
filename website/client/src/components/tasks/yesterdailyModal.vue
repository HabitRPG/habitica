<template>
  <b-modal
    id="yesterdaily"
    size="m"
    :hide-header="true"
    :hide-footer="true"
    :no-close-on-backdrop="true"
    :no-close-on-esc="true"
    @hide="$emit('hide')"
    @hidden="$emit('hidden')"
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
        :is-yesterdaily="true"
      />
    </div>
    <div class="start-day text-center">
      <button
        :disabled="isLoading"
        class="btn btn-primary"
        @click="processYesterdailies()"
      >
        <span v-if="!isLoading">{{ $t('yesterDailiesCallToAction') }}</span>
        <loading-spinner v-else />
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
import externalLinks from '@/mixins/externalLinks';
import scoreTask from '@/mixins/scoreTask';
import sync from '@/mixins/sync';
import Task from './task';
import LoadingSpinner from '../ui/loadingSpinner';

export default {
  components: {
    Task,
    LoadingSpinner,
  },
  mixins: [externalLinks, scoreTask, sync],
  props: {
    yesterDailies: {
      type: Array,
    },
    cronAction: {
      type: Function,
    },
  },
  data () {
    return {
      isLoading: false,
      dueDate: moment().subtract(1, 'days'),
    };
  },
  updated () {
    window.setTimeout(() => {
      this.handleExternalLinks();
    }, 500);
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
    async processYesterdailies () {
      if (this.isLoading) return;
      this.isLoading = true;

      const bulkScoreParams = this.yesterDailies
        .filter(yesterdaily => yesterdaily.completed)
        .map(yesterdaily => ({ id: yesterdaily._id, direction: 'up' }));

      if (bulkScoreParams.length > 0) {
        try {
          const bulkScoresponse = await this.$store.dispatch('tasks:bulkScore', bulkScoreParams);

          // Bundle critical hits and quests updates into a single notification
          const bundledTmp = {};

          bulkScoresponse.data.data.tasks.forEach(taskResponse => {
            taskResponse._tmp = taskResponse._tmp || {};
            const tmp = taskResponse._tmp;
            if (tmp.crit) {
              if (!bundledTmp.crit) {
                bundledTmp.crit = 0;
              }

              bundledTmp.crit += tmp.crit;

              tmp.crit = undefined;
            }

            if (tmp.quest) {
              if (!bundledTmp.quest) {
                bundledTmp.quest = { progressDelta: 0, collection: 0 };
              }

              if (tmp.quest.progressDelta) {
                bundledTmp.quest.progressDelta += tmp.quest.progressDelta;
              }
              if (tmp.quest.collection) bundledTmp.quest.collection += tmp.quest.collection;

              tmp.quest = undefined;
            }
          });

          this.handleTaskScoreNotifications(bundledTmp);

          bulkScoresponse.data.data.tasks.forEach(taskResponse => {
            this.handleTaskScoreNotifications(taskResponse._tmp);
          });
        } catch (err) {
          // Reset the modal so that it can be used again
          // Then throw the error again to make sure it's handled correctly
          // and the user is notified.

          this.yesterDailies.forEach(y => { y.completed = false; });
          this.isLoading = false;
          throw err;
        }
      }

      await this.cronAction();

      this.isLoading = false;
      this.$root.$emit('bv::hide::modal', 'yesterdaily');
      if (this.$route.fullPath.indexOf('task-information') !== -1) this.sync();
    },
  },
};
</script>
