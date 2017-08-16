<template lang="pug">
b-modal#buy-gems(title="Amazon", :hide-footer="true", size='lg')
  .modal-body
    .buy-gems
      // @TODO: +gemButton(true)

      div(ng-if='user.purchased.plan.customerId && (user.purchased.plan.gemsBought >= User.user.purchased.plan.consecutive.gemCapExtra + Shared.planGemLimits.convCap)')
        .panel.panel-default
          .panel-body
              h3 {{ $t('buyGemsGold') }}
              p {{ $t('maxBuyGems') }}

      div(ng-if='user.purchased.plan.customerId && (user.purchased.plan.gemsBought < User.user.purchased.plan.consecutive.gemCapExtra + Shared.planGemLimits.convCap)')
        .panel.panel-default
          .panel-body
            h3 {{ $t('buyGemsGold') }}
            p {{ $t('subGemPop') }}
            .container-fluid
              .row
                .col-md-3
                  button.customize-option(ng-click='User.purchase({params:{type:"gems",key:"gem"}})')
                    span.Pet_Currency_Gem.inline-gems
                     // @TODO: .badge.badge-success.stack-count {{Shared.planGemLimits.convCap + User.user.purchased.plan.consecutive.gemCapExtra - User.user.purchased.plan.gemsBought}}
                  p
                    | 20&nbsp;
                    span.shop_gold
                .col-md-8
                  .popover.right.gem-count-popover
                    .arrow
                    .popover-content
                      p {{ $t('buyGemsAllow1') }}
                        // @TOOD: | &nbsp;{{Shared.planGemLimits.convCap + User.user.purchased.plan.consecutive.gemCapExtra - User.user.purchased.plan.gemsBought}}&nbsp;
                        | {{ $t('buyGemsAllow2') }}
            p {{ $t('seeSubscriptionDetails') }}
      div(ng-if='user.purchased.plan.customerId')
        .well
          h3 {{ $t('purchaseGemsSeparately') }}
          .container-fluid
            .row
              .col-md-4.col-md-offset-4.alert.alert-info $5&nbsp;
                | {{ $t('USD') }}
                span#TotalGemPrice.dashed-underline(:popover="$t('donateText1')",
                  popover-trigger='mouseenter',popover-placement='bottom')
                    | +20
                    span(class="Pet_Currency_Gem1x inline-gems")
          .container-fluid
            .row
              .col-md-10.col-md-offset-2
                p
                  small.muted {{ $t('paymentMethods') }}
                a.purchase.btn.btn-primary(ng-click='Payments.showStripe({})') {{ $t('card') }}
                a.purchase(href='/paypal/checkout?_id=${user._id}&apiToken=${User.settings.auth.apiToken}')
                  img(src='https://www.paypalobjects.com/webstatic/en_US/i/buttons/pp-acceptance-small.png',alt='Pay now with Paypal')
                a.purchase(ng-click="Payments.amazonPayments.init({type: 'single'})")
                  img(src='https://payments.amazon.com/gp/cba/button', alt='Pay now with Amazon Payments')
      div(ng-if='!user.purchased.plan.customerId')
        .panel.panel-default
          .panel-body
            h3 {{ $t('purchaseGems') }}
            .small
              span.dashed-underline(popover="$t('donateText3')", popover-trigger='mouseenter', popover-placement='bottom')
                | {{ $t('donateText2') }}
                .container-fluid
                  .row
                    .col-md-4.col-md-offset-4.alert.alert-info $5&nbsp;
                      | {{ $t('USD') }}
                      span#TotalGemPrice.dashed-underline(popover="$t('donateText1')",
                        popover-trigger='mouseenter', ement='bottom')
                          | +20
                          span(class="Pet_Currency_Gem1x inline-gems")
                .container-fluid
                  .row
                    .col-md-10.col-md-offset-2
                      p
                        small.muted {{ $t('paymentMethods') }}
                      a.purchase.btn.btn-primary(ng-click='Payments.showStripe({})') {{ $t('card') }}
                      a.purchase(href='/paypal/checkout?_id=${user._id}&apiToken=${User.settings.auth.apiToken}')
                        img(src='https://www.paypalobjects.com/webstatic/en_US/i/buttons/pp-acceptance-small.png',
                          alt='Pay now with Paypal')
                      a.purchase(ng-click="Payments.amazonPayments.init({type: 'single'})")
                        img(src='https://payments.amazon.com/gp/cba/button', alt='Pay now with Amazon Payments')

          .container-fluid
            h3 {{ $t('freeGemsTitle') }}
            p {{ $t('subFreeGemsHow') }}

          .well
            h3
              .small {{ $t('buyGemsGoldTitle') }}
            h3 {{ $t('becomeSubscriber') }}

            div(ng-include="'partials/options.settings.subscription.html'", ng-controller='SettingsCtrl')
      div(ng-if='user.purchased.plan.customerId').pull-left
        p {{ $t('seeSubscriptionDetails') }}
      .text-right
        button.btn.btn-default(ng-click='$close()') {{ $t('close') }}
</template>

<script>
import bModal from 'bootstrap-vue/lib/components/modal';

export default {
  components: {
    bModal,
  },
  methods: {
    close () {
      this.$root.$emit('hide::modal', 'buy-gems');
    },
  },
};
</script>
