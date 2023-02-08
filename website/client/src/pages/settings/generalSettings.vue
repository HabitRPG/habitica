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
        <tr>
          <td colspan="3">
            TODO
          </td>
        </tr>
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
 .standard-page {
    padding-left: 0;
    padding-right: 0;
  }
</style>

<script>
import notificationsMixin from '../../mixins/notifications';
import UserNameSetting from './inlineSettings/userNameSetting';
import UserEmailSetting from './inlineSettings/userEmailSetting';
import DisplayNameSetting from './inlineSettings/displayNameSetting';
import PasswordSetting from './inlineSettings/passwordSetting';
import ResetAccount from './inlineSettings/resetAccount';
import DeleteAccount from './inlineSettings/deleteAccount';
import { sharedInlineSettingStore } from './components/inlineSettingMixin';
import LanguageSetting from './inlineSettings/languageSetting';
import DateFormatSetting from './inlineSettings/dateFormatSetting';
import DayStartAdjustmentSetting from './inlineSettings/dayStartAdjustmentSetting.vue';
import AudioThemeSetting from '@/pages/settings/inlineSettings/audioThemeSetting.vue';
import ClassSetting from '@/pages/settings/inlineSettings/classSetting.vue';
import FixValuesSetting from '@/pages/settings/inlineSettings/fixValuesSetting.vue';

export default {
  components: {
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
  mixins: [notificationsMixin],
  beforeRouteLeave (_, __, next) {
    sharedInlineSettingStore.markAsClosed();
    next();
  },
};
</script>
