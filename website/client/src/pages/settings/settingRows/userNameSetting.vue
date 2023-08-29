<template>
  <fragment>
    <tr
      v-if="!mixinData.inlineSettingMixin.modalVisible"
    >
      <td class="settings-label">
        {{ $t("username") }}
      </td>
      <td class="settings-value">
        {{ user?.auth?.local?.username }}
      </td>
      <td class="settings-button">
        <a
          class="edit-link"
          @click.prevent="openModal()"
        >
          {{ $t(user?.auth?.local?.username ? 'edit' : 'add') }}
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
          {{ $t("username") }}
        </div>
        <div
          v-once
          class="dialog-disclaimer"
        >
          {{ $t("changeUsernameDisclaimer") }}
        </div>

        <div class="input-area">
          <validated-text-input
            v-model="inputValue"
            settings-label="username"
            :is-valid="usernameValid"
            :invalid-issues="usernameIssues"
            @update:value="valuesChanged()"
            @blur="restoreEmptyUsername()"
          />

          <save-cancel-buttons
            :disable-save="usernameCannotSubmit"
            @saveClicked="changeUser('username', cleanedInputValue)"
            @cancelClicked="requestCloseModal()"
          />
        </div>
      </td>
    </tr>
  </fragment>
</template>

<style lang="scss" scoped>
@import '~@/assets/scss/colors.scss';

</style>

<script>
import axios from 'axios';
import debounce from 'lodash/debounce';
import { mapState } from '@/libs/store';

import { InlineSettingMixin } from '../components/inlineSettingMixin';
import SaveCancelButtons from '../components/saveCancelButtons.vue';
import ValidatedTextInput from '@/components/ui/validatedTextInput.vue';
import { NotificationMixins } from '@/mixins/notifications';

// TODO extract usernameIssues/checks to a mixin to share between this and the authForm

export default {
  components: { ValidatedTextInput, SaveCancelButtons },
  mixins: [InlineSettingMixin, NotificationMixins],
  data () {
    return {
      inputValue: '',
      inputChanged: false,
      usernameIssues: [],
    };
  },
  computed: {
    ...mapState({
      user: 'user.data',
    }),
    cleanedInputValue () {
      return this.inputValue.startsWith('@')
        // remove the @ from the value, only if its starting with
        ? this.inputValue.replace('@', '')
        // not removing it creates an error that is displayed
        : this.inputValue;
    },
    usernameValid () {
      if (this.cleanedInputValue.length <= 1) {
        return false;
      }

      return this.usernameIssues.length === 0;
    },

    usernameCannotSubmit () {
      if (this.cleanedInputValue.length <= 1) {
        return true;
      }
      return !this.usernameValid || !this.inputChanged;
    },
  },
  watch: {
    inputValue () {
      this.validateUsername(this.cleanedInputValue);
    },
  },
  mounted () {
    this.resetControls();
  },
  methods: {
    /**
     * is a callback from the {InlineSettingMixin}
     * do not remove
     */
    resetControls () {
      this.inputValue = `@${this.user.auth.local.username}`;
    },
    restoreEmptyUsername () {
      if (this.inputValue.length < 1) {
        this.resetControls();
      }
    },
    async changeUser (attribute, newUsername) {
      await axios.put(`/api/v4/user/auth/update-${attribute}`, {
        username: newUsername,
      });

      this.user.auth.local.username = newUsername;
      this.user.flags.verifiedUsername = true;

      this.text(this.$t('userNameSuccess'));

      this.closeModal();
    },
    valuesChanged () {
      this.inputChanged = true;

      this.modalValuesChanged();
    },
    validateUsername: debounce(async function checkName (username) {
      if (username.length <= 1 || username === this.user.auth.local.username) {
        this.usernameIssues = [];
        return;
      }

      const res = await this.$store.dispatch('auth:verifyUsername', {
        username,
      });

      if (res.issues !== undefined) {
        this.usernameIssues = res.issues;
      } else {
        this.usernameIssues = [];
      }
    }, 500),
  },
};
</script>
