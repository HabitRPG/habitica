<template lang="pug">
  b-modal#contributor(:title="$t('modalContribAchievement')", size='md', :hide-footer="true")
    .modal-body
      .col-12
        achievement-avatar.avatar
      .col-6.offset-3.text-center
        | {{ $t('contribModal', {name: user.profile.name, level: user.contributor.level}) }}
        a(:href="$t('conRewardsURL')", target='_blank') {{ $t('contribLink') }}
        br
        button.btn.btn-primary(style='margin-top:1em' @click='close()') {{ $t('huzzah') }}
        br
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
      this.$root.$emit('bv::hide::modal', 'contributor');
    },
  },
};
</script>
