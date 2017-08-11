<template lang="pug">
  b-modal#streak(:title="$t('guildReminderTitle')", size='lg', :hide-footer="true")
    .modal-content(style='min-width:28em')
    .modal-body.text-center
      h3(style='margin-bottom: 0') {{ $t('streakAchievement') }}
      // @TODO: +achievementAvatar('thermometer',2.5)
      achievement-avatar
      h4(ng-if='user.achievements.streak === 1') {{ $t('firstStreakAchievement') }}
      h4(ng-if='user.achievements.streak > 1') {{ $t('streakAchievementCount', {streaks: user.achievements.streak}) }}
      p {{ $t('twentyOneDays') }}
      p {{ $t('dontBreakStreak') }}
      br
      button.btn.btn-primary(@click='close()') {{ $t('dontStop') }}
      .checkbox
        label(style='display:inline-block') {{ $t('dontShowAgain') }}
          input(type='checkbox', ng-model='user.preferences.suppressModals.streak', ng-change='set({"preferences.suppressModals.streak": user.preferences.suppressModals.streak?true: false})')
    achievement-footer
</template>

<style scope>
  .dont-despair, .death-penalty {
    margin-top: 1.5em;
  }
</style>

<script>
import bModal from 'bootstrap-vue/lib/components/modal';
import achievementFooter from './achievementFooter';
import achievementAvatar from './achievementAvatar';

import { mapState } from 'client/libs/store';

export default {
  components: {
    bModal,
    achievementFooter,
    achievementAvatar,
  },
  computed: {
    ...mapState({user: 'user.data'}),
  },
  methods: {
    close () {
      this.$root.$emit('hide::modal', 'streak');
    },
  },
};
</script>
