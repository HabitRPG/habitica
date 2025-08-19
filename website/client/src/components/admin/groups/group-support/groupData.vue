<template>
  <form>
    <form-row
      v-model="group.name"
      :label="$t('groupName')"
      />
    <form-row
      v-model="group.summary || ''"
      :label="$t('guildSummary')"
      inputType="textarea"
      />
    <form-row
      v-model="group.description || ''"
      :label="$t('groupDescription')"
      inputType="textarea"
      rows="6"
      />
    <form-row
      v-model="group.bannedWordsAllowed || false"
      :label="$t('bannedWordsAllowed')"
      inputType="checkbox" />
    <form-row
      v-model="group.leaderOnly.challenges || false"
      :label="$t('leaderOnlyChallenges')"
      inputType="checkbox" />
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