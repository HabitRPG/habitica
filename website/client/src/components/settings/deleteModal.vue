<template lang="pug">
  b-modal#delete(:title="$t('deleteAccount')", :hide-footer='true' size='md')
    .modal-body
      br
      strong(v-if='user.auth.local.email') {{ $t('deleteLocalAccountText') }}
      strong(v-if='!user.auth.local.email') {{ $t('deleteSocialAccountText', {magicWord: 'DELETE'}) }}
      .row.mt-3
        .col-6
          input.form-control(type='password', v-model='password')
      .row.mt-3
        #feedback.col-12.form-group
          label(for='feedbackTextArea') {{ $t('feedback') }}
          textarea#feedbackTextArea.form-control(v-model='feedback')
    .modal-footer
      button.btn.btn-primary(@click='close()') {{ $t('neverMind') }}
      button.btn.btn-danger(@click='deleteAccount()', :disabled='!password') {{ $t('deleteDo') }}
</template>

<script>
import axios from 'axios';
import { mapState } from 'client/libs/store';

export default {
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
      this.$root.$emit('bv::hide::modal', 'delete');
    },
    async deleteAccount () {
      await axios.delete('/api/v4/user', {
        data: {
          password: this.password,
          feedback: this.feedback,
        },
      });
      localStorage.clear();
      window.location.href = '/static/home';
      this.$root.$emit('bv::hide::modal', 'delete');
    },
  },
};
</script>
