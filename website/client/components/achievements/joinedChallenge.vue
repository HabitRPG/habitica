<template lang="pug">
  b-modal#testing(:title="$t('guildReminderTitle')", size='lg', :hide-footer="true")
    .modal-content(style='min-width:28em')
    .modal-body.text-center
      h3(style='margin-bottom:0') {{ $t('modalAchievement') }}
      // @TODO: +achievementAvatar('challenge',0)
      p {{ $t('joinedChallengeText') }}
      br
      button.btn.btn-primary(@click='close()') {{ $t('huzzah') }}
    // @TODO: +achievementFooter
</template>

<style scope>
  .dont-despair, .death-penalty {
    margin-top: 1.5em;
  }
</style>

<script>
import bModal from 'bootstrap-vue/lib/components/modal';

export default {
  components: {
    bModal,
  },
  methods: {
    close () {
      this.$root.$emit('hide::modal', 'testing');
    },
  },
};
</script>
