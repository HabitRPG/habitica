<template lang="pug">
.standard-page
  div(v-if='activePage === PAGES.CREATE_GROUP')
    h2.text-center {{ $t('createAGroup') }}

    .col-xs-12
      .col-md-12.form-horizontal
        .form-group
          label.control-label(for='new-group-name') {{ $t('newGroupName', {groupType: 'text'}) }}
          input.form-control#new-group-name.input-medium.option-content(required, type='text', :placeholder="$t('newGroupName', {groupType: 'text'})", v-model='newGroup.name')
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
          br
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
    br
    br
    .row
      .col-sm-6.col-sm-offset-3
        a.btn.btn-primary.btn-lg.btn-block(@click="createGroup()", :disabled="!newGroupIsReady") {{ $t('create') }}

  div(v-if='activePage === PAGES.UPGRADE_GROUP')
    h2.text-center {{ $t('upgradeTitle') }}

    .row.text-center
      .col-6.col-offset-3
        a.purchase.btn.btn-primary(@click='upgradeGroup(PAYMENTS.STRIPE)') {{ $t('card') }}
        a.purchase(@click='upgradeGroup(PAYMENTS.AMAZON)')
          img(src='https://payments.amazon.com/gp/cba/button', :alt="$t('amazonPayments')")
        // @TODO: Add paypal
    .row
      .col-md-6.col-md-offset-3
        br
        .text-center {{ $t('groupSubscriptionPrice') }}

  div(v-if='activePage === PAGES.BENEFITS')
    h2.text-center {{ $t('groupBenefitsTitle') }}
      .row(style="font-size: 2rem;")
        .col-md-6.col-md-offset-3.text-center {{ $t('groupBenefitsDescription') }}
      .row.row-margin
        .col-md-4
          h2 {{ $t('teamBasedTasks') }}
          div
            // shared tasks
            h3
              span.glyphicon.glyphicon-ok-circle(style='margin-right: 1.5rem;')
              | {{ $t('groupBenefitOneTitle') }}
            span {{ $t('groupBenefitOneDescription') }}
          div
            // assign tasks
            h3
              span.glyphicon.glyphicon-ok-circle(style='margin-right: 1.5rem;')
              | {{ $t('groupBenefitTwoTitle') }}
            span {{ $t('groupBenefitTwoDescription') }}
          div
            // claim tasks
            h3
              span.glyphicon.glyphicon-ok-circle(style='margin-right: 1.5rem;')
              | {{ $t('groupBenefitThreeTitle') }}
            span {{ $t('groupBenefitThreeDescription') }}
          div
            // mark tasks
            h3
              span.glyphicon.glyphicon-ok-circle(style='margin-right: 1.5rem;')
              | {{ $t('groupBenefitFourTitle') }}
            span {{ $t('groupBenefitFourDescription') }}
          div
            // group managers
            h3
              span.glyphicon.glyphicon-ok-circle(style='margin-right: 1.5rem;')
              | {{ $t('groupBenefitEightTitle') }}
            span {{ $t('groupBenefitEightDescription') }}

        .col-md-4
          h2 {{ $t('specializedCommunication') }}
          div
            // chat privately
            h3
              span.glyphicon.glyphicon-ok-circle(style='margin-right: 1.5rem;')
              | {{ $t('groupBenefitFiveTitle') }}
            span {{ $t('groupBenefitFiveDescription') }}
          div
            h3
              span.glyphicon.glyphicon-ok-circle(style='margin-right: 1.5rem;')
              | {{ $t('groupBenefitMessageLimitTitle') }}
            span {{ $t('groupBenefitMessageLimitDescription') }}
        .col-md-4
          h2 {{ $t('funExtras') }}
          div
            // free subscription
            h3
              span.glyphicon.glyphicon-ok-circle(style='margin-right: 1.5rem;')
              | {{ $t('groupBenefitSixTitle') }}
            span {{ $t('groupBenefitSixDescription') }}
          div
            // exclusive mount
            h3
              span.glyphicon.glyphicon-ok-circle(style='margin-right: 1.5rem;')
              | {{ $t('groupBenefitSevenTitle') }}

          br
          br
          .row
            .col-sm-6.col-sm-offset-3
              a.btn.btn-primary.btn-lg.btn-block(ui-sref="options.social.newGroup") {{ $t('createAGroup') }}

          .row
            .col-md-6.col-md-offset-3
              br
              .text-center {{ $t('groupSubscriptionPrice') }}
</template>

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
    this.activePage = this.PAGES.CREATE_GROUP;
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
    createGroup () {
      this.changePage(this.PAGES.UPGRADE_GROUP);
    },
    upgradeGroup (paymentType) {
      //  let subscriptionKey = 'group_monthly'; // @TODO: Get from content API?
      if (paymentType === this.PAYMENTS.STRIPE) {
        // Payments.showStripe({
        //   subscription: subscriptionKey,
        //   coupon: null,
        //   groupToCreate: this.newGroup
        // });
      } else if (paymentType === this.PAYMENTS.AMAZON) {
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
