<template>
  <fragment>
    <tr
      v-if="!mixinData.inlineSettingMixin.modalVisible"
    >
      <td class="settings-label">
        {{ $t("password") }}
      </td>
      <td class="settings-value"></td>
      <td class="settings-button">
        <a
          class="edit-link"
          @click.prevent="openModal()"
        >
          {{ $t(hasPassword ? 'edit' : 'add') }}
        </a>
      </td>
    </tr>
    <tr
      v-if="mixinData.inlineSettingMixin.modalVisible"
      class="expanded"
    >
      <td
        colspan="3"
        novalidate="novalidate"
      >
        <div
          v-once
          class="dialog-title"
        >
          {{ $t("password") }}
        </div>
        <div
          v-once
          class="dialog-disclaimer"
        >
          {{ $t("changePasswordDisclaimer") }}
        </div>

        <current-password-input
          v-if="hasPassword"
          :show-forget-password="true"
          custom-label="currentPass"
          :is-valid="mixinData.currentPasswordIssues.length === 0"
          :invalid-issues="mixinData.currentPasswordIssues"

          @passwordValue="passwordUpdates.password = $event"
        />
        <current-password-input
          custom-label="newPass"
          :is-valid="mixinData.newPasswordIssues.length === 0"
          :invalid-issues="mixinData.newPasswordIssues"
          @passwordValue="passwordUpdates.newPassword = $event"
        />
        <current-password-input
          custom-label="confirmPass"
          :is-valid="mixinData.confirmPasswordIssues.length === 0"
          :invalid-issues="mixinData.confirmPasswordIssues"
          @passwordValue="passwordUpdates.confirmPassword = $event"
        />

        <save-cancel-buttons
          :disable-save="inputsInvalid"
          @saveClicked="hasPassword ? changePassword() : addLocalAuth()"
          @cancelClicked="requestCloseModal()"
        />
      </td>
    </tr>
  </fragment>
</template>

<style lang="scss" scoped>
@import '~@/assets/scss/colors.scss';

.input-group {
  position: relative;
  background: white;
}

input {
  margin-right: 2rem;
}

.input-floating-checkmark {
  position: absolute;
  background: none !important;
  right: 0.5rem;
  top: 0.5rem;

  width: 1rem;
  height: 1rem;

  display: flex;
  align-items: center;
  justify-content: center;
}

.input-group.is-valid {
  border-color: $green-10 !important;
}

.input-group:not(.is-valid) {
  .check-icon {
    display: none;
  }
}

.check-icon {
  width: 12px;
  height: 10px;
  color: $green-50;
}

</style>

<script>
import axios from 'axios';

import SaveCancelButtons from '../components/saveCancelButtons.vue';
import { InlineSettingMixin } from '../components/inlineSettingMixin';
import CurrentPasswordInput from '../components/currentPasswordInput.vue';
import { mapState } from '@/libs/store';
import { PasswordInputChecksMixin } from '@/mixins/passwordInputChecks';

export default {
  components: { CurrentPasswordInput, SaveCancelButtons },
  mixins: [InlineSettingMixin, PasswordInputChecksMixin],
  data () {
    return {
      passwordUpdates: {
        password: '',
        newPassword: '',
        confirmPassword: '',
      },
    };
  },
  computed: {
    ...mapState({
      user: 'user.data',
    }),
    hasPassword () {
      return this.user.auth.local.has_password;
    },
    inputsInvalid () {
      if (this.hasPassword && !this.passwordUpdates.password) {
        return true;
      }

      return this.passwordUpdates.newPassword !== this.passwordUpdates.confirmPassword;
    },
  },
  methods: {
    async changePassword () {
      await this.passwordInputCheckMixinTryCall(async () => {
        const localAuthData = {
          password: this.passwordUpdates.password,
          newPassword: this.passwordUpdates.newPassword,
          confirmPassword: this.passwordUpdates.confirmPassword,
        };

        await axios.put('/api/v4/user/auth/update-password', localAuthData);

        this.passwordUpdates = {};
        this.$store.dispatch('snackbars:add', {
          title: 'Habitica',
          text: this.$t('passwordSuccess'),
          type: 'success',
          timeout: true,
        });
      });
    },

    async addLocalAuth () {
      await this.passwordInputCheckMixinTryCall(async () => {
        const localAuthData = {
          password: this.passwordUpdates.newPassword,
          confirmPassword: this.passwordUpdates.confirmPassword,
          email: this.user.auth.local.email,
          username: this.user.auth.local.username,
        };

        await axios.post('/api/v4/user/auth/local/register', localAuthData);
        window.location.reload();
      });
    },

  },
};
</script>
