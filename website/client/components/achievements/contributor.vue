<template lang="pug">
  b-modal#contributor(:title="$t('modalContribAchievement')", size='lg', :hide-footer="true")
    .modal-body
      .col-6.offset-3.text-center
        achievement-avatar.avatar
        | {{ $t('contribModal', {name: user.profile.name, level: user.contributor.level}) }}
        a(:href="$t('conRewardsURL')", target='_blank') {{ $t('contribLink') }}
        br
        button.btn.btn-primary(style='margin-top:1em' @click='close()') {{ $t('huzzah') }}
        br
    achievement-footer
</template>

<style scoped>
  .avatar {
    margin-left: 4em;
    margin-bottom: 1.5em;
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
      this.$root.$emit('hide::modal', 'contributor');
    },
  },
};
</script>
