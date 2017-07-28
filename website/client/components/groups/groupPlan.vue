<template lang="pug">
div
  div(v-if='activePage === PAGES.BENEFITS')
    .header
      h1.text-center Need more for your Group?
      .row
        .col-6.offset-3.text-center {{ $t('groupBenefitsDescription') }}
    .container.benefits
      .row
        .col-4
          .box
            h2 {{ $t('teamBasedTasks') }}
            p Set up an easily-viewed shared task list for the group. Assign tasks to your fellow group members, or let them claim their own tasks to make it clear what everyone is working on!

        .col-4
          .box
            h2 Group Management Controls
            p Use task approvals to verify that a task that was really completed, add Group Managers to share responsibilities, and enjoy a private group chat for all team members.

        .col-4
          .box
            h2 In-Game Benefits
            p Group members get an exclusive Jackalope Mount, as well as full subscription benefits, including special monthly equipment sets and the ability to buy gems with gold.

    .container.payment-options
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

          .box
            h3 Choose your payment method
            .box.payment-button(@click='createGroup(PAYMENTS.STRIPE)')
              p Credit Card
              p Powered by Stripe
            .box.payment-button(@click='createGroup(PAYMENTS.AMAZON)')
              | Amazon Pay

  .standard-page(v-if='activePage === PAGES.CREATE_GROUP')
    h1.text-center {{ $t('createAGroup') }}
    .col-6.offset-3
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
        input.btn.btn-default.form-control(type='submit', :value="$t('create')")
      .form-group
        button.btn.btn-primary.btn-lg.btn-block(@click="upgrade()", :disabled="!newGroupIsReady") {{ $t('create') }}
</template>

<style lang="scss" scoped>
  .header {
    margin-bottom: 3em;
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
  }

  .box {
    border-radius: 2px;
    background-color: #ffffff;
    box-shadow: 0 2px 2px 0 rgba(26, 24, 29, 0.16), 0 1px 4px 0 rgba(26, 24, 29, 0.12);
    padding: 2em;
    text-align: center;
  }

  .purple-header {
    color: #6133b4;
    font-size: 48px;
    margin-top: 1em;
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

    .payment-button {
      width: 200px;
      height: 80px;
      margin-bottom: .5em;
      padding: .5em;
      display: block;
    }
  }
</style>

<script>
export default {
  data () {
    return {
      PAGES: {
        CREATE_GROUP: 'create-group',
        UPGRADE_GROUP: 'upgrade-group',
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
  },
  methods: {
    changePage (page) {
      this.activePage = page;
      window.scrollTo(0, 0);
    },
    createGroup (paymentType) {
      this.paymentMethod = paymentType;
      this.changePage(this.PAGES.CREATE_GROUP);
    },
    upgrade () {
      //  let subscriptionKey = 'group_monthly'; // @TODO: Get from content API?
      if (this.paymentMethod === this.PAYMENTS.STRIPE) {
        // Payments.showStripe({
        //   subscription: subscriptionKey,
        //   coupon: null,
        //   groupToCreate: this.newGroup
        // });
      } else if (this.paymentMethod === this.PAYMENTS.AMAZON) {
        // Payments.amazonPayments.init({
        //   type: 'subscription',
        //   subscription: subscriptionKey,
        //   coupon: null,
        //   groupToCreate: this.newGroup
        // });
      }
    },
  },
};
</script>
