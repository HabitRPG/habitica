<template lang="pug">
b-modal#send-gems(:title="title", :hide-footer="true", size='md', @hide='onHide()')
  div(v-if='userReceivingGems')
    .panel.panel-default(
      :class="gift.type === 'gems' ? 'panel-primary' : 'transparent'",
      @click='gift.type = "gems"'
    )
      h3.panel-heading.clearfix
        .float-right
          span(v-if='gift.gems.fromBalance') {{ $t('sendGiftGemsBalance', {number: userLoggedIn.balance * 4}) }}
          span(v-if='!gift.gems.fromBalance') {{ $t('sendGiftCost', {cost: gift.gems.amount / 4}) }}
        | {{ $t('gemsPopoverTitle') }}
      .panel-body
        .row
          .col-md-6
            .form-group
              input.form-control(type='number', placeholder='Number of Gems',
                min='0', :max='gift.gems.fromBalance ? userLoggedIn.balance * 4 : 9999',
                v-model='gift.gems.amount')
          .col-md-6
            .btn-group
              button.btn.btn-secondary(:class="{active: gift.gems.fromBalance}", @click="gift.gems.fromBalance = true") {{ $t('sendGiftFromBalance') }}
              button.btn.btn-secondary(:class="{active: !gift.gems.fromBalance}", @click="gift.gems.fromBalance = false") {{ $t('sendGiftPurchase') }}
        .row
          .col-md-12
            p.small(v-html="$t('gemGiftsAreOptional', assistanceEmailObject)")

    .panel.panel-default(
      :class="gift.type=='subscription' ? 'panel-primary' : 'transparent'",
      @click='gift.type = "subscription"'
    )
      h3.panel-heading {{ $t('subscription') }}
      .panel-body
        .row
          .col-md-12
            .form-group
              .radio(v-for='block in subscriptionBlocks', v-if="block.target !== 'group' && block.canSubscribe === true")
                label
                  input(type="radio", name="subRadio", :value="block.key", v-model='gift.subscription.key')
                  | {{ $t('sendGiftSubscription', {price: block.price, months: block.months}) }}

    textarea.form-control(rows='3', v-model='gift.message', :placeholder="$t('sendGiftMessagePlaceholder')")
    //include ../formatting-help

  .modal-footer
    button.btn.btn-primary(
      v-if="fromBal",
      @click="sendGift()",
      :disabled="sendingInProgress"
    ) {{ $t("send") }}
    .payments-column.mx-auto(v-else, :class="{'payments-disabled': !gift.subscription.key && gift.gems.amount < 1}")
      button.purchase.btn.btn-primary.payment-button.payment-item(@click='showStripe({gift, uuid: userReceivingGems._id, receiverName})', :disabled="!gift.subscription.key && gift.gems.amount < 1") 
        .svg-icon.credit-card-icon(v-html="icons.creditCardIcon")
        | {{ $t('card') }}
      button.btn.payment-item.paypal-checkout.payment-button(@click="openPaypalGift({gift: gift, giftedTo: userReceivingGems._id, receiverName})", :disabled="!gift.subscription.key && gift.gems.amount < 1")
        | &nbsp;
        img(src='~assets/images/paypal-checkout.png', :alt="$t('paypal')")
        | &nbsp;
      amazon-button.payment-item.mb-0(
        :amazon-data="{type: 'single', gift, giftedTo: userReceivingGems._id, receiverName}",
        :amazon-disabled="!gift.subscription.key && gift.gems.amount < 1",
      )
</template>

<style lang="scss">
  .panel {
    margin-bottom: 4px;

    &.transparent {
      .panel-body {
        opacity: 0.7;
      }
    }

    .panel-heading {
      margin-top: 8px;
      margin-bottom: 5px;
    }

    .panel-body {
      padding: 8px;
      border-radius: 2px;
      border: 1px solid #C3C0C7;
    }
  }
</style>

<style lang="scss" scoped>
input[type="radio"] {
  margin-right: 4px;
}
</style>

<script>
import toArray from 'lodash/toArray';
import omitBy from 'lodash/omitBy';
import orderBy from 'lodash/orderBy';
import { mapState } from 'client/libs/store';
import planGemLimits from '../../../common/script/libs/planGemLimits';
import paymentsMixin from 'client/mixins/payments';
import notificationsMixin from 'client/mixins/notifications';
import amazonButton from 'client/components/payments/amazonButton';
import creditCardIcon from 'assets/svg/credit-card-icon.svg';

// @TODO: EMAILS.TECH_ASSISTANCE_EMAIL, load from config
const TECH_ASSISTANCE_EMAIL = 'admin@habitica.com';

export default {
  mixins: [paymentsMixin, notificationsMixin],
  components: {
    amazonButton,
  },
  data () {
    return {
      planGemLimits,
      gift: {
        type: 'gems',
        gems: {
          amount: 0,
          fromBalance: true,
        },
        subscription: {key: ''},
        message: '',
      },
      amazonPayments: {},
      assistanceEmailObject: {
        hrefTechAssistanceEmail: `<a href="mailto:${TECH_ASSISTANCE_EMAIL}">${TECH_ASSISTANCE_EMAIL}</a>`,
      },
      sendingInProgress: false,
      userReceivingGems: null,
      icons: Object.freeze({
        creditCardIcon,
      }),
    };
  },
  computed: {
    ...mapState({
      userLoggedIn: 'user.data',
      originalSubscriptionBlocks: 'content.subscriptionBlocks',
    }),
    subscriptionBlocks () {
      let subscriptionBlocks = toArray(this.originalSubscriptionBlocks);
      subscriptionBlocks = omitBy(subscriptionBlocks, (block) => {
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
    receiverName () {
      if (this.userReceivingGems.auth && this.userReceivingGems.auth.local && this.userReceivingGems.auth.local.username) {
        return this.userReceivingGems.auth.local.username;
      } else {
        return this.userReceivingGems.profile.name;
      }
    },
  },
  methods: {
    // @TODO move to payments mixin or action (problem is that we need notifications)
    async sendGift () {
      this.sendingInProgress = true;
      await this.$store.dispatch('members:transferGems', {
        message: this.gift.message,
        toUserId: this.userReceivingGems._id,
        gemAmount: this.gift.gems.amount,
      });
      this.close();
      setTimeout(() => { // wait for the send gem modal to be closed
        this.$root.$emit('habitica:payment-success', {
          paymentMethod: 'balance',
          paymentCompleted: true,
          paymentType: 'gift-gems-balance',
          gift: {
            gems: {
              amount: this.gift.gems.amount,
            },
          },
          giftReceiver: this.receiverName,
        });
      }, 500);
    },
    onHide () {
      // @TODO this breaks amazon purchases because when the amazon modal
      // is opened this one is closed and the amount reset
      // this.gift.gems.amount = 0;
      this.gift.message = '';
      this.sendingInProgress = false;
    },
    close () {
      this.$root.$emit('bv::hide::modal', 'send-gems');
    },
  },
  mounted () {
    this.$root.$on('habitica::send-gems', (data) => {
      this.userReceivingGems = data;
      this.$root.$emit('bv::show::modal', 'send-gems');
    });
  },
};
</script>
