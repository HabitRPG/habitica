<template lang="pug">
  b-modal#reset(:title="$t('resetAccount')", :hide-footer='true' size='md')
    p {{ $t('resetText1') }}
    p {{ $t('resetText2') }}
    .modal-footer
      button.btn.btn-danger(@click='close()') {{ $t('neverMind') }}
      button.btn.btn-primary(@click='reset()') {{ $t('resetDo') }}
</template>

<script>
import axios from 'axios';
import { mapState } from 'client/libs/store';

import bModal from 'bootstrap-vue/lib/components/modal';

export default {
  components: {
    bModal,
  },
  computed: {
    ...mapState({user: 'user.data'}),
  },
  methods: {
    close () {
      this.$root.$emit('hide::modal', 'reset');
    },
    async reset () {
      let response = await axios.post('/api/v3/user/reset');
      // @TODO: Not sure if this is correct
      this.$store.user = response.data.data.user;
      this.$router.push('/');
      this.$root.$emit('hide::modal', 'reset');
    },
  },
};
</script>
