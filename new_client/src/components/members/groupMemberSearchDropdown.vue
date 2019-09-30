<template lang="pug">
b-dropdown.select-member(:text="text")
  input.form-control(type='text', v-model='searchTerm')
  b-dropdown-item(v-for="member in memberResults", :key="member._id", @click="selectMember(member)")
    | {{ member.profile.name }}
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
  mounted () {
    this.memberResults = this.members;
  },
  watch: {
    searchTerm: debounce(function searchTerm (newSearch) {
      this.searchMember(newSearch);
    }, 500),
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
