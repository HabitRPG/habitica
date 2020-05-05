<template>
  <div class="form">
    <div class="form-group row text-center">
      <div class="col-12">
        <social-auth-form network="facebook" class="btn btn-secondary" />
      </div>
    </div>
    <div class="form-group row text-center">
      <div class="col-12">
        <social-auth-form network="google" class="btn btn-secondary" />
      </div>
    </div>
    <div class="form-group row text-center">
      <div class="col-12">
        <social-auth-form network="apple" class="btn btn-secondary" />
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
import registerForm from './register';
import socialAuthForm from './socialAuth';

export default {
  name: 'AuthForm',
  components: {
    registerForm,
    socialAuthForm,
  },
};
</script>
