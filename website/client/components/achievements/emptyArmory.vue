<template lang="pug">
  b-modal#empty-armory(:title="$t('modalAchievement')", size='md', :hide-footer="true", @hidden="reloadPage()")
    .modal-body
      .col-12
        achievement-avatar.avatar
      .col-6.offset-3.text-center
        div(v-if='user.achievements.emptyArmoryLevel < 100')
          | {{ $t('emptyArmoryAchievement', {number: user.achievements.emptyArmorys, level: user.achievements.emptyArmoryLevel}) }}
        div(v-if='user.achievements.emptyArmoryLevel >= 100')
          | {{ $t('emptyArmoryAchievement100', {number: user.achievements.emptyArmorys}) }}
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
      this.$root.$emit('bv::hide::modal', 'empty-armory');
    },
    reloadPage () {
      window.location.reload(true);
    },
  },
};
</script>
