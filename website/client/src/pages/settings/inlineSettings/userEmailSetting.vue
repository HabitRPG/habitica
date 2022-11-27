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

        <div class="input-area">
          <div class="settings-label">
            {{ $t("email") }}
          </div>
          <div class="form-group">
            <div
              class="input-group"
              :class="{ 'is-valid': validEmail }"
            >
              <input
                id="changeEmail"
                v-model="updates.newEmail"
                class="form-control"
                type="text"
                :class="{ 'is-invalid input-invalid': !validEmail }"
                @blur="restoreEmptyEmail()"
              >
              <div class="input-floating-checkmark">
                <div
                  v-once
                  class="svg-icon color check-icon"
                  v-html="icons.checkIcon"
                ></div>
              </div>
            </div>
          </div>
        </div>

        <current-password-input
          :show-forget-password="true"
          @passwordValue="updates.password = $event"
        />

        <save-cancel-buttons
          :disable-save="allowedToSave"
          @saveClicked="changeEmail()"
          @cancelClicked="closeModal()"
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
  width: 16px;
  height: 16px;
  color: $green-50;
}

.form-group {
  margin-bottom: 1.5rem;
}

</style>

<script>
import axios from 'axios';
import * as validator from 'validator';
import { mapState } from '@/libs/store';

import checkIcon from '@/assets/svg/check.svg';
import SaveCancelButtons from './_saveCancelButtons';
import { InlineSettingMixin } from './inlineSettingMixin';
import CurrentPasswordInput from './_currentPasswordInput';

export default {
  components: { CurrentPasswordInput, SaveCancelButtons },
  mixins: [InlineSettingMixin],
  data () {
    return {
      updates: {
        newEmail: '',
        password: '',
      },
      icons: Object.freeze({
        checkIcon,
      }),
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
    restoreEmptyEmail () {
      if (this.updates.newEmail.length < 1) {
        this.updates.newEmail = this.user.auth.local.email;
      }
    },
    async changeEmail () {
      await axios.put('/api/v4/user/auth/update-email', this.updates);

      this.user.auth.local.email = this.updates.newEmail;
      window.alert(this.$t('emailSuccess')); // eslint-disable-line no-alert
    },
  },
};
</script>
