<template>
  <fragment>
    <tr
      v-if="!show"
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
          @click.prevent="show = true"
        >
          {{ $t(user?.auth?.local?.username ? 'edit' : 'add') }}
        </a>
      </td>
    </tr>
    <tr
      v-if="show"
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
          <div class="settings-label">
            {{ $t("username") }}
          </div>
          <div class="form-group">
            <div
              class="input-group"
              :class="{ 'is-valid': usernameValid }"
            >
              <input
                id="changeUsername"
                v-model="inputValue"
                class="form-control"
                type="text"
                :placeholder="$t('newUsername')"
                :class="{ 'is-invalid input-invalid': !usernameValid }"
                @blur="restoreEmptyUsername()"
              >
              <div class="input-floating-checkmark">
                <div
                  v-once
                  class="svg-icon color check-icon"
                  v-html="icons.checkIcon"
                ></div>
              </div>
            </div>
            <div
              v-for="issue in usernameIssues"
              :key="issue"
              class="input-error"
            >
              {{ issue }}
            </div>
          </div>

          <save-cancel-buttons
            :disable-save="usernameCannotSubmit"
            @saveClicked="changeUser('username', cleanedInputValue)"
            @cancelClicked="resetAndClose()"
          />
        </div>
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
import debounce from 'lodash/debounce';
import { mapState } from '@/libs/store';

import checkIcon from '@/assets/svg/check.svg';
import { _InlineSettingMixin } from './_inlineSettingMixin';
import SaveCancelButtons from '@/pages/settings/inlineSettings/_saveCancelButtons';

export default {
  components: { SaveCancelButtons },
  mixins: [_InlineSettingMixin],
  data () {
    return {
      inputValue: '',
      usernameIssues: [],
      icons: Object.freeze({
        checkIcon,
      }),
    };
  },
  computed: {
    ...mapState({
      user: 'user.data',
    }),
    cleanedInputValue () {
      // remove the @ from the value
      return this.inputValue.replace('@', '');
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
      return !this.usernameValid;
    },
  },
  watch: {
    inputValue () {
      this.validateUsername(this.cleanedInputValue);
    },
  },
  mounted () {
    this.restoreEmptyUsername();
  },
  methods: {
    restoreEmptyUsername () {
      if (this.inputValue.length < 1) {
        this.inputValue = `@${this.user.auth.local.username}`;
      }
    },
    async changeUser (attribute, newUsername) {
      await axios.put(`/api/v4/user/auth/update-${attribute}`, {
        username: newUsername,
      });

      this.user.auth.local.username = newUsername;
      // this.localAuth.username = this.user.auth.local.username;
      this.user.flags.verifiedUsername = true;
    },
    validateUsername: debounce(function checkName (username) {
      if (username.length <= 1 || username === this.user.auth.local.username) {
        this.usernameIssues = [];
        return;
      }
      this.$store.dispatch('auth:verifyUsername', {
        username,
      }).then(res => {
        if (res.issues !== undefined) {
          this.usernameIssues = res.issues;
        } else {
          this.usernameIssues = [];
        }
      });
    }, 500),
  },
};
</script>
