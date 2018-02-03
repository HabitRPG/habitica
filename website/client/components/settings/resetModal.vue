<template lang="pug">
  b-modal#reset(:title="$t('resetAccount')", :hide-footer='true' size='md')
    p {{ $t('resetText1') }}
    p {{ $t('resetText2') }}
    .modal-footer
      button.btn.btn-primary(@click='close()') {{ $t('neverMind') }}
      button.btn.btn-danger(@click='reset()') {{ $t('resetDo') }}
</template>

<script>
import axios from 'axios';
import { mapState } from 'client/libs/store';

export default {
  computed: {
    ...mapState({user: 'user.data'}),
  },
  methods: {
    close () {
      this.$root.$emit('bv::hide::modal', 'reset');
    },
    async reset () {
      let response = await axios.post('/api/v3/user/reset');
      // @TODO: Not sure if this is correct
      this.$store.user = response.data.data.user;
      this.$router.push('/');
      this.$root.$emit('bv::hide::modal', 'reset');
    },
  },
};
</script>
