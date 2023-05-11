<template>
  <div class="row standard-page">
    <div class="col-6">
      <h2>{{ $t('API') }}</h2>
      <p>{{ $t('APIText') }}</p>
      <div class="section">
        <h6>{{ $t('userId') }}</h6>
        <pre class="prettyprint">{{ user.id }}</pre>
        <h6>{{ $t('APIToken') }}</h6>
        <div class="d-flex align-items-center mb-3">
          <button
            class="btn btn-secondary"
            @click="showApiToken = !showApiToken"
          >
            {{ $t(`${showApiToken ? 'hide' : 'show'}APIToken`) }}
          </button>
          <pre
            v-if="showApiToken"
            class="prettyprint ml-4 mb-0"
          >{{ apiToken }}</pre>
        </div>
        <p v-html="$t('APITokenWarning', { hrefTechAssistanceEmail })"></p>
      </div>
      <div class="section">
        <h3>{{ $t('thirdPartyApps') }}</h3>
        <p v-html="$t('thirdPartyTools')"></p>
        <hr>
      </div>
    </div>
    <div class="col-6">
      <h2>{{ $t('webhooks') }}</h2>
      <p v-html="$t('webhooksInfo')"></p>
      <table class="table table-striped">
        <thead v-if="user.webhooks.length">
          <tr>
            <th>{{ $t('enabled') }}</th>
            <th>{{ $t('webhookURL') }}</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(webhook, index) in user.webhooks"
            :key="webhook.id"
          >
            <td>
              <input
                v-model="webhook.enabled"
                type="checkbox"
                @change="saveWebhook(webhook, index)"
              >
            </td>
            <td>
              <input
                v-model="webhook.url"
                class="form-control"
                type="url"
              >
            </td>
            <td>
              <div
                class="btn btn-danger checklist-icons mr-2"
                @click="deleteWebhook(webhook, index)"
              >
                <span
                  class="glyphicon glyphicon-trash"
                  :tooltip="$t('delete')"
                > {{ $t('delete') }} </span>
              </div>
              <div
                class="btn btn-primary checklist-icons"
                @click="saveWebhook(webhook, index)"
              >
                {{ $t('subUpdateTitle') }}
              </div>
            </td>
          </tr>
          <tr>
            <td colspan="2">
              <div class="form-horizontal">
                <div class="form-group col-sm-10">
                  <input
                    v-model="newWebhook.url"
                    class="form-control"
                    type="url"
                    :placeholder="$t('webhookURL')"
                  >
                </div>
                <div class="col-sm-2">
                  <button
                    class="btn btn-sm btn-primary"
                    type="submit"
                    @click="addWebhook(newWebhook.url)"
                  >
                    {{ $t('add') }}
                  </button>
                </div>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
  .section {
    margin-top: 2em;
  }
  li span
  {
    display: block;
  }
</style>

<script>
import { mapState } from '@/libs/store';
import uuid from '@/../../common/script/libs/uuid';
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
    ...mapState({ user: 'user.data', credentials: 'credentials' }),
    apiToken () {
      return this.credentials.API_TOKEN;
    },
  },
  mounted () {
    this.$store.dispatch('common:setTitle', {
      section: this.$t('settings'),
      subSection: this.$t('API'),
    });
    window.addEventListener('message', this.receiveMessage, false);
  },
  destroy () {
    window.removeEventListener('message', this.receiveMessage);
  },
  methods: {
    receiveMessage (eventFrom) {
      if (eventFrom.origin !== 'https://www.spritely.app') return;

      const creds = {
        userId: this.user._id,
        apiToken: this.credentials.API_TOKEN,
      };
      eventFrom.source.postMessage(creds, eventFrom.origin);
    },
    async addWebhook (url) {
      const webhookInfo = {
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

      const webhook = await this.$store.dispatch('user:addWebhook', { webhookInfo });
      this.user.webhooks.push(webhook);

      this.newWebhook.url = '';
    },
    async saveWebhook (webhook, index) {
      delete webhook._editing;
      const updatedWebhook = await this.$store.dispatch('user:updateWebhook', { webhook });
      this.user.webhooks[index] = updatedWebhook;
    },
    async deleteWebhook (webhook, index) {
      delete webhook._editing;
      await this.$store.dispatch('user:deleteWebhook', { webhook });
      this.user.webhooks.splice(index, 1);
    },
  },
};
</script>
