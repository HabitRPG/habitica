<template>
  <b-modal
    id="leave-challenge-modal"
    :title="$t('leaveChallenge')"
    size="sm"
    :hide-footer="true"
  >
    <div class="modal-body">
      <h2>{{ $t('confirmKeepChallengeTasks') }}</h2>
      <div>
        <button
          class="btn btn-primary"
          @click="leaveChallenge('keep')"
        >
          {{ $t('keepTasks') }}
        </button>
        <button
          class="btn btn-danger"
          @click="leaveChallenge('remove-all')"
        >
          {{ $t('removeTasks') }}
        </button>
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
import findIndex from 'lodash/findIndex';
import { mapState } from '@/libs/store';
import notifications from '@/mixins/notifications';

export default {
  mixins: [notifications],
  props: ['challengeId'],
  computed: {
    ...mapState({ user: 'user.data' }),
  },
  methods: {
    async leaveChallenge (keep) {
      const index = findIndex(this.user.challenges, id => id === this.challengeId);
      this.user.challenges.splice(index, 1);
      await this.$store.dispatch('challenges:leaveChallenge', {
        challengeId: this.challengeId,
        keep,
      });
      const userTasksByType = (await this.$store.dispatch('tasks:fetchUserTasks', { forceLoad: true })).data;
      let tagInUse = false;
      Object.keys(userTasksByType).forEach(taskType => {
        userTasksByType[taskType].forEach(task => {
          if (task.tags.indexOf(this.challengeId) > -1) {
            tagInUse = true;
          }
        });
      });
      if (!tagInUse) {
        await this.$store.dispatch(
          'tags:deleteTag',
          { tagId: this.challengeId },
        );
      }
      this.close();
    },
    close () {
      this.$emit('update-challenge');
      this.$root.$emit('bv::hide::modal', 'leave-challenge-modal');
    },
  },
};
</script>
