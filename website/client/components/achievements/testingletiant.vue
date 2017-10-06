<template lang="pug">
  b-modal#testingletiant(:title="$t('guildReminderTitle')", size='lg', :hide-footer="true")
    .modal-content
    .modal-body.text-center
      br
      .scene_guilds
      br
      h4 {{ $t('guildReminderText2') }}
    .modal-footer
      .container-fluid
        .row
          .col-6.text-center
            button.btn.btn-secondary(@click='close()') {{ $t('guildReminderDismiss') }}
          .col-6.text-center
            .btn.btn-primary(@click='takeMethere()') {{ $t('guildReminderCTA') }}
</template>

<style scoped>
  .scene_guilds {
    margin: 0 auto;
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
      this.$root.$emit('hide::modal', 'testingletiant');
    },
    takeMethere () {
      this.$router.push('/groups/discovery');
      this.close();
    },
  },
};
</script>
