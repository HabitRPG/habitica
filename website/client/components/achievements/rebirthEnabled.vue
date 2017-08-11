<template lang="pug">
  b-modal#rebirth-enabled(:title="$t('rebirthNew')", size='lg', :hide-footer="true")
    .modal-header
      h4 {{ $t('rebirthNew') }}
    .modal-body
      figure
        .rebirth_orb
      p
        span {{ $t('rebirthUnlock') }}
    .modal-footer
      button.btn.btn-default(@click='close()') {{ $t('close') }}
</template>

<style scope>
  .dont-despair, .death-penalty {
    margin-top: 1.5em;
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
