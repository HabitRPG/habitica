<template lang="pug">
  b-modal#testing(:title="$t('guildReminderTitle')", size='lg', :hide-footer="true")
    .modal-content(style='min-width:28em')
    .modal-body.text-center
      h3(style='margin-bottom:0') {{ $t('modalContribAchievement') }}
      // @TODO: +achievementAvatar('boot',0)
      | {{ $t('contribModal', {name: user.profile.name, level: user.contributor.level}) }}
      a(:href="$t('conRewardsURL')", target='_blank') {{ $t('contribLink') }}
      br
      button.btn.btn-primary(style='margin-top:1em' @click='close()') {{ $t('huzzah') }}
    // @TODO: +achievementFooter
</template>

<style scope>
  .dont-despair, .death-penalty {
    margin-top: 1.5em;
  }
</style>

<script>
import bModal from 'bootstrap-vue/lib/components/modal';

import { mapState } from 'client/libs/store';

export default {
  components: {
    bModal,
  },
  computed: {
    ...mapState({user: 'user.data'}),
  },
  methods: {
    close () {
      this.$root.$emit('hide::modal', 'testing');
    },
  },
};
</script>
