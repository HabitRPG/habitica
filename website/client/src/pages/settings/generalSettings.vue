<template>
  <div class="row standard-page">
    <div class="col-12">
      <h1
        v-once
        class="page-header"
      >
        {{ $t('generalSettings') }}
      </h1>
    </div>
    <div class="col-12">
      <h2 v-once>
        {{ $t('account') }}
      </h2>

      <table class="table">
        <user-name-setting />
        <user-email-setting />
        <display-name-setting />
        <password-setting />
        <reset-account />
        <delete-account />
        <tr>
          <td colspan="3"></td>
        </tr>
      </table>

      <h2 v-once>
        {{ $t('loginMethods') }}
      </h2>

      <table class="table">
        <LoginMethods />
        <tr>
          <td colspan="3">
          </td>
        </tr>
      </table>

      <h2 v-once>
        {{ $t('site') }}
      </h2>

      <table class="table">
        <language-setting />
        <date-format-setting />
        <day-start-adjustment-setting />
        <audio-theme-setting />
        <sleep-mode />
        <tr>
          <td colspan="3">
          </td>
        </tr>
      </table>

      <h2 v-once>
        {{ $t('character') }}
      </h2>

      <table class="table">
        <fix-values-setting />
        <class-setting />
        <tr>
          <td colspan="3">
          </td>
        </tr>
      </table>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import '~@/assets/scss/colors.scss';

.standard-page {
  padding-left: 0;
  padding-right: 0;
}

.table {
  color: $gray-50;
}
</style>

<script>
import notificationsMixin from '../../mixins/notifications';
import UserNameSetting from './settingRows/userNameSetting';
import UserEmailSetting from './settingRows/userEmailSetting';
import DisplayNameSetting from './settingRows/displayNameSetting';
import PasswordSetting from './settingRows/passwordSetting';
import ResetAccount from './settingRows/resetAccount';
import DeleteAccount from './settingRows/deleteAccount';
import { sharedInlineSettingStore } from './components/inlineSettingMixin';
import LanguageSetting from './settingRows/languageSetting';
import DateFormatSetting from './settingRows/dateFormatSetting';
import DayStartAdjustmentSetting from './settingRows/dayStartAdjustmentSetting.vue';
import AudioThemeSetting from '@/pages/settings/settingRows/audioThemeSetting.vue';
import ClassSetting from '@/pages/settings/settingRows/classSetting.vue';
import FixValuesSetting from '@/pages/settings/settingRows/fixValuesSetting.vue';
import LoginMethods from '@/pages/settings/settingRows/loginMethods.vue';
import { GenericUserPreferencesMixin } from '@/pages/settings/components/genericUserPreferencesMixin';
import { mapState } from '@/libs/store';
import SleepMode from '@/pages/settings/settingRows/sleepMode.vue';

export default {
  components: {
    SleepMode,
    LoginMethods,
    FixValuesSetting,
    ClassSetting,
    AudioThemeSetting,
    DayStartAdjustmentSetting,
    DateFormatSetting,
    LanguageSetting,
    DeleteAccount,
    ResetAccount,
    PasswordSetting,
    DisplayNameSetting,
    UserEmailSetting,
    UserNameSetting,
  },
  mixins: [notificationsMixin, GenericUserPreferencesMixin],
  computed: {
    ...mapState({
      user: 'user.data',
    }),
  },
  beforeRouteLeave (_, __, next) {
    sharedInlineSettingStore.markAsClosed();
    next();
  },
  mounted () {
    this.$store.dispatch('common:setTitle', {
      section: this.$t('settings'),
      subSection: this.$t('generalSettings'),
    });
  },
};
</script>
