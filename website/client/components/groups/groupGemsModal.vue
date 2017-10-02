<template lang="pug">
  b-modal#group-gems-modal(:title="$t('groupGems')", size='md', :hide-footer="true")
    .modal-body
      .row
        .col-6.offset-3
          h3 {{ $t('groupGemsDesc') }}
    .modal-footer
      .col-12.text-center
          button.btn.btn-primary(@click='close()') {{$t('close')}}
</template>

<style scoped>
  .modal-body {
    margin-top: 1em;
    margin-bottom: 1em;
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
      this.$root.$emit('hide::modal', 'group-gems-modal');
    },
  },
};
</script>
