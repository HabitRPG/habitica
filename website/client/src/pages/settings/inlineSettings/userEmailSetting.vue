<template>
  <fragment>
    <tr
      v-if="!modalVisible"
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
      v-if="modalVisible"
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

        <validated-text-input
          v-model="updates.newEmail"
          settings-label="email"
          :is-valid="validEmail"
          @update:value="modalValuesChanged"
          @blur="restoreEmptyEmail()"
        />

        <current-password-input
          :show-forget-password="true"
          @passwordValue="updates.password = $event"
        />

        <save-cancel-buttons
          :disable-save="allowedToSave"
          @saveClicked="changeEmail()"
          @cancelClicked="requestCloseModal()"
        />
      </td>
    </tr>
  </fragment>
</template>

<style lang="scss" scoped>
</style>

<script>
import axios from 'axios';
import * as validator from 'validator';
import { mapState } from '@/libs/store';

import SaveCancelButtons from '../components/saveCancelButtons.vue';
import { InlineSettingMixin } from '../components/inlineSettingMixin';
import CurrentPasswordInput from '../components/currentPasswordInput.vue';
import ValidatedTextInput from '@/components/ui/validatedTextInput.vue';

export default {
  components: { ValidatedTextInput, CurrentPasswordInput, SaveCancelButtons },
  mixins: [InlineSettingMixin],
  data () {
    return {
      updates: {
        newEmail: '',
        password: '',
      },
      emailChanged: false,
    };
  },
  computed: {
    ...mapState({
      user: 'user.data',
    }),
    validEmail () {
      return validator.isEmail(this.updates.newEmail);
    },
    allowedToSave () {
      return !this.validEmail || this.updates.password.length === 0;
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
    },
    async changeEmail () {
      await axios.put('/api/v4/user/auth/update-email', this.updates);

      this.user.auth.local.email = this.updates.newEmail;
      window.alert(this.$t('emailSuccess')); // eslint-disable-line no-alert
    },
  },
};
</script>
