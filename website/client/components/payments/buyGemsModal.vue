<template lang="pug">
div(v-if='user')
  amazon-payments-modal(:amazon-payments='amazonPayments')
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
              .row.text-center
                .col-md-4
                  button.purchase.btn.btn-primary(@click='showStripe({})') {{ $t('card') }}
                .col-md-4
                  a.purchase(:href='paypalCheckoutLink', target='_blank')
                    img(src='https://www.paypalobjects.com/webstatic/en_US/i/buttons/pp-acceptance-small.png', :alt="$t('paypal')")
                .col-md-4
                  a.purchase(@click="amazonPaymentsInit({type: 'single'})")
                    img(src='https://payments.amazon.com/gp/cba/button', :alt="$t('amazonPayments')")

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
                  .subscribe-pay
                    h3 {{ $t('paymentMethods') }}
                    .row.text-center
                      .col-md-4
                        button.purchase.btn.btn-primary(@click='showStripe({})') {{ $t('card') }}
                      .col-md-4
                        a.purchase(:href='paypalCheckoutLink', target='_blank')
                          img(src='https://www.paypalobjects.com/webstatic/en_US/i/buttons/pp-acceptance-small.png', :alt="$t('paypal')")
                      .col-md-4
                        a.purchase(@click="amazonPaymentsInit({type: 'single'})")
                          img(src='https://payments.amazon.com/gp/cba/button', :alt="$t('amazonPayments')")

          .container-fluid
            h2 {{ $t('freeGemsTitle') }}
            p {{ $t('subFreeGemsHow') }}

          .well
            h3
              .small {{ $t('buyGemsGoldTitle') }}
            h3 {{ $t('becomeSubscriber') }}

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
import paymentsMixin from '../../mixins/payments';
import amazonPaymentsModal from '../payments/amazonModal';

export default {
  mixins: [paymentsMixin],
  components: {
    bModal,
    amazonPaymentsModal,
  },
  data () {
    return {
      amazonPayments: {},
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
      } finally {
        this.$root.$emit('playSound', 'Reward');
      }
    },
  },
};
</script>
