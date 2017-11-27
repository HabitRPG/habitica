<template lang="pug">
  b-modal#rebirth(:title="$t('modalAchievement')", size='md', :hide-footer="true")
    .modal-body
      .col-12
        // @TODO: +achievementAvatar('sun',0)
        achievement-avatar.avatar
      .col-6.offset-3.text-center
        div(v-if='user.achievements.rebirthLevel < 100')
          | {{ $t('rebirthAchievement', {number: user.achievements.rebirths, level: user.achievements.rebirthLevel}) }}
        div(v-if='user.achievements.rebirthLevel >= 100')
          | {{ $t('rebirthAchievement100', {number: user.achievements.rebirths}) }}
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
      this.$root.$emit('bv::hide::modal', 'rebirth');
    },
  },
};
</script>
