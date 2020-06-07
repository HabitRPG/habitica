<template>
  <b-dropdown
    class="create-dropdown"
    :text="text"
    no-flip="no-flip"
    @show="$emit('opened')"
  >
    <b-dropdown-form
      :disabled="false"
      @submit.prevent="onSubmit"
    >
      <input
        v-model="searchTerm"
        class="form-control member-input"
        type="text"
      >
    </b-dropdown-form>
    <loading-gryphon
      v-if="loading"
      :height="32"
    />
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
.create-dropdown ::v-deep form.b-dropdown-form {
  padding-left: 8px;
  padding-right: 8px;
}

.create-dropdown ::v-deep ul.dropdown-menu {
  width: 100%;
}
</style>

<script>
// @TODO: how do we subclass this rather than type checking?
import challengeMemberSearchMixin from '@/mixins/challengeMemberSearch';
import loadingGryphon from '@/components/ui/loadingGryphon';

export default {
  components: {
    loadingGryphon,
  },
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
  computed: {
    loading () {
      return this.$store.state.memberModalOptions.loading;
    },
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
