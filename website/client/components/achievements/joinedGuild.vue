<template lang="pug">
  b-modal#joined-guild(:title="$t('modalAchievement')", size='md', :hide-footer="true")
    .modal-body
      .col-12
        // @TODO: +achievementAvatar('guild',0)
        achievement-avatar.avatar
      .col-6.offset-3.text-center
        p {{ $t('joinedGuildText') }}
        br
        button.btn.btn-primary(@click='close()') {{ $t('huzzah') }}
    achievement-footer
</template>

<style scoped>
  .avatar {
    width: 140px;
    margin: 0 auto;
    margin-bottom: 1.5em;
    margin-top: 1.5em;
  }
</style>

<script>
import achievementFooter from './achievementFooter';
import achievementAvatar from './achievementAvatar';

export default {
  components: {
    achievementFooter,
    achievementAvatar,
  },
  methods: {
    close () {
      this.$root.$emit('bv::hide::modal', 'joined-guild');
    },
  },
};
</script>
