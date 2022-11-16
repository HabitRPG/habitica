<template>
  <fragment>
    <tr
      v-if="!show"
    >
      <td class="settings-label">
        {{ $t("password") }}
      </td>
      <td class="settings-value">
      </td>
      <td class="settings-button">
        <a
          class="edit-link"
          @click.prevent="show = true"
        >
          {{ $t('edit') }}
        </a>
      </td>
    </tr>
    <tr
      v-if="show"
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
          :show-forget-password="true"
          custom-label="currentPass"
          @passwordValue="passwordUpdates.password = $event"
        />
        <current-password-input
          custom-label="newPass"
          @passwordValue="passwordUpdates.newPassword = $event"
        />
        <current-password-input
          custom-label="confirmPass"
          @passwordValue="passwordUpdates.confirmPassword = $event"
        />

        <save-cancel-buttons
          @saveClicked="changePassword( passwordUpdates)"
          @cancelClicked="resetAndClose()"
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

.form-group {
  margin-bottom: 1.5rem;
}

</style>

<script>
import axios from 'axios';

import SaveCancelButtons from '@/pages/settings/inlineSettings/_saveCancelButtons';
import { InlineSettingMixin } from '@/pages/settings/inlineSettings/inlineSettingMixin';
import CurrentPasswordInput from '@/pages/settings/inlineSettings/_currentPasswordInput';

export default {
  components: { CurrentPasswordInput, SaveCancelButtons },
  mixins: [InlineSettingMixin],
  data () {
    return {
      passwordUpdates: {},
    };
  },
  methods: {
    async changePassword (updates) {
      await axios.put('/api/v4/user/auth/update-password', updates);

      this.passwordUpdates = {};
      this.$store.dispatch('snackbars:add', {
        title: 'Habitica',
        text: this.$t('passwordSuccess'),
        type: 'success',
        timeout: true,
      });
    },
  },
};
</script>
