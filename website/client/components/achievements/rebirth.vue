<template lang="pug">
  b-modal#rebirth(:title="$t('modalAchievement')", size='md', :hide-footer="true")
    .modal-body.text-center
      // @TODO: +achievementAvatar('sun',0)
      achievement-avatar
      div(v-if='user.achievements.rebirthLevel < 100')
        | {{ $t('rebirthAchievement', {number: user.achievements.rebirths, level: user.achievements.rebirthLevel}) }}
      div(v-if='user.achievements.rebirthLevel >= 100')
        | {{ $t('rebirthAchievement100', {number: user.achievements.rebirths}) }}
      br
      button.btn.btn-primary(@click='close()') {{ $t('huzzah') }}
    achievement-footer
</template>

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
