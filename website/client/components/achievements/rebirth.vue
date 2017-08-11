<template lang="pug">
  b-modal#rebirth(:title="$t('guildReminderTitle')", size='lg', :hide-footer="true")
    .modal-content(style='min-width:28em')
    .modal-body.text-center
      h3(style='margin-bottom:0') {{ $t('modalAchievement') }}
      // @TODO: +achievementAvatar('sun',0)
      achievement-avatar
      div(ng-if='user.achievements.rebirthLevel < 100')
        | {{ $t('rebirthAchievement', {number: user.achievements.rebirths, level: user.achievements.rebirthLevel}) }}
      div(ng-if='user.achievements.rebirthLevel >= 100')
        | {{ $t('rebirthAchievement100', {number: user.achievements.rebirths}) }}
      br
      button.btn.btn-primary(@click='close()') {{ $t('huzzah') }}
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
      this.$root.$emit('hide::modal', 'rebirth');
    },
  },
};
</script>
