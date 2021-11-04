<template>
  <b-modal
    id="broken-task-modal"
    title="Broken Challenge"
    size="sm"
    :hide-footer="true"
  >
    <div
      v-if="brokenChallengeTask && brokenChallengeTask.challenge"
      class="modal-body"
    >
      <div
        v-if="brokenChallengeTask.challenge.broken === 'TASK_DELETED'
          || brokenChallengeTask.challenge.broken === 'CHALLENGE_TASK_NOT_FOUND'"
      >
        <h2>{{ $t('brokenTask') }}</h2>
        <div>
          <button
            class="btn btn-primary"
            @click="unlink('keep')"
          >
            {{ $t('keepIt') }}
          </button>
          <button
            class="btn btn-danger"
            @click="removeTask(obj)"
          >
            {{ $t('removeIt') }}
          </button>
        </div>
      </div>
      <div v-if="brokenChallengeTask.challenge.broken === 'CHALLENGE_DELETED'">
        <h2>{{ $t('brokenChallenge') }}</h2>
        <div>
          <button
            class="btn btn-primary"
            @click="unlink('keep-all')"
          >
            {{ $t('keepTasks') }}
          </button>
          <button
            class="btn btn-danger"
            @click="unlink('remove-all')"
          >
            {{ $t('removeTasks') }}
          </button>
        </div>
      </div>
      <div v-if="brokenChallengeTask.challenge.broken === 'CHALLENGE_CLOSED'">
        <h2 v-html="$t('challengeCompleted', {user: brokenChallengeTask.challenge.winner})"></h2>
        <div>
          <button
            class="btn btn-primary"
            @click="unlink('keep-all')"
          >
            {{ $t('keepTasks') }}
          </button>
          <button
            class="btn btn-danger"
            @click="unlink('remove-all')"
          >
            {{ $t('removeTasks') }}
          </button>
        </div>
      </div>
    </div>
  </b-modal>
</template>

<style scoped>
  .modal-body {
    padding-bottom: 2em;
  }
</style>

<script>
import { mapActions } from '@/libs/store';
import notifications from '@/mixins/notifications';

export default {
  mixins: [notifications],
  data () {
    return {
      brokenChallengeTask: {},
    };
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
    async unlink (keepOption) {
      if (keepOption.indexOf('-all') !== -1) {
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
    removeTask () {
      if (!window.confirm('Are you sure you want to delete this task?')) return; // eslint-disable-line no-alert
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
