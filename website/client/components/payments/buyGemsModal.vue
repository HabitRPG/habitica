<template lang="pug">
  mixin featureBullet (text)
    .row
      .col-md-2.offset-1
        .bubble.mx-auto
          .svg-icon.check(v-html='icons.check')
      .col-md-8.align-self-center
        p=text

  b-modal(
    :hide-footer='true',
    :hide-header='true',
    :id='"buy-gems"',
    size='lg',
  )
    .container-fluid.purple-gradient
      .gemfall
        .row
          h2.text-invert.mx-auto SUPPORT
        .row
          .logo.svg-icon.mx-auto(v-html="icons.logo")
    .container-fluid
      .row
        .col-6.offset-3.nav
          .nav-item(@click='selectedPage = "subscribe"', :class="{active: selectedPage === 'subscribe'}") Subscribe
          .nav-item(@click='selectedPage = "gems"', :class="{active: selectedPage === 'gems'}") Buy Gems
      div(v-show='selectedPage === "gems"')
        .row.text-center
          h2.mx-auto.text-leadin Gems allow you to buy fun extras for your account, including:
        .row
          .col
            +featureBullet('Unique and fashionable costumes for your avatar.')
            +featureBullet('Backgrounds to immerse your avatar in the world of Habitica!')
          .col
            +featureBullet('Exciting Quest chains that drop pet eggs.')
            +featureBullet('Reset your avatar\'s attribute points and change its Class.')
        .card-deck
          .card.text-center
            .card-img-top
              .mx-auto(v-html='icons.fourGems', style='"height: 53px; width: 49.5px; margin-top: 2em;"')
            .card-body
              .gem-count 4
              .gem-text Gems
            .card-footer
              button.btn.btn-primary $.99
          .card.text-center
            .card-img-top
              .mx-auto(v-html='icons.twentyOneGems', style='"height: 55px; width: 47.5px; margin-top: 1.85em;"')
            .card-body
              .gem-count 21
              .gem-text Gems
            .card-footer
              button.btn.btn-primary $4.99
          .card.text-center
            .card-img-top
              .mx-auto(v-html='icons.fortyTwoGems', style='"height: 49.5px; width: 51px; margin-top: 1.9em;"')
            .card-body
              .gem-count 42
              .gem-text Gems
            .card-footer
              button.btn.btn-primary $9.99
          .card.text-center
            .card-img-top
              .mx-auto(v-html='icons.eightyFourGems', style='"height: 65px; width: 67px; margin-top: 1em;"')
            .card-body
              .gem-count 84
              .gem-text Gems
            .card-footer
              button.btn.btn-primary $19.99
        .row.text-center
          h2.mx-auto.text-payment Choose your payment method
        .card-deck
          .card.text-center.payment-method
            .card-body
              .mx-auto(v-html='icons.creditCard', style='"height: 56px; width: 159px; margin-top: 1em;"')
          .card.text-center.payment-method
            .card-body.paypal
              img(src='~assets/images/paypal.png')
          .card.text-center.payment-method
            .card-body.amazon
              img(src='~assets/images/amazon-payments.png')
        .row.text-center
          .svg-icon.mx-auto(v-html='icons.heart', style='"height: 24px; width: 24px;"')
        .row.text-center.text-outtro
          .col-6.offset-3 Purchasing Gems supports the developers and helps keep Habitica running

</template>

<style lang="scss">
  #buy-gems__BV_body_ {
    padding: 0;
  }
</style>

<style lang="scss" scoped>

  p {
    font-size: 16px;
  }

  .amazon {
    padding-top: 1.8em;
  }

  .bubble {
    width: 32px;
    height: 32px;
    border-radius: 1000px;
    border: solid 2px #e1e0e3;
  }

  .card {
    margin: 1em;
    border-radius: 2px;
    box-shadow: 0 2px 2px 0 rgba(26, 24, 29, 0.16), 0 1px 4px 0 rgba(26, 24, 29, 0.12);
  }

  .gem-count {
		font-family: Roboto;
		font-size: 40px;
		font-weight: bold;
		color: #2995cd;
  }

  .gem-text {
		font-family: Roboto;
		font-size: 16px;
		color: #a5a1ac;
    margin-bottom: 1em;
  }

  .gemfall {
    background: url(~assets/images/gemfall.png) center repeat-y;
    height: 14em;
  }

  .logo {
    width: 256px;
    height: 56px;
  }

  .nav {
    font-weight: bold;
    height: 40px;
  }

  .nav-item {
    display: inline-block;
    font-size: 16px;
    margin: 0 auto;
    padding: 1.5em;
  }

  .nav-item:hover, .nav-item.active {
    color: #4f2a93;
    border-bottom: 2px solid #4f2a93;
    cursor: pointer;
  }

  .payment-method {
    background-color: #e1e0e3;
  }

  .paypal {
    padding-top: 1.3em;
  }

  .purple-gradient {
    background-image: linear-gradient(74deg, #4f2a93, #6133b4);
    height: 14em;
  }

  .svg-icon.check {
    color: #bda8ff;
  }

  .text-invert {
    margin: 1.6em;
    color: #FFFFFF;
    font-family: Roboto;
    font-weight: normal;
    letter-spacing: 0.18em;
  }

  .text-leadin {
    margin: 1.6em;
    font-weight: normal;
    color: #4f2a93;
  }

  .text-outtro {
    margin-bottom: 1em;
    color: #a5a1ac;
  }

  .text-payment {
    color: #4e4a57;
    font-size: 24px;
    margin: 1em;
    opacity: 0.64;
  }
</style>

<script>
  import bModal from 'bootstrap-vue/lib/components/modal';
  import { mapState } from 'client/libs/store';

  import checkIcon from 'assets/svg/check.svg';
  import creditCard from 'assets/svg/credit-card.svg';
  import heart from 'assets/svg/health.svg';
  import logo from 'assets/svg/habitica-logo.svg';

  import fourGems from 'assets/svg/4-gems.svg';
  import twentyOneGems from 'assets/svg/21-gems.svg';
  import fortyTwoGems from 'assets/svg/42-gems.svg';
  import eightyFourGems from 'assets/svg/84-gems.svg';

  export default {
    components: {
      bModal,
    },
    data () {
      return {
        icons: Object.freeze({
          logo,
          check: checkIcon,
          creditCard,
          fourGems,
          heart,
          twentyOneGems,
          fortyTwoGems,
          eightyFourGems,
        }),
        selectedPage: 'gems',
      };
    },
    computed: {
      ...mapState({user: 'user.data'}),
    },
    methods: {
      close () {
        this.$root.$emit('hide::modal', 'buy-gems');
      },
    },
  };
</script>
