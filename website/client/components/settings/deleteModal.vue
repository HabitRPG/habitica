<template lang="pug">
  b-modal#delete(:title="$t('deleteAccount')", :hide-footer='true' size='md')
    strong {{ $t('deleteLocalAccountText') }}
      br
      .row
        .col-6
          input.form-control(type='password', v-model='password')
      br
      .row
        #feedback.col-12.form-group
          label(for='feedbackTextArea') {{ $t('feedback') }}
          textarea#feedbackTextArea.form-control(v-model='feedback')
    .modal-footer
      button.btn.btn-danger(@click='close()') {{ $t('neverMind') }}
      button.btn.btn-primary(@click='deleteAccount()', :disabled='!password') {{ $t('deleteDo') }}
</template>

<script>
import axios from 'axios';
import { mapState } from 'client/libs/store';

import bModal from 'bootstrap-vue/lib/components/modal';

export default {
  components: {
    bModal,
  },
  data () {
    return {
      password: '',
      feedback: '',
    };
  },
  computed: {
    ...mapState({user: 'user.data'}),
  },
  methods: {
    close () {
      this.$root.$emit('hide::modal', 'reset');
    },
    async deleteAccount () {
      await axios.delete('/api/v3/user/', {
        password: this.password,
        feedback: this.feedback,
      });
      localStorage.clear();
      this.$router.push('/');
      this.$root.$emit('hide::modal', 'reset');
    },
  },
};
</script>
