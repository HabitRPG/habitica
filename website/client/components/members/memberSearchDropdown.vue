<template lang="pug">
b-dropdown.create-dropdown(:text="text", no-flip)
  input.form-control(type='text', v-model='searchTerm')
  b-dropdown-item(v-for="member in memberResults", :key="member._id", @click="selectMember(member)")
    | {{ member.profile.name }}
</template>

<style lang="scss" scoped>
</style>

<script>
// @TODO: how do we subclass this rather than type checking?
import challengeMemberSearchMixin from 'client/mixins/challengeMemberSearch';

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
  },
};
</script>
