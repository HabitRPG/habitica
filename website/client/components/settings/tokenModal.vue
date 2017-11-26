<template lang="pug">
  b-modal#token(:title="$t('resetAPIToken')", :hide-footer='true' size='md')
    p(v-html='$t("APITokenWarning", { hrefTechAssistanceEmail })')
    p {{ $t('resetAPITokenConfirmation') }}

    .usersettings(v-if='!user.auth.local.username')
      h5 {{ $t('typeReset') }}
        .form(v-if='!user.auth.local.username', name='verifyPassword', novalidate)
          .form-group
            input.form-control(type='text', :placeholder="$t('reset')", v-model='password', required)
    .usersettings(v-if='user.auth.local.username')
      h5 {{ $t('password') }}
        .form(v-if='user.auth.local.username', name='verifyPassword', novalidate)
          .form-group
            input.form-control(type='password', :placeholder="$t('password')", v-model='password', required)

    .modal-footer
      button.btn.btn-primary(@click='close()') {{ $t('neverMind') }}
      button.btn.btn-danger(:disabled="(password == '' && user.auth.local.username) || (password != $t('reset') && !user.auth.local.username)" @click='resetApiToken(password)') {{ $t('resetAPIToken') }}

</template>

<script>
import { mapState } from 'client/libs/store';
import hello from 'hellojs';

const TECH_ASSISTANCE_EMAIL = 'admin@habitica.com';

export default {
  data () {
    return {
      hrefTechAssistanceEmail: `<a href="mailto:${TECH_ASSISTANCE_EMAIL}">${TECH_ASSISTANCE_EMAIL}</a>`,
      password: '',
    };
  },
  computed: {
    ...mapState({user: 'user.data'}),
  },
  methods: {
    close () {
      this.$root.$emit('bv::hide::modal', 'token');
    },
    async resetApiToken (password) {
      if (!this.user.auth.local.username) {
        let auth;
        if (this.user.auth.facebook.id) {
          auth = await hello('facebook').login({scope: 'email', display: 'none'});
        } else if (this.user.auth.google.id) {
          auth = await hello('google').login({scope: 'email', display: 'none'});
        }
        password = auth.access_token;
      }

      let response = await this.$store.dispatch('user:regenerateAPIToken', {password});
      if (response.success) {
        alert(this.$t('resetComplete'));
        this.$store.dispatch('auth:logout');
      }
    },
  },
};
</script>
