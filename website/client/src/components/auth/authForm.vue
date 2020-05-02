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
