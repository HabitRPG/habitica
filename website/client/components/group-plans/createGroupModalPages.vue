<template lang="pug">
div
  .col-12(v-if='activePage === PAGES.CREATE_GROUP')
    .form-group
      label.control-label(for='new-group-name') Name
      input.form-control#new-group-name.input-medium.option-content(required, type='text', placeholder="Name", v-model='newGroup.name')
    .form-group
      label(for='new-group-description') {{ $t('description') }}
      textarea.form-control#new-group-description.option-content(cols='3', :placeholder="$t('description')", v-model='newGroup.description')
    .form-group.text-left(v-if='newGroup.type === "guild"')
      .custom-control.custom-radio
        input.custom-control-input(type='radio', name='new-group-privacy', value='private', v-model='newGroup.privacy')
        label.custom-control-label {{ $t('inviteOnly') }}
    .form-group.text-left
      .custom-control.custom-checkbox
        input.custom-control-input(type='checkbox', v-model='newGroup.leaderOnly.challenges' id='create-group-leaderOnlyChallenges-checkbox')
        label.custom-control-label(for='create-group-leaderOnlyChallenges-checkbox') {{ $t('leaderOnlyChallenges') }}
    .form-group(v-if='newGroup.type === "party"')
      button.btn.btn-secondary.form-control(@click='createGroup()', :value="$t('createGroupPlan')")
    .form-group
      button.btn.btn-primary.btn-lg.btn-block(@click="createGroup()", :disabled="!newGroupIsReady") {{ $t('createGroupPlan') }}
  .col-12(v-if='activePage === PAGES.PAY')
    .payment-providers
      h3 Choose your payment method
      .box.payment-button(@click='pay(PAYMENTS.STRIPE)')
        .svg-icon.credit-card-icon(v-html="icons.creditCard")
      .box.payment-button(@click='pay(PAYMENTS.AMAZON)')
        .svg-icon.amazon-pay-icon(v-html="icons.amazonpay")
</template>

<style lang="scss" scoped>
  .box {
    border-radius: 2px;
    background-color: #ffffff;
    box-shadow: 0 2px 2px 0 rgba(26, 24, 29, 0.16), 0 1px 4px 0 rgba(26, 24, 29, 0.12);
    padding: 2em;
    text-align: center;
    display: inline-block !important;
    vertical-align: bottom;
    margin-right: 1em;
    margin-bottom: 2em;
    height: 100px;
  }

  .box:hover {
    cursor: pointer;
    opacity: 0.7;
  }

  .amazon-pay-icon {
    width: 100px;
  }

  .credit-card-icon {
    width: 120px;
  }

  .btn-block {
    margin-bottom: 1em;
  }
</style>

<script>
import { mapState } from 'client/libs/store';
import paymentsMixin from '../../mixins/payments';

import amazonpay from 'assets/svg/amazonpay.svg';
import creditCard from 'assets/svg/credit-card.svg';

export default {
  mixins: [paymentsMixin],
  data () {
    return {
      amazonPayments: {},
      icons: Object.freeze({
        amazonpay,
        creditCard,
      }),
      PAGES: {
        CREATE_GROUP: 'create-group',
        UPGRADE_GROUP: 'upgrade-group',
        PAY: 'pay',
      },
      PAYMENTS: {
        AMAZON: 'amazon',
        STRIPE: 'stripe',
      },
      activePage: 'create-group',
      newGroup: {
        type: 'guild',
        privacy: 'private',
        name: '',
        leaderOnly: {
          challenges: false,
        },
      },
    };
  },
  computed: {
    ...mapState({user: 'user.data'}),
    newGroupIsReady () {
      return Boolean(this.newGroup.name);
    },
  },
  methods: {
    changePage (page) {
      this.activePage = page;
      window.scrollTo(0, 0);
    },
    createGroup () {
      this.changePage(this.PAGES.PAY);
    },
    pay (paymentMethod) {
      const subscriptionKey = 'group_monthly'; // @TODO: Get from content API?
      let paymentData = {
        subscription: subscriptionKey,
        coupon: null,
      };

      if (this.upgradingGroup && this.upgradingGroup._id) {
        paymentData.groupId = this.upgradingGroup._id;
      } else {
        paymentData.groupToCreate = this.newGroup;
      }

      this.paymentMethod = paymentMethod;
      if (this.paymentMethod === this.PAYMENTS.STRIPE) {
        this.showStripe(paymentData);
      } else if (this.paymentMethod === this.PAYMENTS.AMAZON) {
        paymentData.type = 'subscription';
        this.amazonPaymentsInit(paymentData);
      }
    },
  },
};
</script>
