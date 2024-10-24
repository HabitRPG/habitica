<template>
  <div class="row standard-page">
    <div class="col-12">
      <h1
        v-once
        class="page-header"
      >
        {{ $t('siteData') }}
      </h1>
    </div>
    <div class="col-12">
      <h2 v-once>
        {{ $t('user') }}
      </h2>

      <table class="table">
        <user-id-row />
        <user-data-row />
        <tr>
          <td colspan="3">
          </td>
        </tr>
      </table>
    </div>

    <div class="col-12">
      <h2 v-once>
        {{ $t('api') }}
      </h2>

      <table class="table">
        <api-row />
        <developer-mode-row />
        <tr>
          <td colspan="3">
          </td>
        </tr>
      </table>

      <webhooks-row />
    </div>
  </div>
</template>

<script>
import UserIdRow from '@/pages/settings/siteDataRows/userIdRow.vue';
import UserDataRow from '@/pages/settings/siteDataRows/userDataRow.vue';
import ApiRow from '@/pages/settings/siteDataRows/apiRow.vue';
import WebhooksRow from '@/pages/settings/siteDataRows/webhooksRow.vue';
import DeveloperModeRow from '@/pages/settings/siteDataRows/developerModeRow.vue';

export default {
  components: {
    DeveloperModeRow,
    WebhooksRow,
    ApiRow,
    UserDataRow,
    UserIdRow,
  },
  mounted () {
    this.$store.dispatch('common:setTitle', {
      section: this.$t('settings'),
      subSection: this.$t('siteData'),
    });
  },
};
</script>

<style scoped>

</style>
