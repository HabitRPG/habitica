<template>
  <fragment>
    <tr
      v-if="!mixinData.inlineSettingMixin.modalVisible"
    >
      <td class="settings-label">
        {{ $t("deleteAccount") }}
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
          class="dialog-title danger"
        >
          {{ $t("deleteAccount") }}
        </div>
        <div
          v-once
          class="dialog-disclaimer"
          v-html="hasPassword
            ? $t('deleteLocalAccountText')
            : $t('deleteSocialAccountText', {magicWord: 'DELETE'})"
        >
        </div>

        <current-password-input
          v-if="hasPassword"
          :show-forget-password="true"
          :is-valid="mixinData.currentPasswordIssues.length === 0"
          :invalid-issues="mixinData.currentPasswordIssues"
          @passwordValue="passwordValue = $event"
        />

        <div
          v-else
          class="input-area"
        >
          <div
            class="form"
          >
            <div class="settings-label">
              {{ $t("confirm") }}
            </div>
            <div class="form-group">
              <input
                v-model="passwordValue"
                class="form-control"
                type="text"
              >
            </div>
          </div>
        </div>

        <div
          v-once
          class="feedback"
          v-html="$t('feedback')"
        >
        </div>

        <div
          class="input-area"
        >
          <textarea
            id="feedbackTextArea"
            v-model="feedback"
            :placeholder="$t('feedbackPlaceholder')"
            class="form-control"
          ></textarea>
        </div>

        <div class="input-area">
          <save-cancel-buttons
            :disable-save="!enableDelete"
            primary-button-color="btn-danger"
            primary-button-label="deleteAccount"
            @saveClicked="deleteAccount()"
            @cancelClicked="requestCloseModal()"
          />
        </div>
      </td>
    </tr>
  </fragment>
</template>

<style lang="scss" scoped>
@import '~@/assets/scss/colors.scss';

.feedback {
  color: $gray-50;
}
</style>

<script>
import axios from 'axios';
import { mapState } from '@/libs/store';

import { InlineSettingMixin } from '../components/inlineSettingMixin';
import SaveCancelButtons from '../components/saveCancelButtons.vue';
import CurrentPasswordInput from '../components/currentPasswordInput.vue';
import { PasswordInputChecksMixin } from '@/mixins/passwordInputChecks';

export default {
  components: { CurrentPasswordInput, SaveCancelButtons },
  mixins: [InlineSettingMixin, PasswordInputChecksMixin],
  data () {
    return {
      passwordValue: '',
      feedback: '',
    };
  },
  computed: {
    ...mapState({
      user: 'user.data',
    }),
    hasPassword () {
      return this.user.auth.local.has_password;
    },
    enableDelete () {
      return this.hasPassword ? Boolean(this.passwordValue) : this.passwordValue === 'DELETE';
    },
  },
  methods: {
    async deleteAccount () {
      await this.passwordInputCheckMixinTryCall(async () => {
        await axios.delete('/api/v4/user', {
          data: {
            password: this.passwordValue,
            feedback: this.feedback,
          },
        });
        localStorage.clear();
        window.location.href = '/static/home';
      });
    },
  },
};
</script>
