<template lang="pug">
.row
  .col-md-6
    h2 {{ $t('API') }}
    small {{ $t('APIText') }}
    h6 {{ $t('userId') }}
    pre.prettyprint {{user.id}}
    h6 {{ $t('APIToken') }}
    pre.prettyprint {{User.settings.auth.apiToken}}
    small {{ $t("APITokenWarning", { hrefTechAssistanceEmail }) }}
    br
    h3 {{ $t('thirdPartyApps') }}
    ul
      li
        a(target='_blank' href='https://www.beeminder.com/habitica') {{ $t('beeminder') }}
        br
        | {{ $t('beeminderDesc') }}
      li
        a(target='_blank' href='https://chrome.google.com/webstore/detail/habitrpg-chat-client/hidkdfgonpoaiannijofifhjidbnilbb') {{ $t('chromeChatExtension') }}
        br
        | {{ $t('chromeChatExtensionDesc') }}
      li
        a(target='_blank' :href='`http://data.habitrpg.com?uuid= + user._id`') {{ $t('dataTool') }}
        br
        | {{ $t('dataToolDesc') }}
      li
        | {{ $t('otherExtensions') }}
        br
        | {{ $t('otherDesc') }}

    hr

    h2 {{ $t('webhooks') }}
    table.table.table-striped
      thead(ng-if='user.webhooks.length')
        tr
          th {{ $t('enabled') }}
          th {{ $t('webhookURL') }}
          th
      tbody
        tr(ng-repeat="webhook in user.webhooks track by $index")
          td
            input(type='checkbox', ng-model='webhook.enabled', ng-change='saveWebhook(webhook, $index)')
          td
            input.form-control(type='url', ng-model='webhook.url', ng-change='webhook._editing=true', ui-keyup="{13:'saveWebhook(webhook, $index)'}")
          td
            span.pull-left(ng-show='webhook._editing') *
            a.checklist-icons(ng-click='deleteWebhook(webhook, $index)')
              span.glyphicon.glyphicon-trash(tooltip {{ $t('delete') }})
        tr
          td(colspan=2)
            form.form-horizontal(ng-submit='addWebhook(_newWebhook.url)')
              .form-group.col-sm-10
                input.form-control(type='url', ng-model='_newWebhook.url', placeholder {{ $t('webhookURL') }})
              .col-sm-2
                button.btn.btn-sm.btn-primary(type='submit') {{ $t('add') }}
</template>

<script>

// @TODO: env.EMAILS.TECH_ASSISTANCE_EMAIL
const TECH_ASSISTANCE_EMAIL = 'admin@habitica.com';

export default {
  data () {
    hrefTechAssistanceEmail:  '<a href="mailto:' + TECH_ASSISTANCE_EMAIL + '">' + TECH_ASSISTANCE_EMAIL + '</a>'
  },
};
</script>
