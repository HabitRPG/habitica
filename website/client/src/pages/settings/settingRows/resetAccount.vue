<template>
  <fragment>
    <tr
      v-if="!mixinData.inlineSettingMixin.modalVisible"
    >
      <td class="settings-label">
        {{ $t("resetAccount") }}
      </td>
      <td class="settings-value">
      </td>
      <td class="settings-button">
        <a
          v-if="!!user?.auth?.local?.username"
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
          {{ $t("resetAccount") }}
        </div>
        <div
          v-once
          class="dialog-disclaimer"
          v-html="$t('resetText1')"
        >
        </div>
        <div class="split-lists my-3">
          <ul>
            <li
              v-once
            >
              {{ $t('resetDetail1') }}
            </li>
            <li v-once>
              {{ $t('resetDetail3') }}
            </li>
          </ul>
          <ul>
            <li v-once>
              {{ $t('resetDetail2') }}
            </li>

            <li v-once>
              {{ $t('resetDetail4') }}
            </li>
          </ul>
        </div>

        <div
          v-once
          class="mb-3"
          v-html="$t('resetText2')"
        >
        </div>

        <div
          v-if="hasPassword"
          v-html="$t('resetTextLocal')"
        >
        </div>
        <div
          v-else
          v-html="$t('resetTextSocial', {magicWord: 'RESET'})"
        >
        </div>

        <div class="input-area">
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
            <div class="form">
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
          <save-cancel-buttons
            :disable-save="!enableReset"
            primary-button-color="btn-danger"
            primary-button-label="resetAccount"
            @saveClicked="reset()"
            @cancelClicked="requestCloseModal()"
          />
        </div>
      </td>
    </tr>
  </fragment>
</template>

<style lang="scss" scoped>
@import '~@/assets/scss/colors.scss';

.split-lists {
  display: flex;
  flex-direction: row;
  color: $gray-50;

  ul {
    flex: 0 0 50%;
  }
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
    };
  },
  computed: {
    ...mapState({
      user: 'user.data',
    }),
    hasPassword () {
      return this.user.auth.local.has_password;
    },
    enableReset () {
      return this.hasPassword ? Boolean(this.passwordValue) : this.passwordValue === 'RESET';
    },
  },
  methods: {
    async reset () {
      await this.passwordInputCheckMixinTryCall(async () => {
        await axios.post('/api/v4/user/reset', {
          password: this.passwordValue,
        });
        this.$router.push('/');
        setTimeout(() => window.location.reload(true), 100);
      });
    },
  },
};
</script>
