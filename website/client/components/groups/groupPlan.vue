<template lang="pug">
// @TODO: Move to group plans folder
div
  div
    .header
      h1.text-center Need more for your Group?
      .row
        .col-6.offset-3.text-center {{ $t('groupBenefitsDescription') }}
    .container.benefits
      .row
        .col-4
          .box
            img.box1(src='~client/assets/images/group-plans/group-14@3x.png')
            hr
            h2 {{ $t('teamBasedTasks') }}
            p Set up an easily-viewed shared task list for the group. Assign tasks to your fellow group members, or let them claim their own tasks to make it clear what everyone is working on!

        .col-4
          .box
            img.box2(src='~client/assets/images/group-plans/group-12@3x.png')
            hr
            h2 Group Management Controls
            p Use task approvals to verify that a task that was really completed, add Group Managers to share responsibilities, and enjoy a private group chat for all team members.

        .col-4
          .box
            img.box3(src='~client/assets/images/group-plans/group-13@3x.png')
            hr
            h2 In-Game Benefits
            p Group members get an exclusive Jackalope Mount, as well as full subscription benefits, including special monthly equipment sets and the ability to buy gems with gold.

    #upgrading-group.container.payment-options(v-if='upgradingGroup._id')
      h1.text-center.purple-header Are you ready to upgrade?
      .row
        .col-12.text-center
          .purple-box
            .amount-section
              .dollar $
              .number 9
              .name Group Owner Subscription
            .plus
              .svg-icon(v-html="icons.positiveIcon")
            .amount-section
              .dollar $
              .number 3
              .name Each Individual Group Member

          .box.payment-providers
            h3 Choose your payment method
            .box.payment-button(@click='pay(PAYMENTS.STRIPE)')
              div
                .svg-icon.credit-card-icon(v-html="icons.group")
                p.credit-card Credit Card
              p Powered by Stripe
            .box.payment-button(@click='pay(PAYMENTS.AMAZON)')
              .svg-icon.amazon-pay-icon(v-html="icons.amazonpay")

    .container.col-6.offset-3.create-option(v-if='!upgradingGroup._id')
      .row
        h1.col-12.text-center.purple-header Create your Group today!
      .row
        .col-12.text-center
          button.btn.btn-primary.create-group(@click='launchModal("create")') Create Your New Group
      .row.pricing
        .col-5
          .dollar $
          .number 9
          .name
            div Group Owner
            div Subscription
        .col-1
          .plus +
        .col-6
          .dollar $
          .number 3
          .name
            div Each Additional
            div Member

  b-modal#group-plan-modal(title="Select Payment", size='md', hide-footer=true)
    .col-12(v-if='activePage === PAGES.CREATE_GROUP')
      .form-group
        label.control-label(for='new-group-name') Name
        input.form-control#new-group-name.input-medium.option-content(required, type='text', placeholder="Name", v-model='newGroup.name')
      .form-group
        label(for='new-group-description') {{ $t('description') }}
        textarea.form-control#new-group-description.option-content(cols='3', :placeholder="$t('description')", v-model='newGroup.description')
      .form-group(v-if='type === "guild"')
        .radio
          label
            input(type='radio', name='new-group-privacy', value='private', v-model='newGroup.privacy')
            | {{ $t('inviteOnly') }}

      .form-group
        .checkbox
          label
            input(type='checkbox', v-model='newGroup.leaderOnly.challenges')
            | {{ $t('leaderOnlyChallenges') }}
      .form-group(v-if='type === "party"')
        button.btn.btn-secondary.form-control(@click='createGroup()', :value="$t('createGroupPlan')")
      .form-group
        button.btn.btn-primary.btn-lg.btn-block(@click="createGroup()", :disabled="!newGroupIsReady") {{ $t('createGroupPlan') }}
    .col-12(v-if='activePage === PAGES.PAY')
      .payment-providers
        h3 Choose your payment method
        .box.payment-button(@click='pay(PAYMENTS.STRIPE)')
          p Credit Card
          p Powered by Stripe
        .box.payment-button(@click='pay(PAYMENTS.AMAZON)')
          | Amazon Pay
</template>

<style lang="scss" scoped>
  #upgrading-group {
    .amount-section {
      position: relative;
    }

    .dollar {
      position: absolute;
      left: -1em;
      top: 1em;
    }

    .purple-box {
      color: #bda8ff;
      margin-bottom: 2em;
    }

    .number {
      font-weight: bold;
      color: #fff;
    }

    .payment-button {
      display: block;
      margin: 0 auto;
      margin-bottom: 1em;
    }

    .plus .svg-icon{
      width: 24px;
    }

    .payment-providers {
      width: 350px;
    }

    .credit-card {
      font-size: 20px;
      font-weight: bold;
      margin-bottom: 0;
      margin-top: .5em;
      display: inline-block;
    }

    .credit-card-icon {
      width: 25px;
      display: inline-block;
      margin-right: .5em;
    }

    .amazon-pay-icon {
      width: 150px;
      margin: 0 auto;
      margin-top: .5em;
    }
  }

  .header {
    margin-bottom: 3em;
    margin-top: 4em;
    background-color: #4f2a93;
    color: #fff;
    padding: 2em;
    height: 356px;

    h1 {
      font-size: 48px;
      color: #fff;
    }
  }

  .benefits {
    margin-top: -12em;

    .box {
      height: 416px;
    }

    h2 {
      color: #6133b4;
    }
  }

  .box {
    border-radius: 2px;
    background-color: #ffffff;
    box-shadow: 0 2px 2px 0 rgba(26, 24, 29, 0.16), 0 1px 4px 0 rgba(26, 24, 29, 0.12);
    padding: 2em;
    text-align: center;
    display: inline-block !important;
    vertical-align: bottom;
    margin-right: 1em;

    img {
      margin: 0 auto;
      margin-top: 2em;
      margin-bottom: 1em;
    }
  }

  img.box1 {
    width: 266px;
  }

  img.box2 {
    margin-top: 3.5em;
    width: 262px;
    margin-bottom: 3.7em;
  }

  img.box3 {
    width: 225px;
    margin-bottom: 3.0em;
  }

  button.create-group {
    width: 330px;
    height: 96px;
  }

  .purple-header {
    color: #6133b4;
    font-size: 48px;
    margin-top: 1em;
  }

  .pricing {
    margin-top: 2em;
    margin-bottom: 4em;

    .dollar, .number, .name {
      display: inline-block;
      vertical-align: bottom;
      color: #a5a1ac;
    }

    .plus {
      font-size: 34px;
      color: #a5a1ac;
    }

    .dollar {
      margin-bottom: 1.5em;
      font-size: 32px;
      font-weight: bold;
    }

    .name {
      font-size: 24px;
      margin-bottom: .8em;
      margin-left: .5em;
    }

    .number {
      font-size: 72px;
      font-weight: bolder;
    }
  }

  .payment-options {
    margin-bottom: 4em;

    .purple-box {
      background-color: #4f2a93;
      color: #fff;
      padding: .5em;
      border-radius: 8px;
      width: 200px;
      height: 215px;

      .dollar {
      }

      .number {
        font-size: 60px;
      }

      .name {
        width: 100px;
        margin-left: .3em;
      }

      .plus {
        width: 100%;
        text-align: center;
      }

      div {
        display: inline-block;
      }
    }

    .box, .purple-box {
      display: inline-block;
      vertical-align: bottom;
    }
  }

  .payment-button {
    width: 200px;
    height: 80px;
    margin-bottom: .5em;
    padding: .5em;
    display: block;
  }

  .payment-button:hover {
    cursor: pointer;
  }
</style>

<script>
import paymentsMixin from '../../mixins/payments';
import { mapState } from 'client/libs/store';
import group from 'assets/svg/group.svg';
import amazonpay from 'assets/svg/amazonpay.svg';
import positiveIcon from 'assets/svg/positive.svg';

export default {
  mixins: [paymentsMixin],
  data () {
    return {
      amazonPayments: {},
      icons: Object.freeze({
        group,
        amazonpay,
        positiveIcon,
      }),
      PAGES: {
        CREATE_GROUP: 'create-group',
        UPGRADE_GROUP: 'upgrade-group',
        PAY: 'pay',
      },
      // @TODO: Import from payment library?
      PAYMENTS: {
        AMAZON: 'amazon',
        STRIPE: 'stripe',
      },
      paymentMethod: '',
      newGroup: {
        type: 'guild',
        privacy: 'private',
        name: '',
        leaderOnly: {
          challenges: false,
        },
      },
      activePage: '',
      type: 'guild', // Guild or Party @TODO enum this
    };
  },
  mounted () {
    this.activePage = this.PAGES.BENEFITS;
  },
  computed: {
    newGroupIsReady () {
      return Boolean(this.newGroup.name);
    },
    upgradingGroup () {
      return this.$store.state.upgradingGroup;
    },
    // @TODO: can we move this to payment mixin?
    ...mapState({user: 'user.data'}),
  },
  methods: {
    launchModal () {
      this.changePage(this.PAGES.CREATE_GROUP);
      this.$root.$emit('bv::show::modal', 'group-plan-modal');
    },
    changePage (page) {
      this.activePage = page;
      window.scrollTo(0, 0);
    },
    createGroup () {
      this.changePage(this.PAGES.PAY);
    },
    pay (paymentMethod) {
      let subscriptionKey = 'group_monthly'; // @TODO: Get from content API?
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
