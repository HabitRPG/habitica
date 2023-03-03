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
        <tr>
          <td colspan="3">
          </td>
        </tr>
      </table>
    </div>
  </div>
</template>

<script>
import UserIdRow from '@/pages/settings/siteDataRows/userIdRow.vue';

export default {
  components: { UserIdRow },

};
</script>

<style scoped>

</style>
