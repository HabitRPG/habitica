<template>
  <fragment>
    <tr
      v-if="!mixinData.inlineSettingMixin.modalVisible"
    >
      <td class="settings-label">
        {{ $t("displayName") }}
      </td>
      <td class="settings-value">
        {{ user.profile.name }}
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
      v-if="mixinData.inlineSettingMixin.modalVisible"
      class="expanded"
    >
      <td colspan="3">
        <div
          v-once
          class="dialog-title"
        >
          {{ $t("displayName") }}
        </div>
        <div
          v-once
          class="dialog-disclaimer"
        >
          {{ $t("changeDisplayNameDisclaimer") }}
        </div>

        <div class="input-area">
          <div class="settings-label">
            {{ $t("displayName") }}
          </div>
          <div
            class="form"
            name="changeDisplayName"
            novalidate="novalidate"
          >
            <div class="form-group">
              <input
                id="changeDisplayname"
                v-model="temporaryDisplayName"
                class="form-control"
                type="text"
                :placeholder="$t('newDisplayName')"
                :class="{'is-invalid input-invalid': displayNameInvalid}"
                @keyup="valuesChanged()"
              >
              <div
                v-if="displayNameIssues.length > 0"
                class="mb-3"
              >
                <div
                  v-for="issue in displayNameIssues"
                  :key="issue"
                  class="input-error"
                >
                  {{ issue }}
                </div>
              </div>
            </div>
          </div>

          <save-cancel-buttons
            :disable-save="displayNameCannotSubmit"
            @saveClicked="changeDisplayName(temporaryDisplayName)"
            @cancelClicked="requestCloseModal()"
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
import isEmail from 'validator/es/lib/isEmail';
import debounce from 'lodash/debounce';
import { mapState } from '@/libs/store';

import checkIcon from '@/assets/svg/check.svg';
import SaveCancelButtons from '../components/saveCancelButtons.vue';
import { InlineSettingMixin } from '../components/inlineSettingMixin';
import NotificationMixins from '@/mixins/notifications';

export default {
  components: { SaveCancelButtons },
  mixins: [InlineSettingMixin, NotificationMixins],
  data () {
    return {
      temporaryDisplayName: '',
      inputChanged: false,
      displayNameIssues: [],
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
      return isEmail(this.updates.newEmail);
    },
    allowedToSave () {
      return !this.validEmail || this.updates.password.length === 0;
    },
    displayNameInvalid () {
      if (this.temporaryDisplayName.length <= 1) {
        return true;
      }

      return this.displayNameIssues.length !== 0;
    },
    displayNameCannotSubmit () {
      return this.displayNameInvalid || !this.inputChanged;
    },
  },
  watch: {
    temporaryDisplayName: {
      handler () {
        this.validateDisplayName(this.temporaryDisplayName);
      },
      deep: true,
    },
  },
  mounted () {
    this.resetControls();
  },
  methods: {
    /**
     * is a callback from the {InlineSettingMixin}
     * do not remove
     */
    resetControls () {
      this.temporaryDisplayName = this.user.profile.name;
    },
    async changeDisplayName (newName) {
      await axios.put('/api/v4/user/', { 'profile.name': newName });
      this.text(this.$t('displayNameSuccess'));
      this.user.profile.name = newName;
      this.temporaryDisplayName = newName;

      this.closeModal();
    },
    validateDisplayName: debounce(async function checkName (displayName) {
      if (displayName.length <= 1 || displayName === this.user.profile.name) {
        this.displayNameIssues = [];
        return;
      }
      const res = await this.$store.dispatch('auth:verifyDisplayName', {
        displayName,
      });

      if (res.issues !== undefined) {
        this.displayNameIssues = res.issues;
      } else {
        this.displayNameIssues = [];
      }
    }, 500),
    valuesChanged () {
      this.inputChanged = true;
      this.modalValuesChanged();
    },
  },
};
</script>
