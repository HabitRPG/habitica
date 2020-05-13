<template>
  <b-dropdown
    class="create-dropdown"
    :text="text"
    no-flip="no-flip"
  >
    <b-dropdown-form
      :disabled="false"
      @submit.prevent="onSubmit"
    >
      <input
        v-model="searchTerm"
        class="form-control"
        type="text"
      >
    </b-dropdown-form>
    <b-dropdown-item
      v-for="member in memberResults"
      :key="member._id"
      @click="selectMember(member)"
    >
      {{ memberName(member) }}
    </b-dropdown-item>
  </b-dropdown>
</template>

<style lang="scss" scoped>
</style>

<script>
// @TODO: how do we subclass this rather than type checking?
import challengeMemberSearchMixin from '@/mixins/challengeMemberSearch';

export default {
  mixins: [challengeMemberSearchMixin],
  props: {
    text: {
      type: String,
      required: true,
    },
    members: {
      type: Array,
      required: true,
    },
    challengeId: {
      type: String,
    },
  },
  data () {
    return {
      searchTerm: '',
      memberResults: [],
    };
  },
  watch: {
    memberResults () {
      if (this.memberResults.length > 10) this.memberResults.length = 10;
    },
  },
  methods: {
    selectMember (member) {
      this.$emit('member-selected', member);
    },
    memberName (member) {
      if (member.auth.local && member.auth.local.username) {
        return `@${member.auth.local.username}`;
      }
      return member.profile.name;
    },
  },
};
</script>
