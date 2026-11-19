<template>
  <form>
    <form-row
      v-model="editedGroup.name"
      :label="$t('groupName')"
    />
    <form-row
      v-model="editedGroup.summary"
      :label="$t('guildSummary')"
      input-type="textarea"
    />
    <form-row
      v-model="editedGroup.description"
      :label="$t('groupDescription')"
      input-type="textarea"
      rows="6"
    />
    <form-row
      v-model="editedGroup.bannedWordsAllowed"
      :label="$t('bannedWordsAllowed')"
      input-type="checkbox"
    />
    <form-row
      v-model="editedGroup.leaderOnly.challenges"
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
  data () {
    return {
      editedGroup: { ...this.group },
    };
  },
};
</script>
