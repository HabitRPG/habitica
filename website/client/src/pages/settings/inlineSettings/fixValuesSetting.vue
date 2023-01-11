<template>
  <fragment>
    <tr
      v-if="!modalVisible"
    >
      <td class="settings-label">
        {{ $t("fixValues") }}
      </td>
      <td class="settings-value">
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
      <td
        colspan="3"
        novalidate="novalidate"
      >
        <div
          v-once
          class="dialog-title"
        >
          {{ $t("fixValues") }}
        </div>
        <div
          v-once
          class="dialog-disclaimer"
        >
          <span v-html="$t('fixValuesText1')"></span>
          <br>
          <br>
          <span v-html="$t('fixValuesText2')"></span>
        </div>

        TODO

        <save-cancel-buttons
          :disable-save="inputsInvalid || true"
          @saveClicked="changePassword( passwordUpdates)"
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

</style>

<script>
import axios from 'axios';

import SaveCancelButtons from '../components/saveCancelButtons.vue';
import { InlineSettingMixin } from '../components/inlineSettingMixin';

export default {
  components: { SaveCancelButtons },
  mixins: [InlineSettingMixin],
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
    inputsInvalid () {
      if (!this.passwordUpdates.password) {
        return true;
      }

      return this.passwordUpdates.newPassword !== this.passwordUpdates.confirmPassword;
    },
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
