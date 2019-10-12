<template>
  <b-dropdown
    class="select-member"
    :text="text"
  >
    <input
      v-model="searchTerm"
      class="form-control"
      type="text"
    >
    <b-dropdown-item
      v-for="member in memberResults"
      :key="member._id"
      @click="selectMember(member)"
    >
      {{ member.profile.name }}
    </b-dropdown-item>
  </b-dropdown>
</template>

<style lang="scss" scoped>
  .select-member {
    width: 100%;
  }
</style>

<script>
// @TODO: how do we subclass the other member search or compose?
import debounce from 'lodash/debounce';

export default {
  props: {
    text: {
      type: String,
      required: true,
    },
    members: {
      type: Array,
      required: true,
    },
    groupId: {
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
    searchTerm: debounce(function searchTerm (newSearch) {
      this.searchMember(newSearch);
    }, 500),
  },
  mounted () {
    this.memberResults = this.members;
  },
  methods: {
    selectMember (member) {
      this.$emit('member-selected', member);
    },
    async searchMember (search) {
      this.memberResults = await this.$store.dispatch('members:getGroupMembers', {
        groupId: this.groupId,
        searchTerm: search,
      });
    },
  },
};
</script>
