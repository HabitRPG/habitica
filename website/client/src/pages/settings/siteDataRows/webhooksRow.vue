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
      :class="{'webhooks-exists': Boolean(webhooks.length)}"
    >
      <table class="table table-striped">
        <tr v-if="webhooks.length">
          <th>{{ $t('webhookURL') }}</th>
          <th>{{ $t('enabled') }}</th>
          <th></th>
        </tr>

        <tr
          v-for="(webhook, index) in webhooks"
          :key="webhook.id"
        >
          <td style="width: 588px">
            <div class="d-flex align-items-center">
              <div style="width: 440px">
                <validated-text-input
                  v-model="webhook.url"
                  :placeholder="$t('webhookURL')"
                  :is-valid="isValidUrl(webhook.url)"
                  :readonly="!unsaved.includes(index)"
                />
              </div>
              <template v-if="unsaved.includes(index)">
                <button
                  class="btn btn-primary ml-2"
                  :disabled="!isValidUrl(webhook.url)"
                  @click="saveWebhook(webhook, index)"
                >
                  Save
                </button>
                <a
                  class="edit-link ml-3"
                  @click.prevent="cancelWebhookChanges(webhook, index)"
                >
                  {{ $t('cancel') }}
                </a>
              </template>
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
                class="selectListItem"
                @click="editWebhook(webhook, index)"
              >
                <span class="with-icon">
                  <span
                    v-once
                    class="svg-icon icon-16 color"
                    v-html="icons.editIcon"
                  ></span>
                  <span v-once>
                    {{ $t('edit') }}
                  </span>
                </span>
              </b-dropdown-item>
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
            :class="{'webhooks-empty': !Boolean(webhooks.length)}"
          >
            <button
              class="btn btn-secondary d-flex align-items-center new-webhook-btn"
              :class="{'webhooks-exists': Boolean(webhooks.length)}"
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

      line-height: 1.71;
      color: $gray-50;
    }

    &:not(:first-of-type) {
      padding-right: 0 !important;
      padding-left: 0 !important;
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
import isURL from 'validator/es/lib/isURL';
import uuid from '@/../../common/script/libs/uuid';
import { mapState } from '@/libs/store';

import { InlineSettingMixin } from '../components/inlineSettingMixin';
import positiveIcon from '@/assets/svg/positive.svg';
import ToggleSwitch from '@/components/ui/toggleSwitch.vue';
import menuIcon from '@/assets/svg/menu.svg';
import deleteIcon from '@/assets/svg/delete.svg';
import ValidatedTextInput from '@/components/ui/validatedTextInput.vue';
import editIcon from '@/assets/svg/edit.svg';

export default {
  components: { ValidatedTextInput, ToggleSwitch },
  mixins: [InlineSettingMixin],
  data () {
    return {
      icons: Object.freeze({
        positive: positiveIcon,
        menuIcon,
        deleteIcon,
        editIcon,
      }),
      webhooks: [], // view copy of state
      unsaved: [],
    };
  },
  mounted () {
    this.setWebhooksViewCopy();
  },
  computed: {
    ...mapState({
      user: 'user.data',
      credentials: 'credentials',
    }),

  },
  methods: {
    isValidUrl (url) {
      return isURL(url, {
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
        this.webhooks.push(webhookInfo) - 1,
      );
    },
    cancelWebhookChanges (webhook, index) {
      if (this.unsaved.includes(index)) {
        this.unsaved = this.unsaved.filter(i => i !== index);
      }

      if (this.user.webhooks[index]) {
        this.webhooks[index] = this.user.webhooks[index];
      } else {
        this.webhooks.splice(index, 1);
      }
    },
    async saveWebhook (webhook, index) {
      if (!this.isValidUrl(webhook.url)) {
        return;
      }

      const webhookId = webhook.id;

      if (this.user.webhooks.every(w => w.id !== webhookId)) {
        const createdWebhook = await this.$store.dispatch('user:addWebhook', { webhook });

        this.user.webhooks[index] = createdWebhook;
      } else {
        const updatedWebhook = await this.$store.dispatch('user:updateWebhook', { webhook });
        this.user.webhooks[index] = updatedWebhook;
      }
      this.cancelWebhookChanges(webhook, index);
    },
    async updateWebhookEnabled (webhook, index) {
      if (this.unsaved.includes(index)) {
        return;
      }

      const updatedWebhook = await this.$store.dispatch('user:updateWebhook', { webhook });
      this.user.webhooks[index] = updatedWebhook;
    },
    async editWebhook (webhook, index) {
      this.unsaved.push(index);
    },
    async deleteWebhook (webhook, index) {
      await this.$store.dispatch('user:deleteWebhook', { webhook });
      this.user.webhooks.splice(index, 1);
      this.setWebhooksViewCopy();
    },
    setWebhooksViewCopy () {
      this.webhooks = [...this.user.webhooks];
    },
  },
};
</script>
