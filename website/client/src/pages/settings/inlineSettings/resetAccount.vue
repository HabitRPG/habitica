<template>
  <fragment>
    <tr
      v-if="!modalVisible"
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
      v-if="modalVisible"
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
        <ul class="row my-3">
          <li
            v-once
            class="col-6"
          >
            {{ $t('resetDetail1') }}
          </li>
          <li class="col-6">
            {{ $t('resetDetail2') }}
          </li>
          <li class="col-6">
            {{ $t('resetDetail3') }}
          </li>
          <li class="col-6">
            {{ $t('resetDetail4') }}
          </li>
        </ul>
        <div
          v-once
          v-html="$t('resetDetail5')"
        >
        </div>

        <div class="input-area">
          Todo Password Check for Reset (Missing in the API)
          <current-password-input
            :show-forget-password="true"
            @passwordValue="passwordValue = $event"
          />
          <save-cancel-buttons
            primary-button-color="btn-danger"
            primary-button-label="resetAccount"
            @saveClicked="reset()"
            @cancelClicked="closeModal()"
          />
        </div>
      </td>
    </tr>
  </fragment>
</template>

<style lang="scss" scoped>
@import '~@/assets/scss/colors.scss';

</style>

<script>
import axios from 'axios';
import { mapState } from '@/libs/store';

import { InlineSettingMixin } from '../components/inlineSettingMixin';
import SaveCancelButtons from '../components/_saveCancelButtons';
import CurrentPasswordInput from '../components/_currentPasswordInput';


export default {
  components: { CurrentPasswordInput, SaveCancelButtons },
  mixins: [InlineSettingMixin],
  data () {
    return {
      passwordValue: '',
    };
  },
  computed: {
    ...mapState({
      user: 'user.data',
    }),
  },
  methods: {
    async reset () {
      await axios.post('/api/v4/user/reset');
      this.$router.push('/');
      setTimeout(() => window.location.reload(true), 100);
    },
  },
};
</script>
