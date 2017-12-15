<template lang="pug">
  mixin featureBullet (text)
    .row
      .col-md-2.offset-1
        .bubble.mx-auto
          .svg-icon.check(v-html='icons.check')
      .col-md-8.align-self-center
        p=text
  div(v-if='user')
    b-modal(:hide-footer='true', :hide-header='true', :id='"buy-gems"', size='lg')
      .container-fluid.purple-gradient
        .gemfall
          .row
            h2.text-invert.mx-auto {{ $t('support') }}
          .row
            .logo.svg-icon.mx-auto(v-html="icons.logo")
      .container-fluid
        .row
          .col-6.offset-3.nav
            .nav-item(@click='selectedPage = "subscribe"', :class="{active: selectedPage === 'subscribe'}") {{ $t('subscribe') }}
            .nav-item(@click='selectedPage = "gems"', :class="{active: selectedPage === 'gems'}") {{ $t('buyGems') }}
        div(v-show='selectedPage === "gems"')
          div(v-if='hasSubscription')
            .row.text-center
              h2.mx-auto.text-leadin {{ $t('subscriptionAlreadySubscribedLeadIn') }}
            .row.text-center
              .col-6.offset-3
                p {{ $t("gemsPurchaseNote") }}
          .row.text-center
            h2.mx-auto.text-leadin {{ $t('gemBenefitLeadin') }}
          .row
            .col
              +featureBullet("{{ $t('gemBenefit1') }}")
              +featureBullet("{{ $t('gemBenefit2') }}")
            .col
              +featureBullet("{{ $t('gemBenefit3') }}")
              +featureBullet("{{ $t('gemBenefit4') }}")
          .card-deck.gem-deck
            //.card.text-center(:class="{active: gemAmount === 4}")
              .card-img-top
                .mx-auto(v-html='icons.fourGems', style='"height: 53px; width: 49.5px; margin-top: 2em;"')
              .card-body
                .gem-count 4
                .gem-text {{ $t('gems') }}
                .divider
                button.btn.btn-primary(@click='gemAmount = 4') {{gemAmount === 4 ? $t('selected') : '$1.00'}}
            .card.text-center.col-3(:class="{active: gemAmount === 20 }")
              .card-img-top
                .mx-auto(v-html='icons.twentyOneGems', style='"height: 55px; width: 47.5px; margin-top: 1.85em;"')
              .card-body
                .gem-count 20
                .gem-text {{ $t('gems') }}
                .divider
                button.btn.btn-primary(@click='gemAmount === 20 ? gemAmount = 0 : gemAmount = 20') {{gemAmount === 20 ? $t('selected') : '$5.00'}}
            //.card.text-center(:class="{active: gemAmount === 42}")
              .card-img-top
                .mx-auto(v-html='icons.fortyTwoGems', style='"height: 49.5px; width: 51px; margin-top: 1.9em;"')
              .card-body
                .gem-count 42
                .gem-text {{ $t('gems') }}
                .divider
                button.btn.btn-primary(@click='gemAmount = 42') {{gemAmount === 42 ? $t('selected') : '$10.00'}}
            //.card.text-center(:class="{active: gemAmount === 84}")
              .card-img-top
                .mx-auto(v-html='icons.eightyFourGems', style='"height: 65px; width: 67px; margin-top: 1em;"')
              .card-body
                .gem-count 84
                .gem-text {{ $t('gems') }}
                .divider
                button.btn.btn-primary(@click='gemAmount = 84') {{gemAmount === 84 ? $t('selected') : '$20.00'}}
          .row.text-center
            h2.mx-auto.text-payment {{ $t('choosePaymentMethod') }}
          .card-deck
            .card.text-center.payment-method(@click='showStripe({})')
              .card-body
                .mx-auto(v-html='icons.creditCard', style='"height: 56px; width: 159px; margin-top: 1em;"')
            .card.text-center.payment-method
              a.card-body.paypal(:href='paypalCheckoutLink', target='_blank')
                img(src='~assets/images/paypal.png')
            .card.text-center.payment-method(@click="amazonPaymentsInit({type: 'single'})")
              .card-body.amazon
                img(src='~assets/images/amazon-payments.png')
          .row.text-center
            .svg-icon.mx-auto(v-html='icons.heart', style='"height: 24px; width: 24px;"')
          .row.text-center.text-outtro
            .col-6.offset-3 {{ $t('buyGemsSupportsDevs') }}

        div(v-show='selectedPage === "subscribe"')
          div(v-if='hasSubscription')
            .row.text-center
              h2.mx-auto.text-leadin {{ $t('subscriptionAlreadySubscribedLeadIn') }}
            .row.text-center
              .col
                p(v-html='$t("subscriptionAlreadySubscribed1")')
          div(v-if='!hasSubscription')
            .row.text-center
              h2.mx-auto.text-leadin {{ $t('subscriptionBenefitLeadin') }}
            .row
              .col
                +featureBullet("{{ $t('subscriptionBenefit1') }}")
                +featureBullet("{{ $t('subscriptionBenefit2') }}")
                +featureBullet("{{ $t('subscriptionBenefit3') }}")
              .col
                +featureBullet("{{ $t('subscriptionBenefit4') }}")
                +featureBullet("{{ $t('subscriptionBenefit5') }}")
                +featureBullet("{{ $t('subscriptionBenefit6') }}")
            .card-deck
              .card.text-center(:class='{active: subscriptionPlan === "basic_earned"}')
                .card-body
                  .subscription-price
                    span.superscript $
                    span 5
                    span.superscript.muted .00
                  .small {{ $t('everyMonth') }}
                  .divider
                  p.benefits(v-markdown='$t("earnGemsMonthly", {cap:25})')
                  .spacer
                  button.btn.btn-primary(@click='subscriptionPlan = "basic_earned"') {{ subscriptionPlan === "basic_earned" ? $t('selected') : $t('select') }}
              .card.text-center(:class='{active: subscriptionPlan === "basic_3mo"}')
                .card-body
                  .subscription-price
                    span.superscript $
                    span 15
                    span.superscript.muted .00
                  .small {{ $t('everyXMonths', {interval: 3}) }}
                  .divider
                  p.benefits(v-markdown='$t("earnGemsMonthly", {cap:30})')
                  p.benefits(v-markdown='$t("receiveMysticHourglass")')
                  button.btn.btn-primary(@click='subscriptionPlan = "basic_3mo"') {{ subscriptionPlan === "basic_3mo" ? $t('selected') : $t('select') }}
              .card.text-center(:class='{active: subscriptionPlan === "basic_6mo"}')
                .card-body
                  .subscription-price
                    span.superscript $
                    span 30
                    span.superscript.muted .00
                  .small {{ $t('everyXMonths', {interval: 6}) }}
                  .divider
                  p.benefits(v-markdown='$t("earnGemsMonthly", {cap:35})')
                  p.benefits(v-markdown='$t("receiveMysticHourglasses", {amount:2})')
                  button.btn.btn-primary(@click='subscriptionPlan = "basic_6mo"') {{ subscriptionPlan === "basic_6mo" ? $t('selected') : $t('select') }}
              .card.text-center(:class='{active: subscriptionPlan === "basic_12mo"}')
                .card-body
                  .subscription-price
                    span.superscript $
                    span 48
                    span.superscript.muted .00
                  .small {{ $t('everyYear') }}
                  .divider
                  p.benefits(v-markdown='$t("earnGemsMonthly", {cap:45})')
                  p.benefits(v-markdown='$t("receiveMysticHourglasses", {amount:4})')
                  button.btn.btn-primary(@click='subscriptionPlan = "basic_12mo"') {{ subscriptionPlan === "basic_12mo" ? $t('selected') : $t('select') }}
            .row.text-center(v-if='subscriptionPlan')
              h2.mx-auto.text-payment {{ $t('choosePaymentMethod') }}
            .row.text-center
              a.mx-auto {{ $t('haveCouponCode') }}
            .card-deck(v-if='subscriptionPlan')
              .card.text-center.payment-method
                .card-body(@click='showStripe({subscription: subscriptionPlan})')
                  .mx-auto(v-html='icons.creditCard', style='"height: 56px; width: 159px; margin-top: 1em;"')
              .card.text-center.payment-method
                a.card-body.paypal(:href='paypalSubscriptionLink', target='_blank')
                  img(src='~assets/images/paypal.png')
              .card.text-center.payment-method
                .card-body.amazon(@click="amazonPaymentsInit({type: 'subscription', subscription: subscriptionPlan})")
                  img(src='~assets/images/amazon-payments.png')
            .row.text-center
              .svg-icon.mx-auto(v-html='icons.heart', style='"height: 24px; width: 24px;"')
            .row.text-center.text-outtro
              .col-6.offset-3 {{ $t('subscribeSupportsDevs') }}
</template>

<style lang="scss">
  #buy-gems__BV_body_ {
    padding: 0;
  }
</style>

<style lang="scss" scoped>
  a.mx-auto {
    color: #2995cd;
  }

  button {
    margin-bottom: 1em;
  }

  p {
    font-size: 16px;
  }

  .amazon {
    padding-top: 1.8em;
  }

  .benefits {
    font-size: 14px;
  }

  .bubble {
    width: 32px;
    height: 32px;
    border-radius: 1000px;
    border: solid 2px #e1e0e3;
  }

  .gem-deck {
    align-items: center;
    justify-content: center;
  }

  .card {
    margin: 1em;
    border-radius: 2px;
    box-shadow: 0 2px 2px 0 rgba(26, 24, 29, 0.16), 0 1px 4px 0 rgba(26, 24, 29, 0.12);
  }

  .card.active {
    border-color: #24cc8f;
    button {
      background-color: #24cc8f;
    }
  }

  .divider {
    width: 80%;
    height: 1px;
    background-color: #e1e0e3;
    margin: 1em auto;
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

  .muted {
    color: #c3c0c7;
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

  .payment-method:hover {
    cursor: pointer;
  }

  .paypal {
    padding-top: 1.3em;
  }

  .purple-gradient {
    background-image: linear-gradient(74deg, #4f2a93, #6133b4);
    height: 14em;
  }

  .spacer {
    height: 4em;
  }

  .subscription-price {
		font-family: Roboto Condensed;
		font-size: 48px;
		font-weight: bold;
		color: #1ca372;
  }

  .superscript {
    font-size: 24px;
    vertical-align: super;
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
  import { mapState } from 'client/libs/store';
  import markdown from 'client/directives/markdown';
  import planGemLimits from 'common/script/libs/planGemLimits';
  import paymentsMixin from 'client/mixins/payments';

  import checkIcon from 'assets/svg/check.svg';
  import creditCard from 'assets/svg/credit-card.svg';
  import heart from 'assets/svg/health.svg';
  import logo from 'assets/svg/habitica-logo.svg';

  import fourGems from 'assets/svg/4-gems.svg';
  import twentyOneGems from 'assets/svg/21-gems.svg';
  import fortyTwoGems from 'assets/svg/42-gems.svg';
  import eightyFourGems from 'assets/svg/84-gems.svg';

  export default {
    mixins: [paymentsMixin],
    components: {
      planGemLimits,
    },
    computed: {
      ...mapState({user: 'user.data'}),
      startingPageOption () {
        return this.$store.state.gemModalOptions.startingPage;
      },
      hasSubscription () {
        return Boolean(this.user.purchased.plan.customerId);
      },
      userReachedGemCap () {
        return this.user.purchased.plan.customerId && this.user.purchased.plan.gemsBought >= this.user.purchased.plan.consecutive.gemCapExtra + this.planGemLimits.convCap;
      },
    },
    directives: {
      markdown,
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
        gemAmount: 0,
        subscriptionPlan: '',
        selectedPage: 'subscribe',
        amazonPayments: {},
        planGemLimits,
      };
    },
    methods: {
      close () {
        this.$root.$emit('bv::hide::modal', 'buy-gems');
      },
    },
    watch: {
      startingPageOption () {
        this.selectedPage = this.$store.state.gemModalOptions.startingPage;
      },
    },
  };
</script>
