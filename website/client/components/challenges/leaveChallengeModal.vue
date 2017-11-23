<template lang="pug">
  b-modal#leave-challenge-modal(:title="$t('leaveChallenge')", size='sm', :hide-footer="true")
    .modal-body
      h2 {{ $t('confirmKeepChallengeTasks') }}
      div
        button.btn.btn-primary(@click='leaveChallenge("keep")') {{ $t('keepIt') }}
        button.btn.btn-danger(@click='leaveChallenge("remove-all")') {{ $t('removeIt') }}
</template>

<style scoped>
  .modal-body {
    padding-bottom: 2em;
  }
</style>

<script>
import findIndex from 'lodash/findIndex';
import { mapState } from 'client/libs/store';
import notifications from 'client/mixins/notifications';

export default {
  props: ['challengeId'],
  mixins: [notifications],
  computed: {
    ...mapState({user: 'user.data'}),
  },
  methods: {
    async leaveChallenge (keep) {
      let index = findIndex(this.user.challenges, (id) => {
        return id === this.challengeId;
      });
      this.user.challenges.splice(index, 1);
      await this.$store.dispatch('challenges:leaveChallenge', {
        challengeId: this.challengeId,
        keep,
      });
      await this.$store.dispatch('tasks:fetchUserTasks', {forceLoad: true});
      this.close();
    },
    close () {
      this.$root.$emit('bv::hide::modal', 'leave-challenge-modal');
    },
  },
};
</script>
