<template lang="pug">
.row.standard-page
  .col-6
    h2 {{ $t('API') }}
    p {{ $t('APIText') }}

    .section
      h6 {{ $t('userId') }}
      pre.prettyprint {{user.id}}
      h6 {{ $t('APIToken') }}
      .d-flex.align-items-center.mb-3
        button.btn.btn-secondary(
          @click="showApiToken = !showApiToken"
        ) {{ $t(`${showApiToken ? 'hide' : 'show'}APIToken`) }}
        pre.prettyprint.ml-4.mb-0(v-if="showApiToken") {{apiToken}}
      p(v-html='$t("APITokenWarning", { hrefTechAssistanceEmail })')

    .section
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
          a(target='_blank' :href='`https://oldgods.net/habitica/habitrpg_user_data_display.html?uuid=` + user._id') {{ $t('dataTool') }}
          br
          | {{ $t('dataToolDesc') }}
        li(v-html="$t('otherExtensions')")
          br
          | {{ $t('otherDesc') }}

      hr

  .col-6
    h2 {{ $t('webhooks') }}
    table.table.table-striped
      thead(v-if='user.webhooks.length')
        tr
          th {{ $t('enabled') }}
          th {{ $t('webhookURL') }}
          th
      tbody
        tr(v-for="(webhook, index) in user.webhooks")
          td
            input(type='checkbox', v-model='webhook.enabled', @change='saveWebhook(webhook, index)')
          td
            input.form-control(type='url', v-model='webhook.url')
          td
            a.btn.btn-warning.checklist-icons(@click='deleteWebhook(webhook, index)')
              span.glyphicon.glyphicon-trash(:tooltip="$t('delete')") Delete
            a.btn.btn-success.checklist-icons(@click='saveWebhook(webhook, index)') Update
        tr
          td(colspan=2)
            .form-horizontal
              .form-group.col-sm-10
                input.form-control(type='url', v-model='newWebhook.url', :placeholder="$t('webhookURL')")
              .col-sm-2
                button.btn.btn-sm.btn-primary(type='submit', @click='addWebhook(newWebhook.url)') {{ $t('add') }}
</template>

<style scoped>
  .section {
    margin-top: 2em;
  }
</style>

<script>
import { mapState } from 'client/libs/store';
import uuid from '../../../common/script/libs/uuid';
// @TODO: env.EMAILS.TECH_ASSISTANCE_EMAIL
const TECH_ASSISTANCE_EMAIL = 'admin@habitica.com';

export default {
  data () {
    return {
      newWebhook: {
        url: '',
      },
      hrefTechAssistanceEmail: `<a href="mailto:${TECH_ASSISTANCE_EMAIL}">${TECH_ASSISTANCE_EMAIL}</a>`,
      showApiToken: false,
    };
  },
  computed: {
    ...mapState({user: 'user.data', credentials: 'credentials'}),
    apiToken () {
      return this.credentials.API_TOKEN;
    },
  },
  methods: {
    async addWebhook (url) {
      let webhookInfo = {
        id: uuid(),
        type: 'taskActivity',
        options: {
          created: false,
          updated: false,
          deleted: false,
          scored: true,
        },
        url,
        enabled: true,
      };

      let webhook = await this.$store.dispatch('user:addWebhook', {webhookInfo});
      this.user.webhooks.push(webhook);

      this.newWebhook.url = '';
    },
    async saveWebhook (webhook, index) {
      delete webhook._editing;
      let updatedWebhook = await this.$store.dispatch('user:updateWebhook', {webhook});
      this.user.webhooks[index] = updatedWebhook;
    },
    async deleteWebhook (webhook, index) {
      delete webhook._editing;
      await this.$store.dispatch('user:deleteWebhook', {webhook});
      this.user.webhooks.splice(index, 1);
    },
  },
};
</script>
