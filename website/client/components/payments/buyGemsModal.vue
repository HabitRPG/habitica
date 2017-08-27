<template lang="pug">
b-modal#buy-gems(title="Buy Gems", :hide-footer="true", size='lg')
  .modal-body
      div(v-if='userReachedGemCap')
        h2 {{ $t('buyGemsGold') }}
        p {{ $t('maxBuyGems') }}

      .row(v-if='!userReachedGemCap')
        .col-12
          h2 {{ $t('buyGemsGold') }}
          p {{ $t('subGemPop') }}

        .col-4
          button.btn.btn-primary(@click='purchase({type: "gems", key: "gem"})')
            | Buy Gems for 20 Gold each
            span.Pet_Currency_Gem.inline-gems
             .badge.badge-success.stack-count {{planGemLimits.convCap + user.purchased.plan.consecutive.gemCapExtra - user.purchased.plan.gemsBought}}
        .col-8
          p {{ $t('buyGemsAllow1') }}
            | &nbsp; {{planGemLimits.convCap + user.purchased.plan.consecutive.gemCapExtra - user.purchased.plan.gemsBought}}&nbsp;
            | {{ $t('buyGemsAllow2') }}
        .col-12
          p(v-html="$t('seeSubscriptionDetails')")

      .row(v-if='user.purchased.plan.customerId')
        .col-12
          h2 {{ $t('purchaseGemsSeparately') }}
        .col-12.alert.alert-info
            | $5 {{ $t('USD') }}  = +20
        .col-12
            h3 {{ $t('paymentMethods') }}
            button.purchase.btn.btn-primary(ng-click='Payments.showStripe({})') {{ $t('card') }}
            a.purchase(href='/paypal/checkout?_id=${user._id}&apiToken=${User.settings.auth.apiToken}')
              img(src='https://www.paypalobjects.com/webstatic/en_US/i/buttons/pp-acceptance-small.png',alt='Pay now with Paypal')
            a.purchase(ng-click="Payments.amazonPayments.init({type: 'single'})")
              img(src='https://payments.amazon.com/gp/cba/button', alt='Pay now with Amazon Payments')

      .row(v-if='!user.purchased.plan.customerId')
        .col-12
          h2 {{ $t('purchaseGems') }}
          .small
            span.dashed-underline(popover="$t('donateText3')", popover-trigger='mouseenter', popover-placement='bottom')
              | $5 {{ $t('USD') }}
              span#TotalGemPrice.dashed-underline(popover="$t('donateText1')",
                popover-trigger='mouseenter', ement='bottom')
                  | +20
                  span(class="Pet_Currency_Gem1x inline-gems")
              .container-fluid
                  p
                    small.muted {{ $t('paymentMethods') }}
                  a.purchase.btn.btn-primary(ng-click='Payments.showStripe({})') {{ $t('card') }}
                  a.purchase(href='/paypal/checkout?_id=${user._id}&apiToken=${User.settings.auth.apiToken}')
                    img(src='https://www.paypalobjects.com/webstatic/en_US/i/buttons/pp-acceptance-small.png',
                      alt='Pay now with Paypal')
                  a.purchase(ng-click="Payments.amazonPayments.init({type: 'single'})")
                    img(src='https://payments.amazon.com/gp/cba/button', alt='Pay now with Amazon Payments')

        .container-fluid
          h2 {{ $t('freeGemsTitle') }}
          p {{ $t('subFreeGemsHow') }}

        .well
          h3
            .small {{ $t('buyGemsGoldTitle') }}
          h3 {{ $t('becomeSubscriber') }}

          div(ng-include="'partials/options.settings.subscription.html'", ng-controller='SettingsCtrl')

      .row(v-if='user.purchased.plan.customerId')
        .col-12
          p(v-html="$t('seeSubscriptionDetails')")
  .modal-footer
    .col-12.text-center
      button.btn.btn-secondary(@click='close()') {{ $t('close') }}
</template>

<script>
import bModal from 'bootstrap-vue/lib/components/modal';
import { mapState } from 'client/libs/store';
import planGemLimits from '../../../common/script/libs/planGemLimits';

export default {
  components: {
    bModal,
  },
  data () {
    return {
      planGemLimits,
    };
  },
  computed: {
    ...mapState({user: 'user.data'}),
    userReachedGemCap () {
      return this.user.purchased.plan.customerId && this.user.purchased.plan.gemsBought >= this.user.purchased.plan.consecutive.gemCapExtra + this.planGemLimits.convCap;
    },
  },
  methods: {
    close () {
      this.$root.$emit('hide::modal', 'buy-gems');
    },
    purchase (params) {
      try {
        this.$store.dispatch('shops:purchase', params);
      } catch (e) {
        alert(e.message);
      }
    },
  },
};
</script>
