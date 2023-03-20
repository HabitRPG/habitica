<template>
  <div>
    <h2
      v-once
    >
      {{ $t("webhooks") }}
    </h2>
    <div
      v-once
      class="webhooks-info mb-3"
      v-html="$t('webhooksInfo')"
    >
    </div>

    <div
      class="d-flex justify-content-center webhooks-list"
      :class="{'webhooks-exists': Boolean(user.webhooks.length)}"
    >
      <table class="table table-striped">
        <tr v-if="user.webhooks.length">
          <th>{{ $t('webhookURL') }}</th>
          <th>{{ $t('enabled') }}</th>
          <th></th>
        </tr>

        <tr
          v-for="(webhook, index) in user.webhooks"
          :key="webhook.id"
        >
          <td style="width: 90%">
            <div style="width: 440px">
              <validated-text-input
                v-model="webhook.url"
                placeholder="https://habitica-integrations.com/habitica-changes/"
                :is-valid="isValidUrl(webhook.url)"
                @blur="saveWebhook(webhook, index)"
              />
            </div>
          </td>
          <td style="vertical-align: middle;">
            <toggle-switch
              v-if="!unsaved.includes(index)"
              v-model="webhook.enabled"
              @change="updateWebhookEnabled(webhook, index)"
            />
          </td>
          <td class="menu-column">
            <b-dropdown
              v-if="!unsaved.includes(index)"
              right="right"
              toggle-class="with-icon"
              class="ml-2"
              :no-caret="true"
            >
              <template #button-content>
                <span
                  v-once
                  class="svg-icon inline menuIcon"
                  v-html="icons.menuIcon"
                >
                </span>
              </template>
              <b-dropdown-item
                class="selectListItem custom-hover--delete"
                @click="deleteWebhook(webhook, index)"
              >
                <span class="with-icon">
                  <span
                    v-once
                    class="svg-icon icon-16 color"
                    v-html="icons.deleteIcon"
                  ></span>
                  <span v-once>
                    {{ $t('delete') }}
                  </span>
                </span>
              </b-dropdown-item>
            </b-dropdown>
          </td>
        </tr>
        <tr>
          <td
            colspan="3"
            :class="{'webhooks-empty': !Boolean(user.webhooks.length)}"
          >
            <button
              class="btn btn-secondary d-flex align-items-center new-webhook-btn"
              :class="{'webhooks-exists': Boolean(user.webhooks.length)}"
              tabindex="0"
              @click="newUnsavedWebhook()"
            >
              <div
                class="svg-icon icon-10 color"
                v-html="icons.positive"
              ></div>
              <div class="ml-75 mr-1">
                {{ $t('addWebhook') }}
              </div>
            </button>
          </td>
        </tr>
      </table>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import '~@/assets/scss/colors.scss';

.webhooks-info {
  line-height: 1.71;
  color: $gray-50;
}

.svg-icon.icon-10 {
  color: $green-10;
}

.menuIcon {
  width: 4px;
  height: 1rem;
  object-fit: contain;
}

.custom-hover--delete {
  --hover-color: #{$maroon-50};
  --hover-background: #ffb6b83F;
}

.webhooks-list {
  margin-bottom: 0.5rem;

  tr:first-of-type {
    th {
      padding: 0.25rem;
      border-top: 0;
    }
  }

  td {
    padding: 0.5rem !important;

    &:first-of-type {
      text-align: end;
      vertical-align: middle;
      padding-right: 1rem !important;

      font-weight: bold;
      line-height: 1.71;
      color: $gray-50;
    }
  }
}

td.webhooks-empty {
  border-top-color: transparent;
}

td.menu-column {
  width: 2rem;
  padding-left: 0 !important;
  padding-right: 0 !important;
}

.new-webhook-btn:not(.webhooks-exists) {
  margin: 0 auto;
}

table {
  margin-bottom: 0 !important;
}
</style>

<script>
import * as validator from 'validator';
import { mapState } from '@/libs/store';

import { InlineSettingMixin } from '../components/inlineSettingMixin';
import uuid from '../../../../../common/script/libs/uuid';
import positiveIcon from '@/assets/svg/positive.svg';
import ToggleSwitch from '@/components/ui/toggleSwitch.vue';
import menuIcon from '@/assets/svg/menu.svg';
import deleteIcon from '@/assets/svg/delete.svg';
import ValidatedTextInput from '@/components/ui/validatedTextInput.vue';

export default {
  components: { ValidatedTextInput, ToggleSwitch },
  mixins: [InlineSettingMixin],
  data () {
    return {
      icons: Object.freeze({
        positive: positiveIcon,
        menuIcon,
        deleteIcon,
      }),
      unsaved: [],
    };
  },
  computed: {
    ...mapState({
      user: 'user.data',
      credentials: 'credentials',
    }),

  },

  methods: {
    isValidUrl (url) {
      return validator.isURL(url, {
        require_tld: true,
        require_protocol: true,
        protocols: ['http', 'https'],
      });
    },
    async newUnsavedWebhook () {
      const webhookInfo = {
        id: uuid(),
        type: 'taskActivity',
        options: {
          created: false,
          updated: false,
          deleted: false,
          scored: true,
        },
        url: '',
        enabled: true,
      };

      this.unsaved.push(
        this.user.webhooks.push(webhookInfo) - 1,
      );
    },
    async saveWebhook (webhook, index) {
      if (!this.isValidUrl(webhook.url)) {
        return;
      }

      if (this.unsaved.includes(index)) {
        const createdWebhook = await this.$store.dispatch('user:addWebhook', { webhook });

        this.user.webhooks[index] = createdWebhook;
        this.unsaved = this.unsaved.filter(u => u !== index);
      } else {
        const updatedWebhook = await this.$store.dispatch('user:updateWebhook', { webhook });
        this.user.webhooks[index] = updatedWebhook;
      }
    },
    async updateWebhookEnabled (webhook, index) {
      if (this.unsaved.includes(index)) {
        return;
      }

      const updatedWebhook = await this.$store.dispatch('user:updateWebhook', { webhook });
      this.user.webhooks[index] = updatedWebhook;
    },
    async deleteWebhook (webhook, index) {
      await this.$store.dispatch('user:deleteWebhook', { webhook });
      this.user.webhooks.splice(index, 1);
    },
  },
};
</script>
