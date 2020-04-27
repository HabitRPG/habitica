<template>
  <div class="form">
    <div class="form-group row text-center">
      <div class="col-12">
        <facebook-auth />
      </div>
    </div>
    <div class="form-group row text-center">
      <div class="col-12">
        <google-auth />
      </div>
    </div>
    <div class="form-group row text-center">
      <div class="col-12">
        <apple-auth />
      </div>
    </div>
    <register-form />
  </div>
</template>

<style lang="scss" scoped>
  @import '~@/assets/scss/colors.scss';

  .form {
    margin: 0 auto;
    width: 100%;
    padding-top: 2em;
    padding-bottom: 4em;
    position: relative;
    z-index: 1;

    .form-group {
      text-align: left;
      font-weight: bold;
    }

    .social-button {
      width: 100%;
      height: 100%;
      white-space: inherit;
      text-align: center;

      .text {
        display: inline-block;
        min-height: 0px;
      }
    }

    .social-icon {
      margin-right: 1em;
      width: 18px;
      height: 18px;
      display: inline-block;
      vertical-align: top;
      margin-top: .1em;
    }

    .apple-icon {
      margin-top: -1px;
    }

    small.form-text {
      text-align: center;
    }

    .input-error {
      margin-top: 0.25em;
      font-weight: normal;
      font-size: 90%;
      width: 100%;
    }
  }
</style>

<script>
import appleAuth from './socialAuth/apple';
import facebookAuth from './socialAuth/facebook';
import googleAuth from './socialAuth/google';
import registerForm from './register';

export default {
  name: 'AuthForm',
  components: {
    appleAuth,
    facebookAuth,
    googleAuth,
    registerForm,
  },
};
</script>
