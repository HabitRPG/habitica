<template>
  <b-modal
    id="broken-task-modal"
    :hide-footer="true"
    :hide-header="true"
    modal-class="broken-task-confirm-modal"
    centered
  >
    <div
      v-if="brokenChallengeTask && brokenChallengeTask.challenge"
      class="modal-content-wrapper"
    >
      <div class="top-bar"></div>
      <div class="modal-body-content">
        <div
          class="icon-wrapper"
          v-html="icons.alertIcon"
        ></div>
        <h2 class="modal-title">
          {{ modalTitle }}
        </h2>
        <p class="modal-subtitle">
          {{ modalSubtitle }}
        </p>
        <div class="button-wrapper">
          <button
            class="btn btn-primary"
            @click="keepAction()"
          >
            {{ keepButtonText }}
          </button>
          <button
            class="btn btn-danger"
            @click="removeAction()"
          >
            {{ removeButtonText }}
          </button>
          <button
            class="btn-cancel"
            @click="close()"
          >
            {{ $t('cancel') }}
          </button>
        </div>
      </div>
    </div>
  </b-modal>
</template>

<style lang="scss" scoped>
@import '@/assets/scss/colors.scss';

::v-deep .broken-task-confirm-modal {
  .modal-dialog {
    max-width: 330px;
    margin: auto;
  }

  .modal-content {
    border-radius: 8px;
    overflow: hidden;
    border: none;
  }

  .modal-body {
    padding: 0;
  }
}

.modal-content-wrapper {
  display: flex;
  flex-direction: column;
}

.top-bar {
  height: 8px;
  background-color: $maroon-100;
}

.modal-body-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0 24px 24px;
}

.icon-wrapper {
  margin-top: 40px;
  width: 48px;
  height: 48px;

  ::v-deep svg {
    width: 48px;
    height: 48px;

    path {
      fill: #DE3F3F;
    }
  }
}

.modal-title {
  margin-top: 16px;
  margin-bottom: 0;
  color: $maroon-100;
  font-family: 'Roboto Condensed', sans-serif;
  font-weight: 700;
  font-size: 20px;
  text-align: center;
}

.modal-subtitle {
  margin-top: 12px;
  margin-bottom: 0;
  font-family: Roboto, sans-serif;
  font-weight: 400;
  font-size: 14px;
  line-height: 24px;
  letter-spacing: 0;
  text-align: center;
  color: $gray-50;
}

.button-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  margin-top: 16px;
  gap: 8px;
}

.btn-cancel {
  background: none;
  border: none;
  color: $purple-300;
  font-family: Roboto, sans-serif;
  font-weight: 400;
  font-size: 14px;
  line-height: 24px;
  letter-spacing: 0;
  cursor: pointer;
  padding: 8px 16px;

  &:hover {
    text-decoration: underline;
  }
}
</style>

<script>
import { mapActions } from '@/libs/store';
import notifications from '@/mixins/notifications';
import alertIcon from '@/assets/svg/for-css/alert.svg?raw';

export default {
  mixins: [notifications],
  data () {
    return {
      brokenChallengeTask: {},
      icons: Object.freeze({
        alertIcon,
      }),
    };
  },
  computed: {
    brokenType () {
      return this.brokenChallengeTask.challenge?.broken;
    },
    isSingleTask () {
      return this.brokenType === 'TASK_DELETED'
        || this.brokenType === 'CHALLENGE_TASK_NOT_FOUND';
    },
    brokenChallengeTaskCount () {
      if (!this.brokenChallengeTask.challenge?.id) return 0;
      const challengeId = this.brokenChallengeTask.challenge.id;
      const tasksData = this.$store.state.tasks.data;
      let count = 0;
      ['habits', 'dailys', 'todos', 'rewards'].forEach(type => {
        if (tasksData[type]) {
          count += tasksData[type].filter(
            t => t.challenge && t.challenge.id === challengeId,
          ).length;
        }
      });
      return count;
    },
    modalTitle () {
      if (this.isSingleTask) {
        return this.$t('brokenTask');
      }
      if (this.brokenType === 'CHALLENGE_CLOSED') {
        return this.$t('challengeCompleted');
      }
      return this.$t('brokenChallenge');
    },
    modalSubtitle () {
      if (this.isSingleTask) {
        return this.$t('brokenTaskDescription');
      }
      if (this.brokenType === 'CHALLENGE_CLOSED') {
        return this.$t('challengeCompletedDescription', { user: this.brokenChallengeTask.challenge?.winner });
      }
      return this.$t('brokenChallengeDescription');
    },
    keepButtonText () {
      if (this.isSingleTask) {
        return this.$t('keepIt');
      }
      return this.$t('keepTasks');
    },
    removeButtonText () {
      if (this.isSingleTask) {
        return this.$t('removeIt');
      }
      return this.$t('removeTasks');
    },
  },
  mounted () {
    this.$root.$on('handle-broken-task', task => {
      this.brokenChallengeTask = { ...task };
      this.$root.$emit('bv::show::modal', 'broken-task-modal');
    });
  },
  beforeDestroy () {
    this.$root.$off('handle-broken-task');
  },
  methods: {
    ...mapActions({
      destroyTask: 'tasks:destroy',
      unlinkOneTask: 'tasks:unlinkOneTask',
      unlinkAllTasks: 'tasks:unlinkAllTasks',
    }),
    keepAction () {
      if (this.isSingleTask) {
        this.unlink('keep');
      } else {
        this.unlink('keep-all');
      }
    },
    async removeAction () {
      if (this.isSingleTask) {
        await this.removeTask();
      } else {
        await this.unlink('remove-all');
      }
    },
    async unlink (keepOption) {
      if (keepOption.indexOf('-all') !== -1) {
        if (keepOption === 'remove-all') {
          const count = this.brokenChallengeTaskCount;
          const confirmed = await new Promise(resolve => {
            this.$root.$emit('habitica:delete-task-confirm', {
              title: count === 1 ? this.$t('deleteTask') : this.$t('deleteXTasks', { count }),
              description: this.$t('brokenChallengeTaskCount', { count }),
              message: this.$t('confirmDeleteTasks'),
              buttonText: count === 1 ? this.$t('deleteTask') : this.$t('deleteXTasks', { count }),
              resolve,
            });
          });
          if (!confirmed) return;
        }

        await this.unlinkAllTasks({
          challengeId: this.brokenChallengeTask.challenge.id,
          keep: keepOption,
        });

        await this.$store.dispatch('tasks:fetchUserTasks', { forceLoad: true });

        if (this.brokenChallengeTask.type === 'todo') {
          await this.$store.dispatch('tasks:fetchCompletedTodos', { forceLoad: true });
        }

        this.close();
        return;
      }

      this.unlinkOneTask({
        task: this.brokenChallengeTask,
        keep: keepOption,
      });
      this.close();
    },
    async removeTask () {
      const confirmed = await new Promise(resolve => {
        this.$root.$emit('habitica:delete-task-confirm', {
          message: this.$t('sureDelete'),
          resolve,
        });
      });
      if (!confirmed) return;
      this.destroyTask(this.brokenChallengeTask);
      this.close();
    },
    close () {
      this.$store.state.brokenChallengeTask = {};
      this.$root.$emit('bv::hide::modal', 'broken-task-modal');
    },
  },
};
</script>
