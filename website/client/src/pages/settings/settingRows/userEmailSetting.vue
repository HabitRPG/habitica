<template>
  <fragment>
    <tr
      v-if="!mixinData.inlineSettingMixin.modalVisible"
    >
      <td class="settings-label">
        {{ $t("email") }}
      </td>
      <td class="settings-value">
        {{ user?.auth?.local?.email }}
      </td>
      <td class="settings-button">
        <a
          class="edit-link"
          @click.prevent="openModal()"
        >
          {{ $t('edit') }}
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
          {{ $t("email") }}
        </div>
        <div
          v-once
          class="dialog-disclaimer"
        >
          {{ $t("changeEmailDisclaimer") }}
        </div>

        <div class="input-area">
          <validated-text-input
            v-model="updates.newEmail"
            settings-label="email"
            :is-valid="validEmail"
            @update:value="modalValuesChanged"
            @blur="restoreEmptyEmail()"
          />

          <current-password-input
            :show-forget-password="true"
            :is-valid="mixinData.currentPasswordIssues.length === 0"
            :invalid-issues="mixinData.currentPasswordIssues"
            @passwordValue="updates.password = $event"
          />

          <save-cancel-buttons
            :disable-save="disallowedToSave"
            @saveClicked="changeEmail()"
            @cancelClicked="requestCloseModal()"
          />
        </div>
      </td>
    </tr>
  </fragment>
</template>

<style lang="scss" scoped>
</style>

<script>
import axios from 'axios';
import isEmail from 'validator/es/lib/isEmail';
import { mapState } from '@/libs/store';

import SaveCancelButtons from '../components/saveCancelButtons.vue';
import { InlineSettingMixin } from '../components/inlineSettingMixin';
import CurrentPasswordInput from '../components/currentPasswordInput.vue';
import ValidatedTextInput from '@/components/ui/validatedTextInput.vue';
import NotificationMixins from '@/mixins/notifications';
import { PasswordInputChecksMixin } from '@/mixins/passwordInputChecks';

export default {
  components: { ValidatedTextInput, CurrentPasswordInput, SaveCancelButtons },
  mixins: [InlineSettingMixin, NotificationMixins, PasswordInputChecksMixin],
  data () {
    return {
      updates: {
        newEmail: '',
        password: '',
      },

      previousEmail: '',
    };
  },
  computed: {
    ...mapState({
      user: 'user.data',
    }),
    emailChanged () {
      return this.previousEmail !== this.updates.newEmail;
    },
    validEmail () {
      return isEmail(this.updates.newEmail);
    },
    disallowedToSave () {
      return !this.emailChanged
        || !this.validEmail
        || this.updates.password.length === 0;
    },
  },
  mounted () {
    this.restoreEmptyEmail();
  },
  methods: {
    resetControls () {
      this.restoreEmail();
    },
    restoreEmptyEmail () {
      if (this.updates.newEmail.length < 1) {
        this.restoreEmail();
      }
    },
    restoreEmail () {
      this.updates.newEmail = this.user.auth.local.email;
      this.previousEmail = this.user.auth.local.email;
    },
    async changeEmail () {
      await this.passwordInputCheckMixinTryCall(async () => {
        await axios.put('/api/v4/user/auth/update-email', this.updates);
        this.user.auth.local.email = this.updates.newEmail;
        this.text(this.$t('emailSuccess'));
        this.closeModal();
      });
    },
  },
};
</script>
