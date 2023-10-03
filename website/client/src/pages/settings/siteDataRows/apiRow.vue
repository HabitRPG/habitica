<template>
  <fragment>
    <tr
      v-if="!mixinData.inlineSettingMixin.modalVisible"
    >
      <td class="settings-label">
        {{ $t("APITokenTitle") }}
      </td>
      <td class="settings-value">
      </td>
      <td class="settings-button">
        <a
          class="edit-link"
          @click.prevent="openModal()"
        >
          {{ $t('learnMore') }}
        </a>
      </td>
    </tr>
    <tr
      v-if="mixinData.inlineSettingMixin.modalVisible"
      class="expanded"
    >
      <td colspan="3">
        <div
          v-once
          class="dialog-title"
        >
          {{ $t("APITokenTitle") }}
        </div>
        <div
          v-once
          class="dialog-disclaimer"
          v-html="$t('APITokenDisclaimer')"
        >
        </div>

        <div class="d-flex justify-content-center api-key-input">
          <locked-input
            :label="$t('APITokenTitle')"
            :value="apiToken"
            :notification-text="$t('APICopied')"
          />
        </div>
        <save-cancel-buttons
          :hide-save="true"
          @cancelClicked="requestCloseModal()"
        />
      </td>
    </tr>
  </fragment>
</template>

<style lang="scss" scoped>
@import '~@/assets/scss/colors.scss';

.api-key-input {
  margin-top: 20px;
  margin-bottom: 0;

  td {
    border: 0;
    padding: 0 !important;

    &:first-of-type {
      text-align: end;
      vertical-align: middle;
      padding-right: 1rem !important;

      font-weight: bold;
      line-height: 1.71;
      color: $gray-50;
    }
  }

  ::v-deep {
    .dropdown-menu {
      min-width: 0;
    }

    .form-group {
      margin-bottom: 0;
    }
  }
}
</style>

<script>
import { mapState } from '@/libs/store';

import { InlineSettingMixin } from '../components/inlineSettingMixin';
import SaveCancelButtons from '@/pages/settings/components/saveCancelButtons.vue';
import LockedInput from '@/pages/settings/components/lockedInput.vue';

export default {
  components: { LockedInput, SaveCancelButtons },
  mixins: [InlineSettingMixin],
  data () {
    return {};
  },
  mounted () {
    window.addEventListener('message', this.receiveMessage, false);
  },
  destroy () {
    window.removeEventListener('message', this.receiveMessage);
  },
  computed: {
    ...mapState({
      user: 'user.data',
      credentials: 'credentials',
    }),
    apiToken () {
      return this.credentials.API_TOKEN;
    },
  },

  methods: {
    receiveMessage (eventFrom) {
      if (eventFrom.origin !== 'https://www.spritely.app') {
        return;
      }

      const creds = {
        userId: this.user._id,
        apiToken: this.credentials.API_TOKEN,
      };
      eventFrom.source.postMessage(creds, eventFrom.origin);
    },
  },
};
</script>
