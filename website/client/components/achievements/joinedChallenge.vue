<template lang="pug">
  b-modal#joined-challenge(:title="$t('modalAchievement')", size='lg', :hide-footer="true")
    .modal-body.text-center
      // @TODO: +achievementAvatar('challenge',0)
      achievement-avatar.avatar
      p {{ $t('joinedChallengeText') }}
      br
      button.btn.btn-primary(@click='close()') {{ $t('huzzah') }}
    achievement-footer
</template>

<style scoped>
  .avatar {
    margin-left: 10.2em;
    margin-bottom: 1.5em;
    margin-top: 1.5em;
  }
</style>

<script>
import bModal from 'bootstrap-vue/lib/components/modal';
import achievementFooter from './achievementFooter';
import achievementAvatar from './achievementAvatar';

export default {
  components: {
    bModal,
    achievementFooter,
    achievementAvatar,
  },
  methods: {
    close () {
      this.$root.$emit('hide::modal', 'joined-challenge');
    },
  },
};
</script>
