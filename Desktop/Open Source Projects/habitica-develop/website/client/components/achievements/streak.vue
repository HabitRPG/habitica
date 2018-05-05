<template lang="pug">
  b-modal#streak(:title="$t('streakAchievement')", size='md', :hide-footer="true")
    .modal-body
      .col-12
        // @TODO: +achievementAvatar('thermometer',2.5)
        achievement-avatar.avatar
      .col-6.offset-3.text-center
        h3(v-if='user.achievements.streak === 1') {{ $t('firstStreakAchievement') }}
        h3(v-if='user.achievements.streak > 1') {{ $t('streakAchievementCount', {streaks: user.achievements.streak}) }}
        p {{ $t('twentyOneDays') }}
        p {{ $t('dontBreakStreak') }}
        br
        button.btn.btn-primary(@click='close()') {{ $t('dontStop') }}
        .checkbox
          input(type='checkbox', v-model='user.preferences.suppressModals.streak', @change='suppressModals')
          label {{ $t('dontShowAgain') }}
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

import { mapState } from 'client/libs/store';

export default {
  components: {
    achievementFooter,
    achievementAvatar,
  },
  computed: {
    ...mapState({user: 'user.data'}),
  },
  methods: {
    close () {
      this.$root.$emit('bv::hide::modal', 'streak');
    },
    suppressModals () {
      let surpress = this.user.preferences.suppressModals.streak ? true : false;
      this.$store.dispatch('user:set', {'preferences.suppressModals.streak': surpress});
    },
  },
};
</script>
