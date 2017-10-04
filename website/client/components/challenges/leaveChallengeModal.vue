<template lang="pug">
  b-modal#leave-challenge-modal(title="Leave Challenge", size='sm', :hide-footer="true")
    .modal-body
      h2 {{ $t('leaveCha') }}
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
import { mapActions } from 'client/libs/store';
import bModal from 'bootstrap-vue/lib/components/modal';
import notifications from 'client/mixins/notifications';

export default {
  mixins: [notifications],
  components: {
    bModal,
  },
  methods: {
    async leaveChallenge (keep) {
      let index = findIndex(this.user.challenges, (challengeId) => {
        return challengeId === this.searchId;
      });
      this.user.challenges.splice(index, 1);
      await this.$store.dispatch('challenges:leaveChallenge', {
        challengeId: this.searchId,
        keep,
      });
      await this.$store.dispatch('tasks:fetchUserTasks', {forceLoad: true});
      this.close();
    },
    close () {
      this.$root.$emit('hide::modal', 'leave-challenge-modal');
    }
  }
}
</script>
