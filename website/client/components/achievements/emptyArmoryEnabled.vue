<template lang="pug">
  b-modal#empty-armory-enabled(:title="$t('emptyArmoryNew')", size='md', :hide-footer="true")
    .modal-body
      .col-12
        .armory_key
        p
          span {{ $t('emptyArmoryUnlock') }}
    .modal-footer
      .col-12.text-center
        button.btn.btn-primary(@click='close()') {{ $t('close') }}
</template>

<style scoped>
  .armory_key {
    margin: 0 auto;
  }
</style>

<script>
import { mapState } from 'client/libs/store';

export default {
  computed: {
    ...mapState({user: 'user.data'}),
  },
  methods: {
    close () {
      this.$root.$emit('bv::hide::modal', 'empty-armory-enabled');
    },
  },
};
</script>

