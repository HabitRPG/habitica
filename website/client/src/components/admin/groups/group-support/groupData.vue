<template>
  <form>
    <form-row
      v-model="group.name"
      :label="$t('groupName')"
    />
    <form-row
      v-model="group.summary"
      :label="$t('guildSummary')"
      input-type="textarea"
    />
    <form-row
      v-model="group.description"
      :label="$t('groupDescription')"
      input-type="textarea"
      rows="6"
    />
    <form-row
      v-model="group.bannedWordsAllowed"
      :label="$t('bannedWordsAllowed')"
      input-type="checkbox"
    />
    <form-row
      v-model="group.leaderOnly.challenges"
      :label="$t('leaderOnlyChallenges')"
      input-type="checkbox"
    />
  </form>
</template>

<script>
import formRow from '@/components/admin/formRow.vue';

export default {
  components: {
    formRow,
  },
  props: {
    group: {
      type: Object,
      required: true,
    },
  },
};
</script>
