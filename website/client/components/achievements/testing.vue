<template lang="pug">
  b-modal#testing(:title="$t('guildReminderTitle')", size='lg', :hide-footer="true")
    .modal-body.text-center
      br
      .scene_guilds
      br
      h4 {{ $t('guildReminderText1') }}
    .modal-footer
      .container-fluid
        .row
          .col-6.text-center
            button.btn.btn-secondary(@click='close()') {{ $t('guildReminderDismiss') }}
          .col-6.text-center(@click='close()')
            .btn.btn-primary(@click='takeMethere()') {{ $t('guildReminderCTA') }}
</template>

<style scoped>
  .scene_guilds {
    margin: 0 auto;
  }
</style>

<script>
export default {
  methods: {
    close () {
      this.$root.$emit('bv::hide::modal', 'testing');
    },
    takeMethere () {
      this.$router.push('/groups/discovery');
      this.close();
    },
  },
};
</script>
