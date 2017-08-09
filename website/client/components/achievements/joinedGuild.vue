<template lang="pug">
  b-modal#joined-guild(:title="$t('modalAchievement')", size='lg', :hide-footer="true")
    .modal-body.text-center
      h3(style='margin-bottom:0') {{ $t('modalAchievement') }}
      // @TODO: +achievementAvatar('guild',0)
      p {{ $t('joinedGuildText') }}
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

export default {
  components: {
    bModal,
    achievementFooter,
  },
  methods: {
    close () {
      this.$root.$emit('hide::modal', 'joined-guild');
    },
  },
};
</script>
