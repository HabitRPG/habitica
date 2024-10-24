<template>
  <fragment>
    <tr
      v-if="!mixinData.inlineSettingMixin.modalVisible"
    >
      <td class="settings-label">
        {{ $t("yourUserData") }}
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
          class="dialog-title"
        >
          {{ $t("yourUserData") }}
        </div>
        <div
          v-once
          class="dialog-disclaimer"
        >
          {{ $t("yourUserDataDisclaimer") }}
        </div>

        <div class="d-flex justify-content-center data-download-selection">
          <table v-once>
            <tr>
              <td>{{ $t('taskHistory') }}</td>
              <td>
                <a
                  href="/export/history.csv"
                  class="btn btn-secondary"
                >
                  {{ $t('downloadCSV') }}
                </a>
              </td>
            </tr>
            <tr>
              <td>{{ $t('userData') }}</td>
              <td>
                <b-dropdown
                  :text="$t('downloadAs')"
                  right="right"
                >
                  <b-dropdown-item
                    href="/export/userdata.xml"
                  >
                    {{ $t('xml') }}
                  </b-dropdown-item>
                  <b-dropdown-item
                    href="/export/userdata.json"
                  >
                    {{ $t('json') }}
                  </b-dropdown-item>
                </b-dropdown>
              </td>
            </tr>
          </table>
        </div>
        <save-cancel-buttons
          :hide-save="true"
          @cancelClicked="requestCloseModal()"
        />
      </td>
    </tr>
  </fragment>
</template>

<style lang="scss" scoped>
@import '~@/assets/scss/colors.scss';

.data-download-selection {
  margin-top: 20px;
  margin-bottom: 0;

  td {
    border: 0 !important;
    padding-bottom: 0 !important;

    &:first-of-type {
      text-align: end;
      vertical-align: middle;
      padding-right: 0.5rem !important;

      font-weight: bold;
      line-height: 1.71;
      color: $gray-50;
    }
  }

  tr:first-of-type {
    td {
      padding-bottom: 0.5rem !important;
    }
  }

  ::v-deep {
    .dropdown-menu {
      min-width: 0;
    }
  }
}
</style>

<script>
import { mapState } from '@/libs/store';

import { InlineSettingMixin } from '../components/inlineSettingMixin';
import SaveCancelButtons from '@/pages/settings/components/saveCancelButtons.vue';

export default {
  components: { SaveCancelButtons },
  mixins: [InlineSettingMixin],
  data () {
    return {};
  },
  computed: {
    ...mapState({
      user: 'user.data',
    }),
  },

  methods: {},
};
</script>
