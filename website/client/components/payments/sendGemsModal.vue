<template lang="pug">
b-modal#send-gems(:title="title", :hide-footer="true", size='lg')
  .modal-body(v-if='userReceivingGems', )
    .panel.panel-default(:class="gift.type === 'gems' ? 'panel-primary' : 'transparent'", @click='gift.type = "gems"')
      .panel-heading
        .pull-right
          span(v-if='gift.gems.fromBalance') {{ $t('sendGiftGemsBalance', {number: userLoggedIn.balance * 4}) }}
          span(v-if='!gift.gems.fromBalance') {{ $t('sendGiftCost', {cost: gift.gems.amount / 4}) }}
        | {{ $t('gemsPopoverTitle') }}
      .panel-body
        .row
          .col-md-6
            .form-group
              input.form-control(type='number', placeholder='Number of Gems',
                min='0', :max='gift.gems.fromBalance ? userLoggedIn.balance * 4 : 0',
                v-model='amount')
          .col-md-6
            .btn-group
              a.btn.btn-default(:class="{active: gift.gems.fromBalance}", @click="gift.gems.fromBalance = true") {{ $t('sendGiftFromBalance') }}
              a.btn.btn-default(:class="{active: !gift.gems.fromBalance}", @click="gift.gems.fromBalance = false") {{ $t('sendGiftPurchase') }}
        .row
          .col-md-12
            p.small.muted {{ $t('gemGiftsAreOptional', assistanceEmailObject) }}

    .panel.panel-default(:class="gift.type=='subscription' ? 'panel-primary' : 'transparent'", @click='gift.type = "subscription"')
      .panel-heading {{ $t('subscription') }}
      .panel-body
        .form-group
          .radio(v-for='block in subscriptionBlocks', v-if="block.target !== 'group' && block.canSubscribe === true")
            label
              input(type="radio", name="subRadio", :value="block.key", v-model='gift.subscription.key')
              | {{ $t('sendGiftSubscription', {price: block.price, months: block.months}) }}

    textarea.form-control(rows='3', v-model='gift.message', :placeholder="$t('sendGiftMessagePlaceholder')")
    //include ../formatting-help

  .modal-footer
    button.btn.btn-primary(v-if='fromBal', ng-click='sendGift(profile._id)') {{ $t("send") }}
    button.btn.btn-primary(v-if='!fromBal', ng-click='Payments.showStripe({gift:gift, uuid:profile._id})') {{ $t('card') }}
    button.btn.btn-warning(v-if='!fromBal', ng-click='Payments.payPalPayment({gift: gift, giftedTo: profile._id})') PayPal
    button.btn.btn-success(v-if='!fromBal', ng-click="Payments.amazonPayments.init({type: 'single', gift: gift, giftedTo: profile._id})") Amazon Payments
    button.btn.btn-default(@click='close()') {{$t('cancel')}}
</template>

<script>
import toArray from 'lodash/toArray';
import omitBy from 'lodash/omitBy';
import orderBy from 'lodash/orderBy';
import bModal from 'bootstrap-vue/lib/components/modal';
import { mapState } from 'client/libs/store';
import planGemLimits from '../../../common/script/libs/planGemLimits';
import subscriptionBlocksContent from 'common/script/content/subscriptionBlocks';

// @TODO: EMAILS.TECH_ASSISTANCE_EMAIL
let TECH_ASSISTANCE_EMAIL = 'admin@habitica.com';

export default {
  props: ['userReceivingGems'],
  components: {
    bModal,
  },
  data () {
    return {
      planGemLimits,
      amount: 0,
      gift: {
        type: 'gems',
        gems: {
          amount: 0,
          fromBalance: true,
        },
        subscription: {key: ''},
        message: '',
      },
      assistanceEmailObject: {
        hrefTechAssistanceEmail: `<a href="mailto:${TECH_ASSISTANCE_EMAIL}">${TECH_ASSISTANCE_EMAIL}</a>`,
      },
    };
  },
  computed: {
    ...mapState({userLoggedIn: 'user.data'}),
    subscriptionBlocks () {
      let subscriptionBlocks = toArray(subscriptionBlocksContent);
      subscriptionBlocks = omitBy(subscriptionBlocks, (block)=> {
        return block.discount === true;
      });
      subscriptionBlocks = orderBy(subscriptionBlocks, ['months']);

      return subscriptionBlocks;
    },
    fromBal () {
      return this.gift.type === 'gems' && this.gift.gems.fromBalance;
    },
    title () {
      if (!this.userReceivingGems) return '';
      return this.$t('sendGiftHeading', {name: this.userReceivingGems.profile.name});
    },
  },
  methods: {
    close () {
      this.$root.$emit('hide::modal', 'send-gems');
    },
  },
};
</script>
