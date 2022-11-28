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
      </table>

      <h2 v-once>
        {{ $t('site') }}
      </h2>

      <table class="table">
        <language-setting />
        <date-format-setting />
        <tr>
          <td colspan="3">
            Day Start TODO
          </td>
        </tr>
        <tr>
          <td colspan="3">
            Audio TODO
          </td>
        </tr>
        <tr>
          <td colspan="3">
            Show header TODO
          </td>
        </tr>
        <tr>
          <td colspan="3">
            Sticky Header TODO
          </td>
        </tr>
      </table>


      <h2 v-once>
        {{ $t('character') }}
      </h2>

      <table class="table">
        <tr>
          <td colspan="3">
            Fix Values TODO
          </td>
        </tr>
        <tr>
          <td colspan="3">
            Change Class TODO
          </td>
        </tr>
      </table>
    </div>
  </div>
</template>

<style lang="scss" scoped>
  @import '~@/assets/scss/colors.scss';
  input {
    color: $gray-50;
  }
  .usersettings h5 {
    margin-top: 1em;
  }
  .iconalert > div > span {
    line-height: 25px;
  }
  .iconalert > div:after {
    clear: both;
    content: '';
    display: table;
  }
  .input-error {
    color: $red-50;
    font-size: 90%;
    width: 100%;
    margin-top: 5px;
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
import DateFormatSetting from '@/pages/settings/inlineSettings/dateFormatSetting';

export default {
  components: {
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
