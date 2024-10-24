<template>
  <fragment>
    <tr
      v-if="!mixinData.inlineSettingMixin.modalVisible"
    >
      <td class="settings-label">
        {{ $t("dayStartAdjustment") }}
      </td>
      <td class="settings-value">
        {{ selectedDayStartLabel(user.preferences.dayStart) }}
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
          {{ $t("dayStartAdjustment") }}
        </div>
        <div
          v-once
          class="dialog-disclaimer"
          v-html="$t('customDayStartInfo1')"
        >
        </div>

        <div class="input-area">
          <div class="settings-label">
            {{ $t("adjustment") }}
          </div>
          <div class="form-group">
            <select-list
              :items="dayStartOptions"
              :value="newDayStart"
              key-prop="value"
              active-key-prop="value"
              :hide-icon="false"
              @select="changeDayStart($event)"
            >
              <template #item="{ item }">
                <span v-if="item === newDayStart || (!item && newDayStart === 0)">
                  {{ selectedDayStartLabel(newDayStart) }}
                </span>
                <span v-else>
                  {{ item?.name }}
                </span>
              </template>
            </select-list>
          </div>
        </div>

        <small
          class="timezone-explain"
        >
          <p v-html="$t('timezoneUTC', {utc: timezoneOffsetToUtc})"></p>
          <p v-html="$t('timezoneInfo')"></p>
        </small>

        <div class="input-area">
          <save-cancel-buttons
            :disable-save="newDayStart === user.preferences.dayStart"
            @saveClicked="saveDayStart()"
            @cancelClicked="requestCloseModal()"
          />
        </div>
      </td>
    </tr>
  </fragment>
</template>

<style lang="scss" scoped>
@import '~@/assets/scss/colors.scss';

.timezone-explain {
  font-size: 12px;
  line-height: 1.33;

  color: $gray-100;
  text-align: center;
}
</style>

<script>
import axios from 'axios';
import moment from 'moment/moment';
import getUtcOffset from '@/../../common/script/fns/getUtcOffset';
import { mapState } from '@/libs/store';

import { InlineSettingMixin } from '../components/inlineSettingMixin';
import SaveCancelButtons from '../components/saveCancelButtons.vue';
import SelectList from '@/components/ui/selectList.vue';

export default {
  components: { SelectList, SaveCancelButtons },
  mixins: [InlineSettingMixin],
  data () {
    const dayStartOptions = [];
    for (let number = 0; number <= 12; number += 1) {
      const meridian = number < 12 ? 'AM' : 'PM';
      const hour = number % 12;
      const timeWithMeridian = `(${hour || 12}:00 ${meridian})`;
      const option = {
        value: number,
        name: `+${number} hours ${timeWithMeridian}`,
      };

      if (number === 0) {
        option.name = `Default ${timeWithMeridian}`;
      }

      dayStartOptions.push(option);
    }

    return {
      newDayStart: 0,
      dayStartOptions,
    };
  },
  mounted () {
    this.newDayStart = this.user.preferences.dayStart;
  },
  computed: {
    ...mapState({
      user: 'user.data',
    }),
    timezoneOffsetToUtc () {
      const offsetString = moment().utcOffset(getUtcOffset(this.user)).format('Z');
      return `UTC${offsetString}`;
    },
    dayStart () {
      return this.user.preferences.dayStart;
    },
  },
  methods: {
    changeDayStart ($event) {
      this.newDayStart = $event.value;
    },
    async saveDayStart () {
      this.user.preferences.dayStart = this.newDayStart;
      await axios.post('/api/v4/user/custom-day-start', {
        dayStart: this.newDayStart,
      });

      this.closeModal();
    },
    selectedDayStartLabel (dayStartValue) {
      if (!this.dayStartOptions) {
        return '';
      }

      return this.dayStartOptions.find(l => l.value === dayStartValue)?.name ?? '';
    },
    calculateNextCron () {
      let nextCron = moment()
        .hours(this.newDayStart)
        .minutes(0)
        .seconds(0)
        .milliseconds(0);

      const currentHour = moment().format('H');
      if (currentHour >= this.newDayStart) {
        nextCron = nextCron.add(1, 'day');
      }

      return nextCron.format(`${this.user.preferences.dateFormat.toUpperCase()} @ h:mm a`);
    },
  },
};
</script>
