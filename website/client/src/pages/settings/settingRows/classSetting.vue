<template>
  <fragment v-if="allowedToChangeClass">
    <tr
      v-if="!mixinData.inlineSettingMixin.modalVisible"
    >
      <td class="settings-label">
        {{ $t("changeClassSetting") }}
      </td>
      <td class="settings-value">
        <class-icon-label
          :selected-class="selectedClass"
          :class-disabled="classDisabled"
        />
      </td>
      <td class="settings-button">
        <a
          class="edit-link"
          @click.prevent="showRealModalOrInline()"
        >
          {{ $t(classDisabled ? 'chooseClassSetting' : 'edit') }}
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
          {{ $t("changeClassSetting") }}
        </div>
        <div
          v-once
          class="dialog-disclaimer"
        >
          <span>{{ $t("changeClassDisclaimer") }}</span>
        </div>
        <div class="content-centered">
          <div class="current-class mt-3">
            <span class="label">{{ $t('currentClass') }}:</span>
            <class-icon-label
              :selected-class="selectedClass"
              :class-disabled="classDisabled"
            />
          </div>

          <gem-price
            gem-price="3"
            icon-size="24"
            class="gem-price-spacing"
            :with-background="true"
          />

          <save-cancel-buttons
            primary-button-label="changeClassSetting"
            class="mb-2"
            :no-padding="true"
            :disable-save="!enoughGemsAvailable"
            @saveClicked="changeClassAndClose()"
            @cancelClicked="requestCloseModal()"
          />

          <your-balance
            :amount-needed="amountNeeded"
            currency-needed="gems"
          />
        </div>
      </td>
    </tr>
  </fragment>
</template>

<style lang="scss" scoped>
@import '~@/assets/scss/colors.scss';

input {
  margin-right: 2rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.label-columns {
  display: flex;

  &:first-of-type {
    margin-bottom: 1rem;
  }

  div:first-of-type {
    flex: 1
  }
}

.content-centered {
  display: flex;
  flex-direction: column;
}

.gem-price-spacing {
  margin-top: 1.5rem;
  margin-bottom: 1.25rem;
  justify-content: center;
}

.class-selection {
  display: flex;
  gap: 22px;
  justify-content: center;

  margin-bottom: 1.5rem;
  margin-top: 1.5rem;
}

.label {
  font-size: 14px;
  line-height: 1.71;
  text-align: center;
}

.selected-badge {
  position: absolute;
  bottom: -1rem;

  width: 24px;
  height: 24px;

  padding: 4px;
  box-shadow: 0 1px 3px 0 rgba($black, 0.12), 0 1px 2px 0 rgba($black, 0.24);
  background-color: $green-50;
  border-radius: 1rem;

  color: $white;
}

.current-class {
  display: flex;
  justify-content: center;

  .label {
    margin-right: 0.5rem;

    font-weight: bold;
    color: $gray-50;
  }
}

</style>

<script>
import axios from 'axios';
import changeClass from '@/../../common/script/ops/changeClass';
import { mapGetters, mapState } from '@/libs/store';

import SaveCancelButtons from '../components/saveCancelButtons.vue';
import { InlineSettingMixin } from '../components/inlineSettingMixin';
import { GenericUserPreferencesMixin } from '../components/genericUserPreferencesMixin';
import YourBalance from '@/pages/settings/components/yourBalance.vue';
import GemPrice from '@/components/shops/gemPrice.vue';
import checkIcon from '@/assets/svg/check.svg';
import ClassIconLabel from '@/pages/settings/components/classIconLabel.vue';

export default {
  components: {
    ClassIconLabel,
    GemPrice,
    YourBalance,
    SaveCancelButtons,
  },
  mixins: [InlineSettingMixin, GenericUserPreferencesMixin],
  data () {
    return {
      amountNeeded: 3 / 4,
      selectedClass: '',
      icons: Object.freeze({
        check: checkIcon,
      }),
    };
  },
  computed: {
    ...mapGetters({
      userGems: 'user:gems',
    }),
    ...mapState({
      user: 'user.data',
      availableLanguages: 'i18n.availableLanguages',
      content: 'content',
    }),
    classList () {
      return this.content.classes;
    },
    allowedToChangeClass () {
      return this.user.stats.lvl >= 10;
    },
    enoughGemsAvailable () {
      return this.amountNeeded <= this.userGems;
    },
    classDisabled () {
      return this.user.preferences.disableClasses;
    },
  },
  mounted () {
    this.selectedClass = this.user.stats.class;
    this.resetControls();
  },
  methods: {
    showRealModalOrInline () {
      if (!this.classDisabled) {
        this.openModal();
      } else {
        this.changeClassAndClose();
      }
    },
    async changeClassAndClose () {
      if (!this.classDisabled && !window.confirm(this.$t('changeClassConfirmCost'))) {
        return;
      }

      this.$root.$once('bv::hide::modal', () => {
        // update the label in the settings list
        this.selectedClass = this.user.stats.class;
      });

      try {
        await Promise.all([
          // resets the class settings and triggers indirectly the modal of
          // src/components/achievemnts/chooseClass - I don't know if we should keep this weird way
          changeClass(this.user),
          axios.post('/api/v4/user/change-class'),
        ]);
      } catch (e) {
        window.alert(e.message); // eslint-disable-line no-alert
      }

      this.closeModal();
    },
    /**
     * is a callback from the {InlineSettingMixin}
     * do not remove
     */
    resetControls () {
      this.selectedClass = this.user.stats.class;
    },
  },
};
</script>
