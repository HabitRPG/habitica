<template lang="pug">
  b-modal#rebirth-enabled(:title="$t('rebirthNew')", size='md', :hide-footer="true")
    .modal-body
      .col-12
        .rebirth_orb
        p
          span {{ $t('rebirthUnlock') }}
    .modal-footer
      .col-12.text-center
        button.btn.btn-primary(@click='close()') {{ $t('close') }}
</template>

<style scoped>
  .rebirth_orb {
    margin: 0 auto;
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
      this.$root.$emit('hide::modal', 'rebirth-enabled');
    },
  },
};
</script>
