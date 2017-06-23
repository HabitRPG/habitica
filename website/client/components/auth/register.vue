<template lang="pug">
.form-wrapper
  #top-background
    .seamless_stars_varied_opacity_repeat

  #login-form
    .form-group.row.text-center
      .col-6
        .btn.btn-secondary.social-button Facebook
      .col-6
        .btn.btn-secondary.social-button Google
    .form-group
      label(for='usernameInput') Username
      input#usernameInput.form-control(type='text', placeholder='e.g., HabitRabbit')
    .form-group
      label(for='emailInput') Email address
      input#emailInput.form-control(type='email', placeholder='e.g., rabbit@habitica.com')
    .form-group
      label(for='passwordInput') Password
      input#passwordInput.form-control(type='password', placeholder='e.g., •••••••••••• ')
    .form-group
      label(for='confirmPasswordInput') Confirm Password
      input#confirmPasswordInput.form-control(type='password', placeholder='Make sure it’s the same password!')
      small.form-text By clicking the button below, you are indicating that you have read and agree to the Terms of Service and Privacy Policy.
    .text-center
      .btn.btn-info Join Habitica

  #bottom-background
    .seamless_mountains_demo_repeat
    .midground_foreground_extended2
</template>

<style lang="scss" scoped>
  @import '~client/assets/scss/colors.scss';

  .form-wrapper {
    background-color: $purple-100;
  }

  #login-form {
    margin: 0 auto;
    width: 40em;
    padding-top: 5em;
    padding-bottom: 8.5em;

    label {
      color: $white;
      font-weight: bold;
    }

    input {
      margin-bottom: 2em;
    }

    .form-text {
      font-size: 14px;
      color: $white;
    }

    .social-button {
      width: 100%;
    }
  }

  #top-background {
    .seamless_stars_varied_opacity_repeat {
      background-image: url('~assets/images/seamless_stars_varied_opacity.png');
      background-repeat: repeat-x;
      position: absolute;
      height: 500px;
      width: 1600px;
    }
  }

  #bottom-background {
    position: relative;

    .seamless_mountains_demo_repeat {
      background-image: url('~assets/images/seamless_mountains_demo.png');
      background-repeat: repeat-x;
      width: 1600px;
      height: 500px;
      position: absolute;
      z-index: 0;
      bottom: 0;
    }

    .midground_foreground_extended2 {
      position: relative;
    }
  }
</style>
