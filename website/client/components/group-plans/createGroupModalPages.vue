<template lang="pug">
.create-group-modal-pages
  .col-12(v-if='activePage === PAGES.CREATE_GROUP')
    h2 {{ $t('nameYourGroup') }}
    .form-group
      label.control-label(for='new-group-name') {{ $t('name') }}
      input.form-control#new-group-name.input-medium.option-content(required, type='text', :placeholder="$t('exampleGroupName')", v-model='newGroup.name')
    .form-group
      label(for='new-group-description') {{ $t('description') }}
      textarea.form-control#new-group-description.option-content(cols='3', :placeholder="$t('exampleGroupDesc')", v-model='newGroup.description')
    .form-group.text-left(v-if='newGroup.type === "guild"')
      .custom-control.custom-radio
        input.custom-control-input(type='radio', name='new-group-privacy', value='private', v-model='newGroup.privacy')
        label.custom-control-label {{ $t('thisGroupInviteOnly') }}
    .form-group.text-left
      .custom-control.custom-checkbox
        input.custom-control-input(type='checkbox', v-model='newGroup.leaderOnly.challenges' id='create-group-leaderOnlyChallenges-checkbox')
        label.custom-control-label(for='create-group-leaderOnlyChallenges-checkbox') {{ $t('leaderOnlyChallenges') }}
    .form-group(v-if='newGroup.type === "party"')
      button.btn.btn-secondary.form-control(@click='createGroup()', :value="$t('createGroupPlan')")
    .form-group
      button.btn.btn-primary.btn-lg.btn-block(@click="createGroup()", :disabled="!newGroupIsReady") {{ $t('createGroupPlan') }}
  .col-12(v-if='activePage === PAGES.PAY')
    h2 {{ $t('choosePaymentMethod') }}
    .payments-column
      button.purchase.btn.btn-primary.payment-button.payment-item(@click='pay(PAYMENTS.STRIPE)') 
        .svg-icon.credit-card-icon(v-html="icons.creditCardIcon")
        | {{ $t('card') }}
      amazon-button.payment-item(:amazon-data="pay(PAYMENTS.AMAZON)")
</template>

<style lang="scss" scoped>
  h2 {
    font-family: 'Varela Round', sans-serif;
    font-weight: normal;
    font-size: 29px;
    color: #34313a;
    margin-top: 1em;
  }

  .box {
    border-radius: 2px;
    background-color: #ffffff;
    box-shadow: 0 2px 2px 0 rgba(26, 24, 29, 0.16), 0 1px 4px 0 rgba(26, 24, 29, 0.12);
    padding: 2em;
    text-align: center;
    vertical-align: bottom;
    height: 100px;
    width: 306px;
    margin: 0 auto;
    margin-bottom: 1em;
  }

  .box .svg-icon {
    margin: 0 auto;
  }

  .form-group {
    text-align: left;
    font-weight: bold;
  }

  .box:hover {
    cursor: pointer;
    opacity: 0.7;
  }

  .btn-block {
    margin-bottom: 1em;
  }
</style>

<script>
import * as Analytics from 'client/libs/analytics';
import { mapState } from 'client/libs/store';
import paymentsMixin from '../../mixins/payments';
import amazonButton from 'client/components/payments/amazonButton';

import creditCardIcon from 'assets/svg/credit-card-icon.svg';

export default {
  mixins: [paymentsMixin],
  components: {
    amazonButton,
  },
  data () {
    return {
      amazonPayments: {},
      icons: Object.freeze({
        creditCardIcon,
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
      Analytics.track({
        hitType: 'event',
        eventCategory: 'group-plans-static',
        eventAction: 'view',
        eventLabel: page,
      });
      this.activePage = page;
      window.scrollTo(0, 0);
    },
    createGroup () {
      this.changePage(this.PAGES.PAY);
    },
    pay (paymentMethod) {
      const subscriptionKey = 'group_monthly';
      let paymentData = {
        subscription: subscriptionKey,
        coupon: null,
      };

      if (this.upgradingGroup && this.upgradingGroup._id) {
        paymentData.groupId = this.upgradingGroup._id;
        paymentData.group = this.upgradingGroup;
      } else {
        paymentData.groupToCreate = this.newGroup;
      }

      this.paymentMethod = paymentMethod;
      if (this.paymentMethod === this.PAYMENTS.STRIPE) {
        this.showStripe(paymentData);
      } else if (this.paymentMethod === this.PAYMENTS.AMAZON) {
        paymentData.type = 'subscription';
        return paymentData;
      }
    },
  },
};
</script>
