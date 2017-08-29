<template lang="pug">
div
  amazon-payments-modal(:amazon-payments='amazonPayments')
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

    .container.payment-options(v-if='upgradingGroup._id')
      h1.text-center.purple-header Are you ready to upgrade?
      .row
        .col-6.offset-3.text-center
          .purple-box
            .dollar $
            .number 9
            .name Group Owner Subscription
            .plus +
            .dollar $
            .number 3
            .name Each Individual Group Member

          .box.payment-providers
            h3 Choose your payment method
            .box.payment-button(@click='createGroup(PAYMENTS.STRIPE)')
              p Credit Card
              p Powered by Stripe
            .box.payment-button(@click='createGroup(PAYMENTS.AMAZON)')
              | Amazon Pay

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

  b-modal#group-plan-modal(title="Empty", size='md', hide-footer=true)
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
            input(type='radio', name='new-group-privacy', value='public', v-model='newGroup.privacy')
            | {{ $t('public') }}
        .radio
          label
            input(type='radio', name='new-group-privacy', value='private', v-model='newGroup.privacy')
            | {{ $t('inviteOnly') }}

      // @TODO Does it cost gems for a group plan?
        .form-group
        input.btn.btn-default(type='submit', :disabled='!newGroup.privacy && !newGroup.name', :value="$t('create')")
        span.gem-cost {{ '4 ' + $t('gems') }}
        p
          small {{ $t('gemCost') }}

      .form-group
        .checkbox
          label
            input(type='checkbox', v-model='newGroup.leaderOnly.challenges')
            | {{ $t('leaderOnlyChallenges') }}
      .form-group(v-if='type === "party"')
        button.btn.btn-default.form-control(@click='createGroup()', :value="$t('create')")
      .form-group
        button.btn.btn-primary.btn-lg.btn-block(@click="createGroup()", :disabled="!newGroupIsReady") {{ $t('create') }}
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
      height: 200px;

      .dollar {
        margin-left: 1.2em;
      }

      .number {
        font-size: 60px;
      }

      .name {
        width: 120px;
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
</style>

<script>
import paymentsMixin from '../../mixins/payments';
import amazonPaymentsModal from '../payments/amazonModal';
import { mapState } from 'client/libs/store';
import bModal from 'bootstrap-vue/lib/components/modal';

export default {
  mixins: [paymentsMixin],
  components: {
    amazonPaymentsModal,
    bModal,
  },
  data () {
    return {
      StripeCheckout: {},
      amazonPayments: {},
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
    // @TODO: have to handle this better because sub pages have hidden header
    // @TODO: I think we can remove this
    // this.$store.state.hideHeader = true;

    // @TODO: can this be in a mixin?
    this.StripeCheckout = window.StripeCheckout;
  },
  destroyed () {
    // @TODO: going from the page back to party modal does not show
    // this.$store.state.hideHeader = false;
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
      this.$root.$emit('show::modal', 'group-plan-modal');
    },
    changePage (page) {
      this.activePage = page;
      window.scrollTo(0, 0);
    },
    createGroup () {
      this.changePage(this.PAGES.PAY);
    },
    pay (paymentMethod) {
      this.paymentMethod = paymentMethod;
      let subscriptionKey = 'group_monthly'; // @TODO: Get from content API?
      if (this.paymentMethod === this.PAYMENTS.STRIPE) {
        this.showStripe({
          subscription: subscriptionKey,
          coupon: null,
          groupToCreate: this.newGroup,
        });
      } else if (this.paymentMethod === this.PAYMENTS.AMAZON) {
        this.amazonPaymentsInit({
          type: 'subscription',
          subscription: subscriptionKey,
          coupon: null,
          groupToCreate: this.newGroup,
        });
      }
    },
  },
};
</script>
