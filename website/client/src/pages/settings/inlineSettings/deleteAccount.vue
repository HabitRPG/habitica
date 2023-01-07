<template>
  <fragment>
    <tr
      v-if="!modalVisible"
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
      v-if="modalVisible"
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
          v-html="$t('deleteLocalAccountText')"
        >
        </div>
        <current-password-input
          :show-forget-password="true"
          @passwordValue="passwordValue = $event"
        />

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
            :disable-save="!passwordValue"
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


export default {
  components: { CurrentPasswordInput, SaveCancelButtons },
  mixins: [InlineSettingMixin],
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
  },
  methods: {
    async deleteAccount () {
      await axios.delete('/api/v4/user', {
        data: {
          password: this.passwordValue,
          feedback: this.feedback,
        },
      });
      localStorage.clear();
      window.location.href = '/static/home';
    },
  },
};
</script>
