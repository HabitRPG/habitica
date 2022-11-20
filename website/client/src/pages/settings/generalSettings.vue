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
        <tr>
          <td colspan="3"></td>
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
import UserNameSetting from '@/pages/settings/inlineSettings/userNameSetting';
import UserEmailSetting from '@/pages/settings/inlineSettings/userEmailSetting';
import DisplayNameSetting from '@/pages/settings/inlineSettings/displayNameSetting';
import PasswordSetting from '@/pages/settings/inlineSettings/passwordSetting';
import ResetAccount from '@/pages/settings/inlineSettings/resetAccount';

export default {
  components: {
    ResetAccount,
    PasswordSetting,
    DisplayNameSetting,
    UserEmailSetting,
    UserNameSetting,
  },
  mixins: [notificationsMixin],
};
</script>
