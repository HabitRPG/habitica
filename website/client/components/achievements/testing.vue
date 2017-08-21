<template lang="pug">
  b-modal#testing(:title="$t('guildReminderTitle')", size='lg', :hide-footer="true")
    .modal-content
    .modal-body.text-center
      h3 {{ $t('guildReminderTitle') }}
      br
      .scene_guilds.center-block
      br
      h4 {{ $t('guildReminderText1') }}
    .modal-footer
      .container-fluid
        .row
          .col-6.text-center
            button.btn.btn-secondary(@click='close()') {{ $t('guildReminderDismiss') }}
          .col-6.text-center(@click='close()')
            router-link.btn.btn-primary(:to="{ name: 'guildsDiscovery'}") {{ $t('guildReminderCTA') }}
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
