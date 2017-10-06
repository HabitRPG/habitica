<template lang="pug">
  b-modal#armoire-empty(:title="$t('armoireText')", size='lg', :hide-footer="true")
    .modal-body
      .row
        .col-6.offset-3
          .shop_armoire
          p {{$t('armoireLastItem')}}
          p {{$t('armoireNotesEmpty')}}
    .modal-footer
      .col-12.text-center
          button.btn.btn-primary(@click='close()') {{$t('close')}}
</template>

<style scoped>
  .shop_armoire {
    margin: 1em auto;
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
      this.$root.$emit('hide::modal', 'armoire-empty');
    },
  },
};
</script>
