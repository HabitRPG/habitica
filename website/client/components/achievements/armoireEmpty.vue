<template lang="pug">
  b-modal#armoire-empty(:title="$t('armoireText')", size='lg', :hide-footer="true")
  .modal-header
    .shop_armoire.pull-right
  .modal-body
    p {{$t('armoireLastItem')}}
    br
    p {{$t('armoireNotesEmpty')}}
  .modal-footer
    button.btn.btn-default(@click='close()') {{$t('close')}}
</template>

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
