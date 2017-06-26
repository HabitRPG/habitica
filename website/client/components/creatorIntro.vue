<template lang="pug">
#creator-background
  #creator-modal
    .section.row
      .col-6.offset-3.text-center
        h3 Welcome to
        .svg-icon.logo(v-html='icons.logoPurple')
    .section.row
      .col-6.offset-3
        .user-creation-bg
    .section.row
      .col-9
        .justin-message
          p Hello there! You must be new here. My name is Justin, I’ll be your guide in Habitica.
          p To start, you’ll need to create an avatar.
    .section.row
      .col-6.offset-3.text-center
        .circle.active
        .circle
        .circle
      .col-3
        .next Next
        .next-arrow
</template>

<style lang="scss" scoped>
  @import '~client/assets/scss/colors.scss';

  #creator-background {
    background-color: $purple-200;
  }

  #creator-modal {
    width: 448px;
    height: 620px;
    border-radius: 8px;
    background-color: #ffffff;
    box-shadow: 0 2px 16px 0 rgba(26, 24, 29, 0.32);
    margin: 0 auto;
    padding-top: 3em;
  }

  .section {
    margin-top: 3em;
  }

  .logo {
    width: 190px;
  }

  .user-creation-bg {
    background-image: url('~client/assets/creator/creator-hills-bg.png');
    height: 105px;
    width: 219px;
  }

  .justin-message {
    background-image: url('~client/assets/svg/for-css/tutorial-border.svg');
    height: 144px;
    width: 400px;
    padding: 2em;
    margin-left: 1.5em;
  }

  .circle {
    width: 8px;
    height: 8px;
    background-color: #d8d8d8;
    border-radius: 50%;
    display: inline-block;
    margin-right: 1em;
  }

  .circle.active {
    background-color: #bda8ff;
  }

  .next {
    color: #6133b4;
    font-weight: bold;
    display: inline-block;
  }

  .next-arrow {
    background-image: url('~client/assets/creator/arrow.png');
    width: 32px;
    height: 32px;
    display: inline-block;
  }
</style>

<script>
import logoPurple from 'assets/svg/logo-purple.svg';

export default {
  data () {
    return {
      icons: Object.freeze({
        logoPurple,
      }),
    };
  },
};
</script>
