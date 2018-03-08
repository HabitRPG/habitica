<template lang="pug">
  b-modal#delete(:title="$t('deleteAccount')", :hide-footer='true' size='md')
    .regular-delete(v-if='user.auth.local.email')
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
        button.btn.btn-primary(@click='close()') {{ $t('neverMind') }}
        button.btn.btn-danger(@click='deleteAccount()', :disabled='!password') {{ $t('deleteDo') }}
        .modal-header
    .social-delete(v-if='!user.auth.local.email')
      h4 {{ $t('deleteAccount') }}
      .modal-body
        p {{ $t('deleteSocialAccountText', {magicWord: 'DELETE'}) }}
        br
        .row
          .col-md-6
            input.form-control(type='text', v-model='password')
      .modal-footer
        button.btn.btn-secondary(@click='close()') {{ $t('neverMind') }}
        button.btn.btn-danger(:disabled='!password', @click='deleteAccount()') {{ $t('deleteDo') }}
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
      this.$root.$emit('bv::hide::modal', 'reset');
    },
    async deleteAccount () {
      await axios.delete('/api/v3/user', {
        data: {
          password: this.password,
          feedback: this.feedback,
        },
      });
      localStorage.clear();
      window.location.href = '/static/home';
      this.$root.$emit('bv::hide::modal', 'reset');
    },
  },
};
</script>
