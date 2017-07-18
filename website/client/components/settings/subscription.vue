<template lang="pug">
  .container-fluid(ng-init='_subscription={key:"basic_earned"}')
    h3 {{ $t('benefits') }}
    .row
      .col-md-6
        // @TODO: +subPerks()

      .col-md-6
        table.table.alert.alert-info(ng-if='hasSubscription(user)')
          tr(ng-if='hasCanceledSubscription(user)'): td.alert.alert-warning
            span.noninteractive-button.btn-danger {{ $t('canceledSubscription') }}
            i.glyphicon.glyphicon-time
            |  {{ $t('subCanceled') }}
            strong {{user.purchased.plan.dateTerminated | date:user.preferences.dateFormat}}
          tr(ng-if='!hasCanceledSubscription(user)'): td
            h4 {{ $t('subscribed') }}
            p(ng-if='hasPlan(user) && !hasGroupPlan(user)') {{ $t('purchasedPlanId', {purchasedPlanIdInfo}) }}
            p(ng-if='hasGroupPlan(user)') {{ $t('youHaveGroupPlan') }}
          tr(ng-if='user.purchased.plan.extraMonths'): td
            span.glyphicon.glyphicon-credit-card
            | &nbsp; {{ $t('purchasedPlanExtraMonths', {purchasedPlanExtraMonthsDetails}) }}
          tr(ng-if='hasConsecutiveSubscription(user)'): td
            span.glyphicon.glyphicon-forward
            | &nbsp; {{ $t('consecutiveSubscription') }}
            ul.list-unstyled
              li {{ $t('consecutiveMonths') }} {{user.purchased.plan.consecutive.count + user.purchased.plan.consecutive.offset}}
              li {{ $t('gemCapExtra') }}} {{user.purchased.plan.consecutive.gemCapExtra}}
              li {{ $t('mysticHourglasses') }} {{user.purchased.plan.consecutive.trinkets}}

        div(ng-if='!hasSubscription(user) || hasCanceledSubscription(user)')
          h4(ng-if='hasCanceledSubscription(user)') {{ $t("resubscribe") }}
          .form-group.reduce-top-margin
            .radio(ng-repeat='block in Content.subscriptionBlocks | toArray | omit: "discount==true" | orderBy:"months"', ng-if="block.target !== 'group' && block.canSubscribe === true")
              label
                input(type="radio", name="subRadio", ng-value="block.key", ng-model='_subscription.key')
                span(ng-show='block.original')
                  span.label.label-success.line-through
                    | ${{block.original }}
                  | {{ $t('subscriptionRateText', {price: block.price, months: block.months}) }}
                span(ng-hide='block.original')
                  | {{ $t('subscriptionRateText', {price: block.price, months: block.months}) }}

          .form-inline
            .form-group
              input.form-control(type='text', ng-model='_subscription.coupon', placeholder {{ $t('couponPlaceholder') }})
            .form-group
              button.pull-right.btn.btn-small(type='button',ng-click='applyCoupon(_subscription.coupon)') {{ $t("apply") }}

        div(ng-if='hasSubscription(user)')
          .btn.btn-primary(ng-if='canEditCardDetails(user)', ng-click='Payments.showStripeEdit()') {{ $t('subUpdateCard') }}
          .btn.btn-sm.btn-danger(ng-if='canCancelSubscription(user)', ng-click='Payments.cancelSubscription()') {{ $t('cancelSub') }}
          small(ng-if='!canCancelSubscription(user)', ng-bind-html='getCancelSubInfo(user)')

        .container-fluid.slight-vertical-padding(ng-if='!hasSubscription(user) || hasCanceledSubscription(user)')
          small.muted {{ $t('subscribeUsing') }}
          .row.text-center
            .col-md-4
              a.purchase.btn.btn-primary(ng-click='Payments.showStripe({subscription:_subscription.key, coupon:_subscription.coupon})', ng-disabled='!_subscription.key') {{ $t('card') }}
            .col-md-4
              a.purchase(:href='paypalPurchaseLink', ng-disabled='!_subscription.key')
                img(src='https://www.paypalobjects.com/webstatic/en_US/i/buttons/pp-acceptance-small.png',alt {{ $t('paypal') }})
            .col-md-4
              a.purchase(ng-click="Payments.amazonPayments.init({type: 'subscription', subscription:_subscription.key, coupon:_subscription.coupon})")
                img(src='https://payments.amazon.com/gp/cba/button',alt {{ $t('amazonPayments') }})

    h3 {{ $t('giftSubscription') }}
    .row
      .col-lg-12
        ol
          li {{ $t('giftSubscriptionText1') }}
          li {{ $t('giftSubscriptionText2') }}
          li {{ $t('giftSubscriptionText3') }}
        h4 {{ $t('giftSubscriptionText4') }}
</template>

<script>
export default {
  data () {
    return {
      paypalPurchaseLink: '/paypal/subscribe?_id={{user._id}}&apiToken={{User.settings.auth.apiToken}}&sub={{_subscription.key}}{{_subscription.coupon ? "&coupon="+_subscription.coupon : ""}}',
      purchasedPlanExtraMonthsDetails: {
        months: '{{user.purchased.plan.extraMonths | number:2}',
      },
      purchasedPlanIdInfo: {
        price: 'Content.subscriptionBlocks[user.purchased.plan.planId].price',
        months: 'Content.subscriptionBlocks[user.purchased.plan.planId].months',
        plan: 'user.purchased.plan.paymentMethod',
      },
    };
  },
};
</script>
